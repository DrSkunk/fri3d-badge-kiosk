import { Board } from "./types/Board";

const callBacks: {
  handleFlashComplete: (() => void)[];
  handleFlashError: (() => void)[];
  handleStdout: ((event: any, data: string) => void)[];
  handleStderr: ((event: any, data: string) => void)[];
  handleError: ((event: any, data: string) => void)[];
  handleDownloadProgress: ((event: any, data: string) => void)[];
  handleDownloadComplete: (() => void)[];
  handleDownloadError: (() => void)[];
} = {
  handleFlashComplete: [],
  handleFlashError: [],
  handleStdout: [],
  handleStderr: [],
  handleError: [],
  handleDownloadProgress: [],
  handleDownloadComplete: [],
  handleDownloadError: [],
};

function callCallbacks(
  callbacks: ((...args: any[]) => void)[],
  ...args: any[]
) {
  for (const cb of callbacks) {
    if (args.length === 0) {
      cb();
    } else {
      cb(false, ...args);
    }
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

function downloadAssets() {
  console.log("Download assets!");
  const steps = [
    "Downloading flashers...\n",
    "Downloading esptool...\n",
    "Downloading avrdude...\n",
    "Downloading wchisp...\n",
    "Downloading firmware...\n",
    "All downloads finished!\n",
  ];
  steps.forEach((step, index) => {
    setTimeout(() => {
      callCallbacks(callBacks.handleDownloadProgress, step);
    }, 400 * (index + 1));
  });
  setTimeout(() => {
    callCallbacks(callBacks.handleDownloadComplete);
  }, 400 * (steps.length + 1));
}

function makeHandler<T extends (...args: any[]) => void>(
  key: keyof typeof callBacks
) {
  return (cb: T): (() => void) => {
    (callBacks[key] as T[]).push(cb);
    return () => {
      (callBacks[key] as T[]) = (callBacks[key] as T[]).filter(
        (callback) => callback !== cb
      );
    };
  };
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
  downloadAssets,
  handleFlashComplete,
  handleFlashError,
  handleStdout,
  handleStderr,
  handleError,
  handleDownloadProgress: makeHandler<(event: any, data: string) => void>(
    "handleDownloadProgress"
  ),
  handleDownloadComplete: makeHandler<() => void>("handleDownloadComplete"),
  handleDownloadError: makeHandler<() => void>("handleDownloadError"),
};
