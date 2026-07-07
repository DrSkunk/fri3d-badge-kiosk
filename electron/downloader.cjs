const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const { platform, arch } = require("process");
const EventEmitter = require("node:events");
const extractZip = require("extract-zip");
const { loadBoardsManifest } = require("./flasher.cjs");

const events = new EventEmitter();

function progress(message) {
  events.emit("progress", message);
}

// Where to get the flashing tools. Assets are resolved through the GitHub
// "latest release" API and matched per platform-arch. Version numbers in
// asset names are matched with a wildcard so new releases keep working.
const FLASHER_SOURCES = {
  esptool: {
    repo: "espressif/esptool",
    assetPatterns: {
      "win32-x64": /^esptool(-v[\d.]+)?-windows-amd64\.zip$/,
      "darwin-x64": /^esptool(-v[\d.]+)?-macos-amd64\.tar\.gz$/,
      "darwin-arm64": /^esptool(-v[\d.]+)?-macos-arm64\.tar\.gz$/,
      "linux-x64": /^esptool(-v[\d.]+)?-linux-amd64\.tar\.gz$/,
      "linux-arm64": /^esptool(-v[\d.]+)?-linux-aarch64\.tar\.gz$/,
    },
  },
  avrdude: {
    repo: "avrdudes/avrdude",
    assetPatterns: {
      "win32-x64": /^avrdude(-v[\d.]+)?-windows-x64\.zip$/,
      "win32-arm64": /^avrdude(-v[\d.]+)?-windows-arm64\.zip$/,
      // Only a single 64bit macOS build is published, it runs on Apple
      // Silicon through Rosetta.
      "darwin-x64": /^avrdude_v[\d.]+_macOS_64bit\.tar\.gz$/,
      "darwin-arm64": /^avrdude_v[\d.]+_macOS_64bit\.tar\.gz$/,
      "linux-x64": /^avrdude_v[\d.]+_Linux_64bit\.tar\.gz$/,
      "linux-arm64": /^avrdude_v[\d.]+_Linux_ARM64\.tar\.gz$/,
    },
  },
  wchisp: {
    repo: "ch32-rs/wchisp",
    assetPatterns: {
      "win32-x64": /^wchisp(-v[\d.]+)?-win-x64\.zip$/,
      "darwin-x64": /^wchisp(-v[\d.]+)?-macos-x64\.tar\.gz$/,
      "darwin-arm64": /^wchisp(-v[\d.]+)?-macos-arm64\.tar\.gz$/,
      "linux-x64": /^wchisp(-v[\d.]+)?-linux-x64\.tar\.gz$/,
      "linux-arm64": /^wchisp(-v[\d.]+)?-linux-aarch64\.tar\.gz$/,
    },
  },
};

const FETCH_HEADERS = {
  // GitHub rejects requests without a user agent
  "User-Agent": "fri3d-badge-kiosk",
};

async function fetchLatestRelease(repo) {
  const response = await fetch(
    `https://api.github.com/repos/${repo}/releases/latest`,
    { headers: { ...FETCH_HEADERS, Accept: "application/vnd.github+json" } }
  );
  if (!response.ok) {
    throw new Error(
      `Could not fetch latest release of ${repo} (HTTP ${response.status})`
    );
  }
  return response.json();
}

async function downloadFile(url, destination) {
  const response = await fetch(url, { headers: FETCH_HEADERS });
  if (!response.ok) {
    throw new Error(`Download failed (HTTP ${response.status}): ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.promises.writeFile(destination, buffer);
}

async function extractArchive(archivePath, destination) {
  await fs.promises.mkdir(destination, { recursive: true });
  if (archivePath.endsWith(".zip")) {
    await extractZip(archivePath, { dir: path.resolve(destination) });
    return;
  }
  await new Promise((resolve, reject) => {
    const child = spawn("tar", ["-xzf", archivePath, "-C", destination]);
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Extracting ${archivePath} failed (tar exit ${code})`));
      }
    });
  });
}

function findFile(directory, names) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const found = findFile(fullPath, names);
      if (found) return found;
    } else if (names.includes(entry.name)) {
      return fullPath;
    }
  }
  return null;
}

async function withTempDir(callback) {
  const tempDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "fri3d-download-")
  );
  try {
    return await callback(tempDir);
  } finally {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  }
}

