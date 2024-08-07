const { exec, spawn } = require("child_process");
const EventEmitter = require("node:events");

async function spawnEmitter(command, options, emitter) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, options);
    child.stdout.on("data", (data) => {
      emitter.emit("stdout", data.toString());
    });
    child.stderr.on("data", (data) => {
      emitter.emit("stderr", data.toString());
    });
    child.on("close", (code) => {
      emitter.emit("close", code);
      console.log("Closed with code", code);
      resolve(code);
    });
  });
}

async function main() {
  console.log(" ---- Started ---- ");
  const emitter = new EventEmitter();
  emitter.on("stdout", (data) => {
    console.log(data);
  });
  emitter.on("stderr", (data) => {
    console.error(data);
  });
  const wchisp =
    "/Users/sebastiaanjansen/github.com/drskunk/fri3d-badge-kiosk/flashers/wchisp";
  await spawnEmitter(
    wchisp,
    ["flash", "../firmware/flamingo/Blaster2024.hex"],
    emitter
  );
  console.log(" ---- Finished ---- ");
}
main();
