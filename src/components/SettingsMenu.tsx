import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { Translate } from "./Translate";
import { AssetStatus, AssetsStatus } from "../types/Assets";

type DownloadStatus = "idle" | "downloading" | "done" | "error";

function formatSize(size: number | null) {
  if (size === null) return "";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} kB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoDate: string | null) {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString();
}

function AssetRow({
  asset,
  kind,
  disabled,
  active,
  onDownload,
}: {
  asset: AssetStatus;
  kind: "flasher" | "firmware";
  disabled: boolean;
  active: boolean;
  onDownload: (kind: "flasher" | "firmware", key: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 border-2 border-black rounded-xl px-3 py-2 bg-white shadow-sticker-sm">
      <div className="grow min-w-0">
        <div className="font-display font-bold truncate">{asset.name}</div>
        <div className="text-sm font-mono truncate">
          {asset.fileName}
          {asset.installed && asset.size !== null && (
            <span className="text-gray-500"> · {formatSize(asset.size)}</span>
          )}
          {asset.installed && (asset.downloadedAt || asset.modifiedAt) && (
            <span className="text-gray-500">
              {" "}
              · {formatDate(asset.downloadedAt ?? asset.modifiedAt)}
            </span>
          )}
        </div>
      </div>
      {asset.installed ? (
        <span className="shrink-0 border-2 border-black rounded-lg bg-fri3d-mint px-2 py-0.5 text-sm font-bold">
          {asset.version ?? <Translate item="versionUnknown" />}
        </span>
      ) : (
        <span className="shrink-0 border-2 border-black rounded-lg bg-fri3d-red text-white px-2 py-0.5 text-sm font-bold">
          <Translate item="statusMissing" />
        </span>
      )}
      <Button
        className="shrink-0 px-3! py-1! text-base! shadow-none!"
        disabled={disabled}
        onClick={() => onDownload(kind, asset.key)}
      >
        {active ? (
          <Translate item="downloadBusy" />
        ) : (
          <Translate item="downloadItemButton" />
        )}
      </Button>
    </div>
  );
}

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [logs, setLogs] = useState("");
  const [assets, setAssets] = useState<AssetsStatus | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  function refreshAssets() {
    window.electronAPI.getAssetsStatus().then(setAssets);
  }

  useEffect(() => {
    const removeProgressListener = window.electronAPI.handleDownloadProgress(
      (_, data: string) => {
        setLogs((logs) => logs + data);
        scrollToBottom();
      }
    );
    const removeCompleteListener = window.electronAPI.handleDownloadComplete(
      () => {
        setStatus("done");
        setActiveItem(null);
        refreshAssets();
      }
    );
    const removeErrorListener = window.electronAPI.handleDownloadError(() => {
      setStatus("error");
      setActiveItem(null);
      refreshAssets();
    });
    return () => {
      removeProgressListener();
      removeCompleteListener();
      removeErrorListener();
    };
  }, []);

  useEffect(() => {
    if (open) {
      refreshAssets();
    }
  }, [open]);

  function scrollToBottom() {
    if (!textAreaRef.current) {
      return;
    }
    textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
  }

  function startDownload() {
    setLogs("");
    setStatus("downloading");
    setActiveItem("all");
    window.electronAPI.downloadAssets();
  }

  function startDownloadItem(kind: "flasher" | "firmware", key: string) {
    setLogs("");
    setStatus("downloading");
    setActiveItem(`${kind}:${key}`);
    window.electronAPI.downloadAsset(kind, key);
  }

  const downloading = status === "downloading";

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
        onClose={() => !downloading && setOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50" />

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="w-[85vw] max-w-4xl max-h-[90vh] overflow-y-auto space-y-4 border-2 border-black bg-white text-black p-8 rounded-2xl shadow-sticker">
            <DialogTitle className="text-3xl font-display font-bold">
              <Translate item="settingsTitle" />
            </DialogTitle>
            <p>
              <Translate item="settingsExplanation" />
            </p>

            {assets && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-display font-bold">
                    <Translate item="settingsFlashersTitle" />
                  </h3>
                  {assets.flashers.map((flasher) => (
                    <AssetRow
                      key={flasher.key}
                      asset={flasher}
                      kind="flasher"
                      disabled={downloading}
                      active={activeItem === `flasher:${flasher.key}`}
                      onDownload={startDownloadItem}
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-display font-bold">
                    <Translate item="settingsFirmwareTitle" />
                  </h3>
                  {assets.firmware.map((firmware) => (
                    <AssetRow
                      key={firmware.key}
                      asset={firmware}
                      kind="firmware"
                      disabled={downloading}
                      active={activeItem === `firmware:${firmware.key}`}
                      onDownload={startDownloadItem}
                    />
                  ))}
                </div>
              </div>
            )}

            {status === "done" && (
              <p className="font-bold text-fri3d-mint-dark">
                <Translate item="downloadDone" />
              </p>
            )}
            {status === "error" && (
              <p className="font-bold text-fri3d-red">
                <Translate item="downloadFailed" />
              </p>
            )}

            <textarea
              ref={textAreaRef}
              readOnly
              className="border-2 border-black w-full h-[20vh] bg-fri3d-darkgrey px-4 py-2 text-white rounded-xl resize-none font-mono text-sm"
              value={logs}
            />

            <div className="flex gap-4">
              <Button onClick={startDownload} disabled={downloading}>
                {downloading && activeItem === "all" ? (
                  <Translate item="downloadBusy" />
                ) : (
                  <Translate item="downloadAllButton" />
                )}
              </Button>
              <Button
                className="bg-white! hover:bg-gray-100!"
                onClick={() => setOpen(false)}
                disabled={downloading}
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
