import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";


const Popup = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    chrome.storage.sync.get(
      {
        prompt: "",
      },
      (items) => {
        setPrompt(decodeURIComponent(encodeURIComponent(items.prompt)));
      }
    );
  }, []);

  const saveOptions = () => {
    // Saves options to chrome.storage.sync.
    chrome.storage.sync.set(
      {
        prompt: prompt,
      },
      () => {
        // Update status to let user know options were saved.
        setStatus("Prompt saved.");
        const id = setTimeout(() => {
          setStatus("");
        }, 1000);
        return () => clearTimeout(id);
      }
    );
  };

  return (
    <>
      <div>
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)}></textarea>
      </div>
      <div>{status}</div>
      <button onClick={saveOptions}>Save</button>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
