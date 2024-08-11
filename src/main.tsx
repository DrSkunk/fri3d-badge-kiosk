import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import "./main.css";
import { BoardContextProvider } from "./context/BoardContext";
import { StepContextProvider } from "./context/StepContext";
import { electronAPI } from "./mockElectronApi.ts";

// In browser, add mock functions to window object that otherwise is filled by preload.js
if (!navigator.userAgent.includes("Electron")) {
  window.electronAPI = electronAPI;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BoardContextProvider>
    <StepContextProvider>
      <App />
    </StepContextProvider>
  </BoardContextProvider>
);
