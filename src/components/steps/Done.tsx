import { useContext } from "react";
import { StepContext } from "../../context/StepContext";
import { Button } from "../Button";
import { Translate } from "../Translate";

export function Done() {
  const { nextStep } = useContext(StepContext);
  return (
    <div className="h-screen gap-4 flex justify-center flex-col items-center">
      <h1 className="text-3xl font-bold">Klaar!</h1>
      <p className="text-lg">
        <Translate item="doneExplanation" />
      </p>
      <div>
        <Button onClick={nextStep} className="mx-auto block">
          <Translate item="doneButton" />
        </Button>
      </div>
    </div>
  );
}
