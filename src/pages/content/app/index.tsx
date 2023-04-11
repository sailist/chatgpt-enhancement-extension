import { createRoot } from "react-dom/client";
import App from "@src/pages/content/app/app";
import refreshOnUpdate from "virtual:reload-on-update-in-view";

refreshOnUpdate("pages/content");

const root = document.createElement("div");
root.id = "chatgpt-enhancement-extension";
document.body.append(root);

createRoot(root).render(<App />);
