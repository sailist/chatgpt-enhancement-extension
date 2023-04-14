import { createRoot } from "react-dom/client";
import App from "./app";
import refreshOnUpdate from "virtual:reload-on-update-in-view";

refreshOnUpdate("pages/content");

const root = document.createElement("div");
root.id = "chatgpt-enhancement-extension-select-part";
root.className = "cee-root";
document.body.append(root);

console.log("select", root);
createRoot(root).render(<App />);
