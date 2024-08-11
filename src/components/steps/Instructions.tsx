import { useContext } from "react";
import { BoardContext } from "../../context/BoardContext";
import Markdown from "react-markdown";
import { Button } from "../Button";
import { StepContext } from "../../context/StepContext";

export function Instructions() {
  const { getCurrentBoard } = useContext(BoardContext);
  const { previousStep, nextStep } = useContext(StepContext);

  return (
    <>
      <div>
        <Markdown className="prose prose-invert prose-img:rounded-xl ">
          {getCurrentBoard().instructions}
        </Markdown>
      </div>
      <div className="space-x-4 sticky left-0 bottom-0 bg-slate-900 border px-4 py-2 rounded">
        <Button onClick={previousStep}>Ander bord kiezen</Button>
        <Button onClick={nextStep}>Flashen</Button>
      </div>
    </>
  );
}
