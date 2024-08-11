import { useContext } from "react";
import { BoardContext } from "../../context/BoardContext";
import { StepContext } from "../../context/StepContext";

export function ChooseBoard() {
  const { selectBoard, boards } = useContext(BoardContext);
  const { nextStep } = useContext(StepContext);

  function onClick(boardKey: string) {
    selectBoard(boardKey);
    nextStep();
  }
  return (
    <>
      <h1 className="text-4xl">Raak aan wat je wilt fixen</h1>
      <div className="grid grid-cols-4 gap-4 m-4">
        {boards.map((board) => (
          <div
            key={board.key}
            className="border border-gray-600 rounded-lg hover:scale-105"
            onClick={() => onClick(board.key)}
          >
            <h2 className="text-2xl mb-2 text-center">{board.name}</h2>
            <img
              src={board.image}
              alt={board.name}
              className="bg-gray-400 aspect-square object-cover rounded-b-lg"
            />
          </div>
        ))}
      </div>
    </>
  );
}
