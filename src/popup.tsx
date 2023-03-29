import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

let defaultPrompt = `根据以上内容提三个可能不容易明白的问题并分别回答`

const Popup = () => {
  // const [count, setCount] = useState(0);
  // const [currentURL, setCurrentURL] = useState<string>();

  // useEffect(() => {
  //   chrome.action.setBadgeText({ text: count.toString() });
  // }, [count]);

  // useEffect(() => {
  //   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  //     setCurrentURL(tabs[0].url);
  //   });
  // }, []);

  // const changeBackground = () => {
  //   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  //     const tab = tabs[0];
  //     if (tab.id) {
  //       chrome.tabs.sendMessage(
  //         tab.id,
  //         {
  //           color: "#555555",
  //         },
  //         (msg) => {
  //           console.log("result message:", msg);
  //         }
  //       );
  //     }
  //   });
  // };

  // return (
  //   <>
  //     <ul style={{ minWidth: "700px" }}>
  //       <li>Current URL: {currentURL}</li>
  //       <li>Current Time: {new Date().toLocaleTimeString()}</li>
  //     </ul>
  //     <button
  //       onClick={() => setCount(count + 1)}
  //       style={{ marginRight: "5px" }}
  //     >
  //       count up
  //     </button>
  //     <button onClick={changeBackground}>change background</button>
  //   </>
  // );

  const [prompt, setPrompt] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    chrome.storage.sync.get(
      {
        prompt: defaultPrompt,
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
