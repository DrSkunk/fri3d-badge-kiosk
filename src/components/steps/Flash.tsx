import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "../Button";
import { StepContext } from "../../context/StepContext";
import { Translate } from "../Translate";

export function Flash() {
  const [logs, setLogs] = useState("");
  const { nextStep, previousStep, backToHome } = useContext(StepContext);
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
        <p className="text-center">
          <Translate item="flashingFailedButton" />
        </p>
      )}
      {flashing && (
        <p className="text-center">
          <Translate item="flashingInProgress" />
        </p>
      )}
      <div className="flex gap-4">
        {showFlashAgain && (
          <Button className="mx-auto block flex-shrink" onClick={startFlash}>
            <Translate item="flashingTryAgainButton" />
          </Button>
        )}
        {!flashing && (
          <>
            <Button className="mx-auto block" onClick={previousStep}>
              <Translate item="flashingBackButton" />
            </Button>
            <Button className="mx-auto block" onClick={backToHome}>
              <Translate item="chooseOtherBoard" />
            </Button>
          </>
        )}
      </div>

      <textarea
        ref={textAreaRef}
        readOnly
        className="border w-[70vw] h-[50vh] bg-black px-4 py-2 text-white rounded resize"
        value={logs}
      />
    </div>
  );
}
