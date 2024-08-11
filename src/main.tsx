import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import "./main.css";
import { BoardContextProvider } from "./context/BoardContext";
import { StepContextProvider } from "./context/StepContext";
import { electronAPI } from "./mockElectronApi.ts";
import { LanguageContextProvider } from "./context/LanguageContext.tsx";

// In browser, add mock functions to window object that otherwise is filled by preload.js
if (!navigator.userAgent.includes("Electron")) {
  window.electronAPI = electronAPI;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <LanguageContextProvider>
    <BoardContextProvider>
      <StepContextProvider>
        <App />
      </StepContextProvider>
    </BoardContextProvider>
  </LanguageContextProvider>
);
