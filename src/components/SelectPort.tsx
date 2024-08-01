import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { useState, useEffect } from "react";
import { listPorts } from "../lib/ListPorts";

export function SelectPort({ open, close, setPort }) {
  const [portList, setPortList] = useState([]);
  // const [port, setPort] = useState(null);

  useEffect(() => {
    listPorts("serial").then((ports) => {
      setPortList(ports);
    });
  }, []);

  async function connect() {
    const ports = await listPorts("serial");
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
                key={port}
                onClick={() => setPort(port)}
              >
                {port}
              </button>
            ))}
          </div>
          <button onClick={connect}>Connect</button>
          <div className="flex gap-4">
            <button onClick={close}>Cancel</button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
