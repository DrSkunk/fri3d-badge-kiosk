import { useContext } from "react";
import { StepContext } from "../../context/StepContext";
import { Button } from "../Button";

export function Done() {
  const { nextStep } = useContext(StepContext);
  return (
    <div>
      Done
      <div>
        <Button onClick={nextStep} className="mx-auto block">
          Close
        </Button>
      </div>
    </div>
  );
}