async function downloadFlasher(name) {
  const { repo, assetPatterns } = FLASHER_SOURCES[name];
  // Fall back to the x64 build for platforms without a native build
  const pattern = assetPatterns[`${platform}-${arch}`] || assetPatterns[`${platform}-x64`];
  if (!pattern) {
    throw new Error(`No ${name} build available for ${platform}-${arch}`);
  }

  progress(`Looking up latest release of ${repo}...\n`);
  const release = await fetchLatestRelease(repo);
  const asset = release.assets.find((asset) => pattern.test(asset.name));
  if (!asset) {
    throw new Error(
      `No matching asset for ${platform}-${arch} in ${repo} ${release.tag_name}`
    );
  }

  return withTempDir(async (tempDir) => {
    progress(`Downloading ${asset.name} (${release.tag_name})...\n`);
    const archivePath = path.join(tempDir, asset.name);
    await downloadFile(asset.browser_download_url, archivePath);

    progress(`Extracting ${asset.name}...\n`);
    const extractDir = path.join(tempDir, "extracted");
    await extractArchive(archivePath, extractDir);

    const binaryName = platform === "win32" ? `${name}.exe` : name;
    const binaryPath = findFile(extractDir, [binaryName]);
    if (!binaryPath) {
      throw new Error(`Could not find ${binaryName} inside ${asset.name}`);
    }

    const target = path.resolve("flashers", binaryName);
    await fs.promises.copyFile(binaryPath, target);
    if (platform !== "win32") {
      await fs.promises.chmod(target, 0o755);
    }
    progress(`Installed ${binaryName} into "flashers" directory\n`);
    return target;
  });
}

async function downloadFlashers() {
  await fs.promises.mkdir(path.resolve("flashers"), { recursive: true });
  for (const name of Object.keys(FLASHER_SOURCES)) {
    await downloadFlasher(name);
  }
}

function resolveEsptool() {
  const candidates =
    platform === "win32" ? ["esptool.exe"] : ["esptool", "esptool.py"];
  for (const candidate of candidates) {
    const fullPath = path.resolve("flashers", candidate);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  // Fall back to whatever is in PATH
  return "esptool";
}

// Download a zip with separate bootloader/partition-table/application
// binaries plus a flash_args file, and merge them into a single image
// that can be flashed at offset 0x0.
async function downloadAndMergeEspZip(board, destination) {
  return withTempDir(async (tempDir) => {
    const archivePath = path.join(tempDir, "firmware.zip");
    await downloadFile(board.download.url, archivePath);

    const extractDir = path.join(tempDir, "extracted");
    await extractArchive(archivePath, extractDir);

    const flashArgsPath = findFile(extractDir, ["flash_args"]);
    if (!flashArgsPath) {
      throw new Error(`No flash_args file found in firmware zip of ${board.name}`);
    }
    const baseDir = path.dirname(flashArgsPath);
    const flashArgs = await fs.promises.readFile(flashArgsPath, "utf-8");

    const sections = [];
    let flashMode = "dio";
    let flashFreq = "40m";
    let flashSize = "detect";
    for (const line of flashArgs.split("\n")) {
      const sectionMatch = line.trim().match(/^(0x[0-9a-fA-F]+)\s+(.+)$/);
      if (sectionMatch) {
        sections.push([sectionMatch[1], path.join(baseDir, sectionMatch[2])]);
        continue;
      }
      flashMode = line.match(/--flash_mode\s+(\S+)/)?.[1] ?? flashMode;
      flashFreq = line.match(/--flash_freq\s+(\S+)/)?.[1] ?? flashFreq;
      flashSize = line.match(/--flash_size\s+(\S+)/)?.[1] ?? flashSize;
    }
    if (sections.length === 0) {
      throw new Error(`No flash sections found in flash_args of ${board.name}`);
    }

    progress(`Merging ${sections.length} parts into ${board.firmware}...\n`);
    const mergeArgs = [
      "--chip",
      board.download.chip || "esp32",
      "merge_bin",
      "-o",
      destination,
      "--flash_mode",
      flashMode,
      "--flash_freq",
      flashFreq,
      "--flash_size",
      flashSize,
      ...sections.flat(),
    ];
    await new Promise((resolve, reject) => {
      const child = spawn(resolveEsptool(), mergeArgs);
      child.stdout.on("data", (data) => progress(data.toString()));
      child.stderr.on("data", (data) => progress(data.toString()));
      child.on("error", reject);
      child.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`esptool merge_bin failed (exit ${code})`));
        }
      });
    });
  });
}

async function downloadFirmware() {
  await fs.promises.mkdir(path.resolve("firmware"), { recursive: true });
  const boards = await loadBoardsManifest();
  for (const board of boards) {
    const { name, firmware, download } = board;
    if (!download) {
      progress(`No download source configured for ${name}, skipping\n`);
      continue;
    }
    progress(`Downloading firmware for ${name}...\n`);
    const destination = path.resolve("firmware", firmware);
    if (download.type === "url") {
      await downloadFile(download.url, destination);
    } else if (download.type === "esp-zip") {
      await downloadAndMergeEspZip(board, destination);
    } else {
      throw new Error(`Unknown download type "${download.type}" for ${name}`);
    }
    progress(`Saved ${firmware}\n`);
  }
}

async function downloadAll() {
  progress("Downloading flashers...\n");
  await downloadFlashers();
  progress("Downloading firmware...\n");
  await downloadFirmware();
  progress("All downloads finished!\n");
}

module.exports = {
  downloadAll,
  events,
};
