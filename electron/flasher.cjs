const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { exec, spawn } = require("child_process");
const { platform } = require("process");
const commandExists = require("command-exists");
const EventEmitter = require("node:events");
const boardsManifest = require("../public/boards/index.json");

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
    child.on("close", (code) => {
      resolve(code);
    });
  });
}

const execPromise = promisify(exec);

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
      "flash:w:{{FIRMWARE}}:r",
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

async function initialise() {
  let missingFlashers = [];
  for (const flasher of Object.entries(flashers)) {
    const [name, { executable }] = flasher;

    // First check if the executable is available in the flashers directory
    let executablePath = path.resolve("flashers", executable);
    if (platform === "win32") {
      executablePath += ".exe";
      // not on windows, then esptool probably is "esptool.py"
    } else if (name === ChipType.ESPTOOL) {
      executablePath += ".py";
    }
    console.log("Checking", executablePath);
    if (fs.existsSync(executablePath)) {
      flashers[name].executable = executablePath;
      continue;
    }
    // Otherwise check if it's available in the PATH
    try {
      await commandExists(executable);
      flashers[name].executable = executable;
      continue;
    } catch (error) {
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
  const { chipType, firmware } = selectedBoard;
  const firmwarePath = path.resolve("firmware", firmware);
  const flashOptions = flashers[chipType].flashOptions.map((option) => {
    return option.replace("{{FIRMWARE}}", firmwarePath);
  });

  // check if file exists

  const exitCode = await spawnEmitter(
    flashers[chipType].executable,
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
  stdout: stdoutEvents,
  stderr: stderrEvents,
};
