import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

let defaultPrompt = `检查以下论文内容，用以下逻辑回复：
如果包含 Introduction，总结该方法；
如果包含 Related work，提取该论文对应的领域，用逗号分隔；
如果包含 Methods，总结该论文使用的各个方法的组成部分，用 Markdown list 列出，在最后一行提取论文中定义的名词，用逗号分隔；
如果包含 Experiment，提取该论文用到的数据集，用逗号分隔，并输出该方法做了哪些对比实验证明有效性，用Markdown list 列出；
如果包含 Reference，输出 "结束"。

`
const Options = () => {
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
    <Options />
  </React.StrictMode>
);
