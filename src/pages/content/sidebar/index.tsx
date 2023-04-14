import { createRoot } from "react-dom/client";
import App from "./app";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import { sendMessage } from "@src/common/message";

refreshOnUpdate("pages/content");

const root = document.createElement("div");
root.id = "chatgpt-enhancement-extension";
root.className = "cee-root";
document.body.append(root);

createRoot(root).render(<App />);
