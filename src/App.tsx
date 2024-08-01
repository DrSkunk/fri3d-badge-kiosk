import { Button } from "@headlessui/react";
import { useEffect, useState } from "react";
import { SelectPort } from "./components/SelectPort";

enum Step {
  CHOOSE_BOARD,
  CONNECT_BOARD,
  CHOOSE_FIRMWARE,
  FLASH_FIRMWARE,
  DONE,
}

enum FlashType {
  ESP,
  AVR,
  LANA,
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
    FlashType: FlashType.ESP,
    firmwares: {
      retroGo: {
        name: "RetroGo",
        link: "retrogo.zip",
      },
      microPython: {
        name: "MicroPython",
        image: "micropython.webp",
      },
    },
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
            onClick={() => setBadge(board.key)}
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

function ChooseFirmware({ board, setFirmware }) {
  return <div> firmware</div>;
}

export function App() {
  const [step, setStep] = useState(Step.CHOOSE_BOARD);
  const [board, setBoard] = useState(null);
  const [port, setPort] = useState(null);
  const [firmware, setFirmware] = useState(null);

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
        <ChooseFirmware board={board} setFirmware={setFirmware} />
      )}
    </div>
  );
}
