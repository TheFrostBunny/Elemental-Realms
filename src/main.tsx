import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Disable React Strict Mode to prevent double-rendering issues
createRoot(document.getElementById("root")!).render(<App />);
