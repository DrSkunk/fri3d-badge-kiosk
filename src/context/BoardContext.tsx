import { useState, useEffect, createContext } from "react";
import { Board } from "../types/Board";

export const BoardContext = createContext<{
  boards: Board[];
  selectedBoard: Board | null;
  selectBoard: (boardKey: string) => void;
  getCurrentBoard: () => Board;
}>({
  boards: [],
  selectedBoard: null,
  selectBoard: () => {},
  getCurrentBoard: () => {
    throw new Error("Not implemented");
  },
});

export function BoardContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);

  useEffect(() => {
    async function getData() {
      const response = await fetch("/boards/index.json");
      const boards = (await response.json()) as Board[];
      // get instructions
      for (const board of boards) {
        const response = await fetch(`/boards/${board.key}/instructions.md`);
        board.instructions = await response.text();
      }
      setBoards(boards);
    }
    getData();
  }, []);

  function selectBoard(boardKey: string) {
    const board = boards.find((board) => board.key === boardKey);
    if (!board) {
      throw new Error(`Board with key ${boardKey} not found`);
    }
    window.electronAPI.selectBoard(board);
    setSelectedBoard(board);
  }

  function getCurrentBoard() {
    if (!selectedBoard) {
      throw new Error("No board selected");
    }
    return selectedBoard;
  }

  return (
    <BoardContext.Provider
      value={{
        boards,
        selectedBoard,
        selectBoard,
        getCurrentBoard,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
