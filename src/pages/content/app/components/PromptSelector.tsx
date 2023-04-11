import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";

type PromptValue = { title: string; content: string };
type Prompts = {
  [key: string]: PromptValue;
};

type PromptKeys = string[];

function _(k: string) {
  return "p+" + k;
}
function __(k: string[]) {
  return k.map((item) => _(item));
}

interface PromptSelectorProp {
  filter: string;
  selectIndex: number;
  selectDone: boolean;
  onSelect: (prompt: string) => void;
}

export default function PromptSelector(prop: PromptSelectorProp) {
  const { filter, onSelect, selectIndex, selectDone } = Object.assign(
    { filter: "", onSelect: () => {} },
    prop
  );
  // const [selected, setSelected] = useState("");
  const selectRef = useRef("");
  const [prompts, setPrompts] = useState<Prompts>({
    default: { title: "default", content: "I'm chatgpt-enhancement-extension" },
  });

  useEffect(() => {
    if (selectDone) {
      onSelect(selectRef.current);
    }
  }, [selectDone]);

  useEffect(() => {
    chrome.storage.local.get(
      { prompt_keys: ["default"] } as { prompt_keys: PromptKeys },
      (items) => {
        const { prompt_keys } = items as { prompt_keys: PromptKeys };
        console.log("keys", prompt_keys);
        chrome.storage.local.get(__(prompt_keys), (items) => {
          console.log("initial", items);
          if (Object.keys(items).length > 0) {
            const newPrompts = Object.assign({}, items);
            setPrompts(newPrompts);
          }
        });
      }
    );
  }, []);
  const lastIndex = Object.keys(prompts).length - 1;
  return (
    <div className="flex flex-row">
      <div className="w-[40.5rem] divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
        {Object.keys(prompts)
          .filter((item) => {
            const { title } = prompts[item];
            return !(filter.trim().length > 0 && title.indexOf(filter) < 0);
          })
          .map((item, index) => {
            const { title, content } = prompts[item];
            if (index == selectIndex) {
              selectRef.current = content;
            }
            console.log("selectIndex", selectIndex, index);
            return (
              <div
                key={index}
                onClick={() => {
                  onSelect(content);
                }}
                className={clsx(
                  "flex p-4 hover:bg-gray-200",
                  selectIndex === index ? "bg-gray-200" : ""
                )}
              >
                <div className="w-full">
                  <div className="mr-2 break-words font-medium">{title}</div>
                  <div className="break-words mt-1 text-slate-700">
                    {content}
                  </div>
                </div>
              </div>
            );
          })}
        {lastIndex === -1 && <>notFound</>}
      </div>
    </div>
  );
}
