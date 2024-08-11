import { useContext } from "react";
import { ErrorOverlay } from "./components/ErrorOverlay";
import { ChooseBoard } from "./components/steps/ChooseBoard";
import { Step } from "./enum/Step";
import { StepContext } from "./context/StepContext";
import { Instructions } from "./components/steps/Instructions";
import { Flash } from "./components/steps/Flash";
import { Done } from "./components/steps/Done";

export function App() {
  const { currentStep } = useContext(StepContext);

  return (
    <div className="flex flex-col justify-center items-center container mx-auto py-4">
      <ErrorOverlay />
      {currentStep === Step.CHOOSE_BOARD && <ChooseBoard />}
      {currentStep === Step.INSTRUCTIONS && <Instructions />}
      {currentStep === Step.FLASH_FIRMWARE && <Flash />}
      {currentStep === Step.DONE && <Done />}
    </div>
  );
}
