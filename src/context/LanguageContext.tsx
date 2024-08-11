import { useState, createContext } from "react";
import { Language } from "../enum/Language";

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: Language.NL,
  setLanguage: () => {},
});

export function LanguageContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(Language.NL);

  function setLanguage(language: Language) {
    setCurrentLanguage(language);
  }

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
