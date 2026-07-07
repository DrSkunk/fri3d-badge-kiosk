const { app } = require("electron");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { platform } = require("process");
const commandExists = require("command-exists");
const EventEmitter = require("node:events");

async function spawnEmitter(command, options, stdout, stderr) {
  return new Promise((resolve, reject) => {
    const completeCommand = `${command} ${options.join(" ")}`;
    stdout.emit("data", `Running command: ${completeCommand}\n`);

    const child = spawn(command, options, { shell: true });
    child.stdout.on("data", (data) => {
      stdout.emit("data", data.toString());
    });
    child.stderr.on("data", (data) => {
      stderr.emit("data", data.toString());
    });
    child.on("error", (error) => {
      stderr.emit("data", `${error.message}\n`);
      reject(error);
    });
    child.on("close", (code) => {
      resolve(code);
    });
  });
}

// Keep in sync with the boards/index.json file
const ChipType = {
  AVR: "AVR",
  ESP: "ESP",
  WCHISP: "WCHISP",
};

const PortType = {
  SERIAL: "serial",
  WCHISP: "wchisp",
};

const flashers = {
  [ChipType.AVR]: {
    portType: PortType.SERIAL,
    executable: "avrdude",
    flashOptions: [
      "-c",
      "usbtiny",
      "-p",
      "m328p",
      "-U",
      "flash:w:{{FIRMWARE}}:i",
      "-vv",
    ],
  },
  [ChipType.ESP]: {
    portType: PortType.SERIAL,
    executable: "esptool",
    flashOptions: [
      "write_flash",
      "--flash_size",
      "detect",
      "0x0",
      "{{FIRMWARE}}",
    ],
  },
  [ChipType.WCHISP]: {
    portType: PortType.WCHISP,
    executable: "wchisp",
    flashOptions: ["flash", "{{FIRMWARE}}"],
  },
};

let selectedBoard = null;

function selectBoard(board) {
  console.log("Selected board", board.name);
  selectedBoard = board;
}

const stdoutEvents = new EventEmitter();
const stderrEvents = new EventEmitter();

async function loadJsonFile(filePath) {
  const data = await fs.promises.readFile(filePath);
  return JSON.parse(data);
}

async function loadBoardsManifest() {
  return app.isPackaged
    ? loadJsonFile("./resources/build-gui/boards/index.json")
    : loadJsonFile("./public/boards/index.json");
}

async function initialise() {
  try {
    fs.mkdirSync(path.resolve("firmware"), { recursive: true });
    fs.mkdirSync(path.resolve("flashers"), { recursive: true });
  } catch (error) {
    console.error("Error creating directories", error);
  }

  let missingFlashers = [];
  for (const [name, { executable }] of Object.entries(flashers)) {
    const candidates = [executable];
    if (platform === "win32") {
      candidates.push(`${executable}.exe`);
      // not on windows, then esptool can also be "esptool.py"
    } else if (name === ChipType.ESP) {
      candidates.push(`${executable}.py`);
    }

    // First check if the executable is available in the flashers directory
    const bundled = candidates
      .map((candidate) => path.resolve("flashers", candidate))
      .find((candidatePath) => fs.existsSync(candidatePath));
    if (bundled) {
      flashers[name].command = bundled;
      continue;
    }

    // Otherwise check if it's available in the PATH
    let foundInPath = null;
    for (const candidate of candidates) {
      try {
        await commandExists(candidate);
        foundInPath = candidate;
        break;
      } catch (error) {
        // keep looking
      }
    }
    if (foundInPath) {
      flashers[name].command = foundInPath;
    } else {
      flashers[name].command = null;
      missingFlashers.push(name);
    }
  }

  if (missingFlashers.length > 0) {
    throw new Error(
      `Missing flashers: ${missingFlashers.join(
        ", "
      )}. Please make them available in PATH or add them to the "flashers" directory.`
    );
  }

  // check if all firmware files are available
  const firmwareDir = path.resolve("firmware");
  const boardsManifest = await loadBoardsManifest();

  let missingFirmware = [];
  for (const board of boardsManifest) {
    const { name, firmware } = board;
    const firmwarePath = path.resolve(firmwareDir, firmware);
    if (!fs.existsSync(firmwarePath)) {
      missingFirmware.push(`${name}, file "${firmware}"`);
    }
  }

  if (missingFirmware.length > 0) {
    throw new Error(
      `Missing firmware for: ${missingFirmware.join(
        ", "
      )}. Please put these inside the "firmware" directory.`
    );
  }
}

async function flash() {
  if (!selectedBoard) {
    throw new Error("No board selected");
  }
  const { chipType, firmware } = selectedBoard;
  if (!flashers[chipType]) {
    throw new Error(`Unknown chip type "${chipType}"`);
  }
  if (!flashers[chipType].command) {
    throw new Error(
      `The ${flashers[chipType].executable} flasher is not available. Download it via the settings menu or add it to the "flashers" directory.`
    );
  }
  const firmwarePath = path.resolve("firmware", firmware);
  if (!fs.existsSync(firmwarePath)) {
    throw new Error(`Firmware file not found: ${firmwarePath}`);
  }
  const flashOptions = flashers[chipType].flashOptions.map((option) => {
    return option.replace("{{FIRMWARE}}", firmwarePath);
  });

  const exitCode = await spawnEmitter(
    flashers[chipType].command,
    flashOptions,
    stdoutEvents,
    stderrEvents
  );
  if (exitCode !== 0) {
    throw new Error(`Failed to flash firmware. Exit code: ${exitCode}`);
  }
  return exitCode;
}

module.exports = {
  initialise,
  flash,
  selectBoard,
  loadBoardsManifest,
  stdout: stdoutEvents,
  stderr: stderrEvents,
};
