import { useContext, useEffect, useState } from "react";
import { Button } from "../Button";
import { StepContext } from "../../context/StepContext";

export function Flash() {
  const [logs, setLogs] = useState("");
  const { nextStep, previousStep } = useContext(StepContext);
  const [flashing, setFlashing] = useState(true);

  const [showFlashAgain, setShowFlashAgain] = useState(false);

  useEffect(() => {
    console.log("running useEffect");
    const removeHandleFlashCompleteListener =
      window.electronAPI.handleFlashComplete(() => {
        setFlashing(false);
        nextStep();
      });
    const removeHandleFlashErrorListener = window.electronAPI.handleFlashError(
      () => {
        console.error("Flash error handling");
        setShowFlashAgain(true);
        console.log("Flash error", flashing);
        setFlashing(false);
      }
    );
    const removeHandleStdoutListener = window.electronAPI.handleStdout(
      (_, data: string) => {
        setLogs((logs) => logs + data);
      }
    );
    const removeHandleStderrListener = window.electronAPI.handleStderr(
      (_, data: string) => {
        setLogs((logs) => logs + data);
      }
    );

    startFlash();

    return () => {
      removeHandleFlashCompleteListener();
      removeHandleFlashErrorListener();
      removeHandleStdoutListener();
      removeHandleStderrListener();
    };
  }, []);

  function startFlash() {
    setLogs("Ready!\n");
    setShowFlashAgain(false);
    setFlashing(true);
    console.log("Start flashing");
    window.electronAPI.flash();
  }

  return (
    <div className="flex flex-col gap-4">
      {showFlashAgain && (
        <>
          <p className="text-center">
            Het flashen lijkt gefaald. Wil je opnieuw proberen? Kijk zeker goed
            de instructies na!
          </p>
          <Button className="mx-auto block flex-shrink" onClick={startFlash}>
            Opnieuw proberen
          </Button>
        </>
      )}
      {!flashing && (
        <Button className="mx-auto block" onClick={previousStep}>
          Instructies terug tonen
        </Button>
      )}

      <textarea
        readOnly
        className="border w-[70vw] h-72 bg-black px-4 py-2 text-white rounded resize"
        value={logs}
      />
    </div>
  );
}
