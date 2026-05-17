import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { RecruitmentProvider } from "./context/RecruitmentContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RecruitmentProvider>
      <App />
    </RecruitmentProvider>
  </StrictMode>
);
