import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { DEFAULT_PROMPT, Prompts, __ } from "@src/pages/options/main/Prompts";
import { storage } from "@src/common";

// type PromptValue = { title: string; content: string; common?: boolean };
// type Prompts = {
//   [key: string]: PromptValue;
// };

// type PromptKeys = string[];

// function _(k: string) {
//   return "p+" + k;
// }
// function __(k: string[]) {
//   return k.map((item) => _(item));
// }

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
  const selectRef = useRef("");
  const [prompts, setPrompts] = useState<Prompts>(DEFAULT_PROMPT);

  useEffect(() => {
    if (selectDone) {
      onSelect(selectRef.current);
    }
  }, [selectDone]);

  useEffect(() => {
    storage.get<string[]>("prompt_keys", []).then((prompt_keys) => {
      console.log("type keys", prompt_keys);
      storage.gets(__(prompt_keys)).then((newPrompts: Prompts) => {
        console.log(newPrompts);
        if (Object.keys(newPrompts).length > 0) {
          setPrompts(newPrompts);
        }
      });
    });
  }, []);

  const lastIndex = Object.keys(prompts).length - 1;

  return (
    <div className="">
      <div className="w-[20.5rem] divide-y divide-slate-200 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
        {Object.keys(prompts)
          .filter((item) => {
            const { title, common } = prompts[item];
            // return true;
            return common;
          })
          .map((item, index) => {
            const { title, content } = prompts[item];
            const isSelect = lastIndex + selectIndex === index;
            if (isSelect) {
              selectRef.current = content;
            }
            return (
              <div
                key={index}
                onMouseDown={() => {
                  onSelect(content);
                }}
                className={clsx(
                  "flex p-2 bg-white hover:bg-gray-200",
                  isSelect ? "bg-gray-200 sticky top-0" : ""
                )}
              >
                <div className="w-full">
                  <div className="break-words m-1 text-slate-700">
                    {content}
                  </div>
                </div>
              </div>
            );
          })}
        {Object.keys(prompts).length === 0 && <>notFound</>}
      </div>
    </div>
  );
}
