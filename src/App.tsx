import { Button } from "@headlessui/react";
import { useEffect, useState } from "react";
import { SelectPort } from "./components/SelectPort";
import { ErrorOverlay } from "./components/ErrorOverlay";

enum Step {
  CHOOSE_BOARD,
  CONNECT_BOARD,
  CHOOSE_FIRMWARE,
  FLASH_FIRMWARE,
  DONE,
}

enum FlashType {
  ESP = "esptool",
  AVR = "avrdude",
  LANA = "wchisp",
}

const boards = [
  {
    name: "Badge 2022",
    key: "badge_2022",
    image: "badge_2022.webp",
    flashType: FlashType.ESP,
  },
  {
    name: "Blaster 2022",
    key: "blaster_2022",
    image: "blaster_2022.webp",
    flashType: FlashType.AVR,
  },
  {
    name: "Badge 2024",
    key: "badge_2024",
    image: "badge_2024.webp",
    flashType: FlashType.ESP,
  },
  {
    name: "Blaster 2024",
    key: "blaster_2024",
    image: "blaster_2024.webp",
    flashType: FlashType.LANA,
  },
];

function Flashable({ src, alt, onClick }) {
  return (
    <div className="border rounded-lg hover:scale-105" onClick={onClick}>
      <h2 className="text-2xl mb-2 text-center">{alt}</h2>
      <img
        src={src}
        alt={alt}
        className="bg-white aspect-square object-cover rounded-b-lg border"
      />
    </div>
  );
}

function ChooseBadge({ setBadge }) {
  return (
    <>
      <h1 className="text-3xl">Kies wat je wil fixen</h1>
      <div className="grid grid-cols-4 gap-4 m-4">
        {boards.map((board) => (
          <Flashable
            key={board.key}
            src={board.image}
            alt={board.name}
            onClick={() => setBadge(board)}
          />
        ))}
      </div>
    </>
  );
}

function ConnectBoard({ board, setPort, nextStep }) {
  const [showSelectPortDialog, setShowSelectPortDialog] = useState(false);

  return (
    <div>
      <p>Attach {board.name} to the computer and click "Connect"</p>
      <p>Then choose ""</p>
      <Button
        className="border px-4 py-2 rounded hover:bg-slate-200"
        onClick={() => setShowSelectPortDialog(true)}
      >
        Connect
      </Button>
      <SelectPort
        open={showSelectPortDialog}
        setPort={setPort}
        close={() => {
          setShowSelectPortDialog(false);
          nextStep();
        }}
      />
    </div>
  );
}

function Flash({ board, port, nextStep }) {
  const [logs, setLogs] = useState("Ready!\n");

  useEffect(() => {
    window.electronAPI.handleFlashComplete(() => {
      // nextStep();
    });
    window.electronAPI.handleStdout((_, data: string) => {
      setLogs((logs) => data + logs);
    });
    window.electronAPI.handleStderr((_, data: string) => {
      setLogs((logs) => data + logs);
    });
  }, []);

  function startFlash() {
    window.electronAPI.flash(board.flashType, port, "test");
    console.log("Start flashing");
  }

  return (
    <div className="flex flex-col">
      firmware <Button onClick={startFlash}>startFlash</Button>
      <textarea readOnly className="border w-96 h-72" value={logs} />
    </div>
  );
}

function Done({ nextStep }: { nextStep: () => void }) {
  return (
    <div>
      <h1>Klaar!</h1>
      <div>Je kan nu weer verder.</div>
      <Button onClick={nextStep}>Terug naar het begin</Button>
    </div>
  );
}

export function App() {
  const [step, setStep] = useState(Step.CHOOSE_BOARD);
  const [board, setBoard] = useState(null);
  const [port, setPort] = useState(null);
  const [firmware, setFirmware] = useState(null);

  useEffect(() => {
    window.electronAPI.handleStdout((_, data: string) => {
      console.log("stdout", data);
    });
    window.electronAPI.handleStderr((_, data: string) => {
      console.error("stderr", data);
    });
  }, []);

  useEffect(() => {
    if (board) {
      setStep(Step.CONNECT_BOARD);
    }
  }, [board]);

  useEffect(() => {
    console.log("Port", port);
  }, [port]);

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen">
      <ErrorOverlay />
      {step === Step.CHOOSE_BOARD && <ChooseBadge setBadge={setBoard} />}
      {step === Step.CONNECT_BOARD && (
        <ConnectBoard
          board={board}
          setPort={setPort}
          nextStep={() => {
            setStep(Step.CHOOSE_FIRMWARE);
          }}
        />
      )}
      {step == Step.CHOOSE_FIRMWARE && (
        <Flash
          board={board}
          port={port}
          nextStep={() => {
            setStep(Step.DONE);
          }}
        />
      )}
      {step === Step.DONE && (
        <Done
          nextStep={() => {
            setStep(Step.CHOOSE_BOARD);
          }}
        />
      )}
      {/* <pre className="static left-0 bottom-0">
        {JSON.stringify(
          {
            step,
            board,
            firmware,
          },
          null,
          2
        )}
      </pre> */}
    </div>
  );
}
