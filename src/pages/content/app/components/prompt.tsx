import React, { useState, useEffect } from "react";
import Dropdown from "./dropdown";

export interface PatternPair {
  pattern: string;
  prompt: string;
}

export interface AppState {
  patternPair: PatternPair[];
  status: string;
  language: "Chinese" | "English";
  globalPrompt: string;
}

export const defaultState = {
  patternPair: [
    { pattern: ".*", prompt: "Summary the content" },
    {
      pattern: "method",
      prompt:
        "Prompting 3 question about the proposed method, then reply it one by one",
    },
    {
      pattern: "method",
      prompt: "The abbr of the proposed method and its components.",
    },
    {
      pattern: "table\\s?([0-9]+)",
      prompt: "What does Table $1 try to prove?",
    },
    {
      pattern: "dataset",
      prompt: "What datasets dose the paper use?",
    },
  ],
  status: "",
  language: "Chinese",
  globalPrompt:
    "Answer the questions one by one after reading the content above.",
} as AppState;

const App = () => {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    chrome.storage.sync.get(
      {
        promptGroup: defaultState,
      },
      (items) => {
        setState(items.promptGroup);
      }
    );
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    index: number,
    inputIndex: "prompt" | "pattern"
  ) => {
    const { value } = event.target;
    setState((prevState) => {
      const patternPair = [...prevState.patternPair];
      patternPair[index][inputIndex] = value;
      const newState = {
        ...prevState,
        patternPair: patternPair,
      };
      chrome.storage.sync.set({ promptGroup: newState }).then(() => {
        console.log("Store results");
        console.log(newState);
      });
      return newState;
    });
  };

  const handleAddRow = () => {
    setState((prevState) => ({
      ...prevState,
      patternPair: [...prevState.patternPair, { pattern: "", prompt: "" }],
    }));
  };

  const handleReset = () => {
    setState((prevState) => {
      chrome.storage.sync.set({ promptGroup: defaultState }).then(() => {
        console.log("Resets");
      });
      return defaultState;
    });
  };

  const handleLangChange = (language: "Chinese" | "English") => {
    // const { value } = event.target;
    setState((prevState) => {
      const newState = {
        ...prevState,
        language: language,
      };
      chrome.storage.sync.set({ promptGroup: newState }).then(() => {
        console.log(newState);
      });
      return newState;
    });
  };

  const handleDeleteRow = (index: number) => {
    setState((prevState) => {
      const patternPair = [...prevState.patternPair];
      patternPair.splice(index, 1);
      return {
        ...prevState,
        patternPair: patternPair,
      };
    });
  };

  return (
    <>
      {/* <div className="p-2 bg-gray-100">{`Status: ${state.status}`}</div> */}
      <Dropdown
        defaultLang={state.language}
        onChange={handleLangChange}
      ></Dropdown>
      <div className="my-2">
        {state.patternPair.map((inputRow, index) => (
          <div key={index} className="border rounded p-1 my-2">
            <div className="grid grid-cols-6 gap-x-4 gap-y-2 ">
              <input
                type="text"
                placeholder="regexp pattern"
                value={inputRow.pattern}
                onChange={(event) => handleInputChange(event, index, "pattern")}
                className="text-gray-700 dark:text-gray-500 text-sm col-span-5 border-0 p-1 bg-transparent p-0 focus:ring-0 focus-visible:ring-0"
              />
              <div>
                <button
                  onClick={() => handleDeleteRow(index)}
                  className="text-sm px-2 rounded-full bg-gray-200 border-0 focus:outline-none ring-inset text-white"
                >
                  <span className="rounded-full">&times;</span>
                </button>
              </div>
              <div className="col-span-6 border-t"></div>
              <textarea
                placeholder="prompt"
                value={inputRow.prompt}
                onChange={(event) => handleInputChange(event, index, "prompt")}
                className="text-gray-700 dark:text-gray-500 col-span-6 p-1 resize-y w-ful text-sm border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="py-2 border-b border-gray-200">
        <button
          onClick={handleAddRow}
          className="w-3/4 px-2 py-2 bg-blue-500 text-white"
        >
          Add +
        </button>
        <button
          onClick={handleReset}
          className="w-1/4 px-2 py-2 bg-gray-500 text-white"
        >
          Reset +
        </button>
      </div>
    </>
  );
};

export default App;
