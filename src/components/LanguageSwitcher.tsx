import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { Button } from "./Button";
import { Translate } from "./Translate";

export function LanguageSwitcher() {
  const { switchLanguage } = useContext(LanguageContext);

  return (
    <div className="absolute right-2 bottom-2 flex gap-4">
      <Button onClick={switchLanguage} className="text-white text-lg px-4 py-2">
        <Translate item="changeToLanguage" />
      </Button>
    </div>
  );
}
