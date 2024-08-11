import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { Language } from "../enum/Language";

export function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useContext(LanguageContext);

  return (
    <div>
      <button
        onClick={() => setLanguage(Language.NL)}
        className="text-white"
        disabled={currentLanguage === Language.NL}
      >
        Nederlands
      </button>
      <button
        onClick={() => setLanguage(Language.EN)}
        className="text-white"
        disabled={currentLanguage === Language.EN}
      >
        English
      </button>
    </div>
  );
}
