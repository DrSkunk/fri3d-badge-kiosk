import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { Translate } from "./Translate";

type DownloadStatus = "idle" | "downloading" | "done" | "error";

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [logs, setLogs] = useState("");

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const removeProgressListener = window.electronAPI.handleDownloadProgress(
      (_, data: string) => {
        setLogs((logs) => logs + data);
        scrollToBottom();
      }
    );
    const removeCompleteListener = window.electronAPI.handleDownloadComplete(
      () => setStatus("done")
    );
    const removeErrorListener = window.electronAPI.handleDownloadError(() =>
      setStatus("error")
    );
    return () => {
      removeProgressListener();
      removeCompleteListener();
      removeErrorListener();
    };
  }, []);

  function scrollToBottom() {
    if (!textAreaRef.current) {
      return;
    }
    textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
  }

  function startDownload() {
    setLogs("");
    setStatus("downloading");
    window.electronAPI.downloadAssets();
  }

  return (
    <>
      <button
        className="fixed top-2 right-2 z-40 text-white opacity-60 hover:opacity-100 hover:rotate-45 transition"
        onClick={() => setOpen(true)}
        aria-label="Settings"
      >
        {/* Heroicons cog-6-tooth */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.111-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      </button>

      <Dialog
        open={open}
        onClose={() => status !== "downloading" && setOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50" />

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="w-[80vw] max-w-3xl space-y-4 border border-gray-600 bg-slate-900 text-white p-8 rounded-lg">
            <DialogTitle className="text-3xl font-bold">
              <Translate item="settingsTitle" />
            </DialogTitle>
            <p>
              <Translate item="settingsExplanation" />
            </p>

            {status === "done" && (
              <p className="text-green-400">
                <Translate item="downloadDone" />
              </p>
            )}
            {status === "error" && (
              <p className="text-red-400">
                <Translate item="downloadFailed" />
              </p>
            )}

            <textarea
              ref={textAreaRef}
              readOnly
              className="border w-full h-[30vh] bg-black px-4 py-2 text-white rounded resize-none font-mono text-sm"
              value={logs}
            />

            <div className="flex gap-4">
              <Button
                onClick={startDownload}
                disabled={status === "downloading"}
              >
                {status === "downloading" ? (
                  <Translate item="downloadBusy" />
                ) : (
                  <Translate item="downloadAllButton" />
                )}
              </Button>
              <Button
                onClick={() => setOpen(false)}
                disabled={status === "downloading"}
              >
                <Translate item="closeErrorDialog" />
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
