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
    window.electronAPI.handleError((_, error) => {
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
      <DialogBackdrop className="fixed inset-0 bg-black/30" />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="max-w-lg space-y-4 border bg-white text-black p-12">
          <DialogTitle className="font-bold">Error</DialogTitle>
          <p>{error}</p>
          <div className="flex gap-4">
            <button onClick={close}>
              <Translate item="closeErrorDialog" />
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
