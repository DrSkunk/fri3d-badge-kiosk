import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { useState, useEffect } from "react";
import { Translate } from "./Translate";

export function ErrorOverlay() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return window.electronAPI.handleError((_, error) => {
      setOpen(true);
      setError(error);
    });
  }, []);

  function close() {
    setOpen(false);
    setError("");
  }

  return (
    <Dialog open={open} onClose={close} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="max-w-lg space-y-4 border-2 border-black rounded-2xl shadow-sticker bg-white text-black p-12">
          <DialogTitle className="font-display font-bold text-2xl text-fri3d-red">
            Error
          </DialogTitle>
          <p>{error}</p>
          <div className="flex gap-4">
            <button
              className="border-2 border-black rounded-xl px-4 py-2 font-display font-bold bg-white shadow-sticker-sm transition active:translate-x-1 active:translate-y-1 active:shadow-none"
              onClick={close}
            >
              <Translate item="closeErrorDialog" />
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
