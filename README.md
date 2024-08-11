# Fri3d Kiosk Flasher

This is a program to easily repair your board that you bought or received at [Fri3d camp](https://fri3d.be).

Currently Supported:

- Badge 2024
- Blaster 2024
- Communicator 2024
- Badge 2022
- Blaster 2022

## Development

This is an electron app that uses Vite with React Typescript as a frontend.

## To use

Download the latest version for your platform here: https://github.com/DrSkunk/fri3d-badge-kiosk/releases/latest

Add your platform's respective versions of the flashing tools to the `flashers` directory. Or make them available in your path.

Current flashers are:

- avrdude: `avrdude.exe` for Windows, `avrdude` for others
- esptool: `esptool.exe` for Windows, `esptool.py` for others
- [wchisp](https://github.com/ch32-rs/wchisp): `wchisp.exe` for Windows, `wchisp` for others

So for windows you'd need `avrdude.exe`, `esptool.exe` and `wchisp.exe`. inside the `flashers` folder.

Follow the [Boards manifest](./public/boards/index.json) to see which firmwares you have to put in the `firmware` directory.

Currently this is:

- `badge_2024.img`
- `flamingo.hex`
- `communicator.hex`
- `badge_2022.img`
- `blaster.hex`
