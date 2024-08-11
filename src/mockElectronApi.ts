import { Board } from "./types/Board";

const callBacks: {
  handleFlashComplete: (() => void)[];
  handleFlashError: (() => void)[];
  handleStdout: ((event: any, data: string) => void)[];
  handleStderr: ((event: any, data: string) => void)[];
  handleError: ((event: any, data: string) => void)[];
} = {
  handleFlashComplete: [],
  handleFlashError: [],
  handleStdout: [],
  handleStderr: [],
  handleError: [],
};

function callCallbacks(
  callbacks: ((...args: any[]) => void)[],
  ...args: any[]
) {
  for (const cb of callbacks) {
    if (args.length === 0) return cb();
    return cb(false, ...args);
  }
}

function selectBoard(board: Board) {
  console.log("Selected board: ", board);
}

function flash() {
  console.log("Flash!");
  setTimeout(() => {
    callCallbacks(callBacks.handleStderr, "Flashing");
  }, 500);
  setTimeout(() => {
    // Simulate an unsuccessful flash
    callCallbacks(callBacks.handleFlashError);
    // Simulate a successful flash
    // callCallbacks(callBacks.handleFlashComplete);
  }, 1000);
}

function handleFlashComplete(cb: () => void): () => void {
  callBacks.handleFlashComplete.push(cb);
  return () => {
    callBacks.handleFlashComplete = callBacks.handleFlashComplete.filter(
      (callback) => callback !== cb
    );
  };
}

function handleFlashError(cb: () => void): () => void {
  callBacks.handleFlashError.push(cb);
  return () => {
    callBacks.handleFlashError = callBacks.handleFlashError.filter(
      (callback) => callback !== cb
    );
  };
}

function handleStdout(cb: (event: any, data: string) => void): () => void {
  callBacks.handleStdout.push(cb);
  return () => {
    callBacks.handleStdout = callBacks.handleStdout.filter(
      (callback) => callback !== cb
    );
  };
}

function handleStderr(cb: (event: any, data: string) => void): () => void {
  callBacks.handleStderr.push(cb);
  return () => {
    callBacks.handleStderr = callBacks.handleStderr.filter(
      (callback) => callback !== cb
    );
  };
}

function handleError(cb: (event: any, data: string) => void): () => void {
  callBacks.handleError.push(cb);
  return () => {
    callBacks.handleError = callBacks.handleError.filter(
      (callback) => callback !== cb
    );
  };
}

export const electronAPI = {
  selectBoard,
  flash,
  handleFlashComplete,
  handleFlashError,
  handleStdout,
  handleStderr,
  handleError,
};
