import { Board } from "./types/Board";

declare global {
  interface Window {
    electronAPI: {
      selectBoard: (board: Board) => void;
      flash: () => void;
      handleFlashComplete: (cb: () => void) => () => void;
      handleFlashError: (cb: () => void) => () => void;
      handleStdout: (cb: (event: any, data: string) => void) => () => void;
      handleStderr: (cb: (event: any, data: string) => void) => () => void;
      handleError: (cb: (event: any, data: string) => void) => () => void;
    };
  }
}
