import { useContext, useEffect, useState } from "react";
import { Board } from "../../types/Board";
import { BoardContext } from "../../context/BoardContext";
import { StepContext } from "../../context/StepContext";
import { Translate } from "../Translate";

const CURRENT_EDITION = 2026;

const EDITION_COLORS = [
  "bg-fri3d-mint",
  "bg-fri3d-orange",
  "bg-fri3d-purple-light",
  "bg-fri3d-red",
];

function BoardCard({
  board,
  onClick,
}: {
  board: Board;
  onClick: (boardKey: string) => void;
}) {
  return (
    <div
      className="w-72 border-2 border-black rounded-2xl bg-white text-black shadow-sticker transition hover:-translate-y-1 hover:rotate-1 cursor-pointer overflow-hidden"
      onClick={() => onClick(board.key)}
    >
      <h2 className="text-2xl py-3 px-2 text-center font-display font-bold">
        {board.name}
      </h2>
      <img
        src={board.image}
        alt={board.name}
        className="bg-gray-100 border-t-2 border-black aspect-square object-cover w-full"
      />
    </div>
  );
}

export function ChooseBoard() {
  const { selectBoard, boards } = useContext(BoardContext);
  const { nextStep } = useContext(StepContext);
  const [openEdition, setOpenEdition] = useState(CURRENT_EDITION);

  // Kiosk: fall back to the current edition when an older year is left
  // open for a minute without any interaction. Any click/tap restarts
  // the countdown.
  useEffect(() => {
    if (openEdition === CURRENT_EDITION) {
      return;
    }
    let timer = setTimeout(() => setOpenEdition(CURRENT_EDITION), 60_000);
    function restartTimer() {
      clearTimeout(timer);
      timer = setTimeout(() => setOpenEdition(CURRENT_EDITION), 60_000);
    }
    window.addEventListener("pointerdown", restartTimer);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", restartTimer);
    };
  }, [openEdition]);

  const editions = [...new Set(boards.map((board) => board.edition))].sort(
    (a, b) => b - a
  );

  function onClick(boardKey: string) {
    selectBoard(boardKey);
    nextStep();
  }

  return (
    <>
      <h1 className="text-4xl font-display font-bold">
        <Translate item="chooseBoardTitle" />
      </h1>
      <div className="flex flex-col gap-6 m-6 w-full max-w-6xl">
        {editions.map((edition, index) => {
          const editionBoards = boards.filter(
            (board) => board.edition === edition
          );
          const open = openEdition === edition;
          return (
            <div key={edition}>
              <button
                className={`flex items-center gap-4 w-full border-2 border-black rounded-xl px-6 py-3 text-3xl font-display font-bold text-black shadow-sticker-sm transition active:translate-x-1 active:translate-y-1 active:shadow-none ${
                  EDITION_COLORS[index % EDITION_COLORS.length]
                } ${open ? "" : "opacity-80 hover:opacity-100"}`}
                onClick={() => setOpenEdition(edition)}
              >
                <span>{edition}</span>
                <span className="text-lg font-body font-bold grow text-left">
                  {editionBoards.map((board) => board.name).join(" · ")}
                </span>
                <span
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                >
                  ▼
                </span>
              </button>
              {open && (
                <div className="flex flex-wrap justify-center gap-8 mt-6 mb-2">
                  {editionBoards.map((board) => (
                    <BoardCard
                      key={board.key}
                      board={board}
                      onClick={onClick}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
