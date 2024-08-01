import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    electronAPI: {
      handlePortList: (callback: (event: any, portList: any[]) => void) => void;
      selectPort: (portId: string) => void;
    };
  }
}

export function SelectWebSerialPort({ open, close }) {
  const [portList, setPortList] = useState([]);

  useEffect(() => {
    window.electronAPI.handlePortList((_, newPortList) => {
      console.log("received", newPortList);
      setPortList(newPortList);
    });
  }, []);

  function setPort(portId: string) {
    window.electronAPI.selectPort(portId);
    close();
  }

  return (
    <Dialog open={open} onClose={close} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30" />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
          <DialogTitle className="font-bold">Select port</DialogTitle>
          <div className="flex flex-col gap-2">
            {portList.map((port) => (
              <button
                className="border px-4 py-2 hover:bg-gray-200"
                key={port.portId}
                onClick={() => setPort(port.portId)}
              >
                {port.portName}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <button onClick={close}>Cancel</button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
