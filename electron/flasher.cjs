const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { exec } = require("child_process");
const { platform } = require("process");
const commandExists = require("command-exists");
// const { SerialPort } = require("serialport");

const execPromise = promisify(exec);

const ChipType = {
  AVRDUDE: "avrdude",
  ESPTOOL: "esptool",
  WCHISP: "wchisp",
};

const PortType = {
  SERIAL: "serial",
  WCHISP: "wchisp",
};

const flashers = {
  [ChipType.AVRDUDE]: {
    portType: PortType.SERIAL,
    executable: "avrdude",
    flashOptions: "",
  },
  [ChipType.ESPTOOL]: {
    portType: PortType.SERIAL,
    executable: "esptool.py",
    flashOptions: "",
  },
  [ChipType.WCHISP]: {
    portType: PortType.WCHISP,
    executable: "wchisp",
    flashOptions: "",
  },
};

async function initialise() {
  let missingFlashers = [];
  for (const flasher of Object.entries(flashers)) {
    const [name, { executable }] = flasher;

    // First check if the executable is available in the flashers directory
    const executablePath = path.resolve("flashers", executable);
    if (fs.existsSync(executablePath)) {
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
}

async function execute(chipType, args) {
  let command = `${flashers[chipType].executable}`;
  if (args) {
    command += ` ${args}`;
  }
  return execPromise(command);
}

async function getPorts(portType) {
  console.log("getPorts", portType, PortType.SERIAL);
  switch (portType) {
    case PortType.SERIAL:
      if (platform === "win32") {
        // use Powershell to list ports
        const { stdout } = await execPromise(
          "Get-WmiObject Win32_SerialPort | Select-Object DeviceID",
          { shell: "powershell.exe" }
        );
        const devices = stdout // remove the header
          .split("\n")
          .slice(1)
          .map((line) => line.trim())
          .filter((line) => line);
        return devices;
        // Probably MacOS or Linux
      } else {
        // use  ls /dev/{tty,cu}.* to list ports
        const lsCommand =
          platform === "darwin" ? "ls /dev/{tty,cu}.*" : "ls /dev/tty*";
        const { stdout } = await execPromise(lsCommand);
        console.log("stdout", stdout);
        const devices = stdout.split("\n").reduce((acc, line) => {
          if (line) {
            acc.push(line);
          }
          return acc;
        }, []);
        return devices;
      }
    // Or just use serialport, but this is harder to package maybe
    // return (await SerialPort.list()).map(({ path }) => path);
    case PortType.WCHISP:
      const { stdout } = await execute(ChipType.WCHISP, "probe");
      const lines = stdout.split("\n");
      const devices = lines.reduce((acc, line) => {
        const deviceMatch = line.match(/Device #\d+: (\S+)/);
        if (deviceMatch) {
          acc.push(deviceMatch[1]);
        }
        return acc;
      }, []);
      return devices;
    default:
      throw new Error(`Unknown port type: ${portType}`);
  }
}

async function flash(chipType, image, port) {
  // Re-evalute with esptool which has multiple files
  const flashString = flashers[chipType].flashOptions
    .replace("{{IMAGE}}", image)
    .replace("{{PORT}}", port);
  return execute(chipType, flashString);
}

module.exports = {
  initialise,
  getPorts,
  flash,
};
