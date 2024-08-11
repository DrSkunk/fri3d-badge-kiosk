import { useContext } from "react";
import { BoardContext } from "../../context/BoardContext";
import Markdown from "react-markdown";
import { Button } from "../Button";
import { StepContext } from "../../context/StepContext";
import { LanguageContext } from "../../context/LanguageContext";
import { Translate } from "../Translate";

export function Instructions() {
  const { getCurrentBoard } = useContext(BoardContext);
  const { currentLanguage } = useContext(LanguageContext);
  const { previousStep, nextStep } = useContext(StepContext);

  return (
    <>
      <div>
        <Markdown className="prose prose-invert prose-img:rounded-xl ">
          {getCurrentBoard().instructions[currentLanguage]}
        </Markdown>
      </div>
      <div className="space-x-4 sticky left-0 bottom-0 bg-slate-900 border px-4 py-2 mt-4 rounded">
        <Button onClick={previousStep}>
          <Translate item="chooseOtherBoard" />
        </Button>
        <Button onClick={nextStep}>
          <Translate item="flash" />
        </Button>
      </div>
    </>
  );
}
