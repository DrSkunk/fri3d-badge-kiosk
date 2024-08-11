import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "../Button";
import { StepContext } from "../../context/StepContext";

export function Flash() {
  const [logs, setLogs] = useState("");
  const { nextStep, previousStep } = useContext(StepContext);
  const [flashing, setFlashing] = useState(true);
  const [showFlashAgain, setShowFlashAgain] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const removeHandleFlashCompleteListener =
      window.electronAPI.handleFlashComplete(() => {
        setFlashing(false);
        nextStep();
      });
    const removeHandleFlashErrorListener = window.electronAPI.handleFlashError(
      () => {
        setShowFlashAgain(true);
        setFlashing(false);
      }
    );
    const removeHandleStdoutListener = window.electronAPI.handleStdout(
      (_, data: string) => {
        setLogs((logs) => logs + data);
        scrollToBottom();
      }
    );
    const removeHandleStderrListener = window.electronAPI.handleStderr(
      (_, data: string) => {
        setLogs((logs) => logs + data);
        scrollToBottom();
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

  function scrollToBottom() {
    console.log("scroll", textAreaRef);
    if (!textAreaRef.current) {
      return;
    }
    textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
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
        ref={textAreaRef}
        readOnly
        className="border w-[70vw] h-72 bg-black px-4 py-2 text-white rounded resize"
        value={logs}
      />
    </div>
  );
}
