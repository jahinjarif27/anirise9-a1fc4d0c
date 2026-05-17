import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Hide splash once the app paints
requestAnimationFrame(() => {
  setTimeout(() => {
    const s = document.getElementById("anirise-splash");
    if (s) {
      s.classList.add("ar-splash-out");
      setTimeout(() => s.remove(), 400);
    }
  }, 250);
});
