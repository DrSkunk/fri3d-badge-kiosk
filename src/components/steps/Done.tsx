import { useContext } from "react";
import { StepContext } from "../../context/StepContext";
import { Button } from "../Button";

export function Done() {
  const { nextStep } = useContext(StepContext);
  return (
    <div className="h-screen gap-4 flex justify-center flex-col items-center">
      <h1 className="text-3xl font-bold">Klaar!</h1>
      <p className="text-lg">
        Je bordje zou moeten hersteld zijn. Is dit nog niet het geval kan je het
        nog eens proberen of iemand van de vrijwilligers aanspreken voor hulp.
      </p>
      <div>
        <Button onClick={nextStep} className="mx-auto block">
          Naar het begin
        </Button>
      </div>
    </div>
  );
}
