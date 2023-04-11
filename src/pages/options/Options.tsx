import React, { useState } from "react";
import "@pages/options/Options.css";
import clsx from "clsx";
import Prompts from "./main/Prompts";
import RegPrompts from "./main/RegPrompts";
import About from "./main/About";
type ButtonProp = { name: string; value: string };

const sidebar: ButtonProp[] = [
  { name: "Prompt", value: "prompts" },
  { name: "Regex Prompt", value: "reg-prompts" },
  { name: "History", value: "history" },
  { name: "About", value: "about" },
];

const Options: React.FC = () => {
  const [main, setMain] = useState("prompts");

  return (
    <div className="overflow-hidden w-full h-full relative flex">
      <div className="dark hidden bg-gray-900 md:flex md:w-[260px] md:flex-col">
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex h-full flex-1 flex-col space-y-1 p-2">
            {sidebar.map(({ name, value }) => {
              return (
                <>
                  <a
                    onClick={() => {
                      setMain(value);
                    }}
                    className={clsx(
                      "flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm flex-shrink-0 border border-white/20",
                      main === value ? "bg-gray-800" : ""
                    )}
                  >
                    <div className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative">
                      {name}
                    </div>
                  </a>
                </>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex overflow-y-auto h-full max-w-full flex-1 flex-col">
        <div className="flex flex-col items-center text-sm dark:bg-gray-800">
          {main === "prompts" && <Prompts />}
          {main === "reg-prompts" && <RegPrompts />}
          {main === "about" && <About />}
        </div>
      </div>
    </div>
  );
};

export default Options;
