import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Prompts from "./option_components/prompt";
import RegPromptsTab from "./option_components/regex_prompt";

let defaultPrompt = ``


function SidebarButton({ name, isActive, onClick }: any) {
  return (
    <button
      className={`${isActive ? "bg-gray-700" : ""
        } w-full py-2 text-left px-4 hover:bg-gray-700 focus:outline-none`}
      onClick={onClick}
    >
      {name}
    </button>
  );
}

const tab: { [key: string]: any } = {
  'prompts': Prompts,
  'reg-prompt': RegPromptsTab
}


const Options = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [activeButton, setActiveButton] = useState("prompts");

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  useEffect(() => {
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
    chrome.storage.sync.set(
      {
        prompt: prompt,
      },
      () => {
        // Update status to let user know options were saved.
        const id = setTimeout(() => {
          return;
        }, 1000);
        return () => clearTimeout(id);
      }
    );
  };
  const Main = tab[activeButton]
  return (
    <>
      <div className="flex h-screen">
        <div className="bg-gray-800 text-gray-100 w-1/5 flex flex-col items-center">
          <SidebarButton
            name="Prompts"
            isActive={activeButton === "prompts"}
            onClick={() => handleButtonClick("prompts")}
          />
          <SidebarButton
            name="Regex Prompt"
            isActive={activeButton === "reg-prompt"}
            onClick={() => handleButtonClick("reg-prompt")}
          />
          <SidebarButton
            name="History"
            isActive={activeButton === "history"}
            onClick={() => handleButtonClick("history")}
          />
          <SidebarButton
            name="About"
            isActive={activeButton === "about"}
            onClick={() => handleButtonClick("about")}
          />
        </div>
        <div className="w-4/5 p-4">
          <Prompts></Prompts>
          {/* <MainContent activeButton={activeButton} /> */}
        </div>
      </div>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
