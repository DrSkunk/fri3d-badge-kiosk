import { useState, createContext } from "react";
import { Step } from "../enum/Step";

interface BoardContextType {
  currentStep: Step;
  backToHome: () => void;
  previousStep: () => void;
  nextStep: () => void;
}

export const StepContext = createContext<BoardContextType>({
  currentStep: Step.CHOOSE_BOARD,
  backToHome: () => {},
  previousStep: () => {},
  nextStep: () => {},
});

export function StepContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentStep, setCurrentStep] = useState<Step>(Step.CHOOSE_BOARD);

  function backToHome() {
    setCurrentStep(Step.CHOOSE_BOARD);
  }

  function previousStep() {
    if (currentStep === Step.CHOOSE_BOARD) {
      return;
    }
    setCurrentStep((currentStep) => currentStep - 1);
  }

  function nextStep() {
    if (currentStep === Step.DONE) {
      setCurrentStep(Step.CHOOSE_BOARD);
      return;
    }
    setCurrentStep((currentStep) => currentStep + 1);
  }

  return (
    <StepContext.Provider
      value={{
        currentStep,
        backToHome,
        previousStep,
        nextStep,
      }}
    >
      {children}
    </StepContext.Provider>
  );
}
