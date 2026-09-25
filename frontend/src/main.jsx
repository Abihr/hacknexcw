import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./ThemeContext.jsx";
import { InvestigationProvider } from "./InvestigationContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <InvestigationProvider>
        <App />
      </InvestigationProvider>
    </ThemeProvider>
  </StrictMode>
);