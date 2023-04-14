import React, { useState, useEffect, useRef } from "react";
import { getCurrentTime } from "../utils";
import JSZip from "jszip";
import { storage } from "@src/common";
import SearchBar from "@src/common/components/SearchBar";
import { track } from "@src/common/track";

type PromptValue = {
  chatid: string;
  title?: string;
  content: string;
  date?: string;
};
type Prompts = {
  [key: string]: PromptValue;
};

type HistoryKeys = string[];

function _(k: string) {
  return k;
}
function __(k: string[]) {
  return k.map((item) => _(item));
}
export const DEFAULT_PROMPT = {};

function LongContent({ chatid, title, content }: PromptValue) {
  const [expand, setExpand] = useState(false);
  return (
    <>
      <div className="sticky w-3/5 py top-[49px] bg-white flex flex-row">
        <a
          href={`https://chat.openai.com/chat/${chatid}`}
          target="_blank"
          className="text-lg"
          rel="noreferrer"
        >
          {chatid.slice(0, 20) + "..."}
        </a>
        <a
          className="ml-4 cursor-point text-blue-500 hover:text-blue-700"
          onClick={() => {
            setExpand(!expand);
          }}
        >
          {expand ? "fold" : "unfold"}
        </a>
      </div>
      <p className="text-lg">{title}</p>
      <div className="break-words mt-1 text-slate-700 whitespace-pre-line">
        {expand ? (
          content
        ) : (
          <>
            {content.split("\n").slice(0, 5).join("\n") + "\n..."}
            <a
              className="ml-4 cursor-point text-blue-500 hover:text-blue-700"
              onClick={() => {
                setExpand(!expand);
              }}
            >
              {expand ? "fold" : "unfold"}
            </a>
          </>
        )}
      </div>
    </>
  );
}

export default function History() {
  const [edit, setEdit] = useState(-1);
  const [format, setFormat] = useState("json");

  const dropzoneRef = useRef<any>();
  const [filter, setFilter] = useState("");
  const [prompts, setPrompts] = useState<Prompts>(DEFAULT_PROMPT);

  const [inBackup, setInBackup] = useState(false);

  useEffect(() => {
    console.log("keys");
    storage
      .get<HistoryKeys>("chatgptHistoryIds", [])
      .then((chatgptHistoryIds) => {
        storage.gets(__(chatgptHistoryIds)).then((newPrompts: Prompts) => {
          if (Object.keys(newPrompts).length > 0) {
            setPrompts(newPrompts);
          }
        });
      });
  }, []);

  const removePrompt = (title: string) => {
    storage.get<HistoryKeys>("prompt_keys", ["default"]).then((prompt_keys) => {
      const newPromptKeys = prompt_keys.filter((item) => item !== title);
      storage.remove(_(title)).then(() => {
        storage.set("prompt_keys", newPromptKeys).then(() => {
          const newPrompts = Object.assign({}, prompts);
          delete newPrompts[_(title)];
          setPrompts(newPrompts);
        });
      });
    });
  };

  const backupZip = () => {
    const zip = new JSZip();
    Object.keys(prompts).forEach((item) => {
      const { chatid, content } = prompts[item];
      zip.file(`${chatid}.md`, content);
    });

    zip.generateAsync({ type: "blob" }).then((blob) => {
      // 创建 URL 对象
      const url = URL.createObjectURL(blob);

      // 创建链接并模拟点击下载
      const link = document.createElement("a");
      link.href = url;
      link.download = `chat-backup-${
        Object.keys(prompts).length
      }-${getCurrentTime()}.zip`;
      document.body.appendChild(link);
      link.click();

      // 释放 URL 对象
      URL.revokeObjectURL(url);
      setInBackup(false);
    });
    // zip.file()
  };

  return (
    <div className="flex flex-row">
      <div className="w-[40.5rem] divide-y divide-slate-200 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
        <SearchBar
          onChange={(event) => {
            const text = (event.target as any).value as string;
            setFilter(text);
            track("Use history-search input", {});
          }}
        />
        {/* <div className="bg-white sticky top-0 hidden lg:flex items-center text-sm leading-6 text-slate-400 rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3">
          <input
            placeholder="search"
            onChange={(event) => {
              const text = event.target.value as string;
              setFilter(text);
            }}
            className="placehold min-h-0 w-full h-auto resize-y font-medium block rounded-md border-0 py-1.5 pl-4 pr-4
                    text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div> */}
        {Object.keys(prompts).map((item, index) => {
          const { chatid, content, date, title } = prompts[item];
          if (
            filter.trim().length > 0 &&
            title.toLowerCase().indexOf(filter.toLowerCase()) < 0 &&
            chatid.indexOf(filter) < 0
          ) {
            return <div key={index}></div>;
          }

          return (
            <div key={index} className="flex p-4">
              <>
                <div className="w-full">
                  <div className="mr-2 break-words font-medium">
                    <div className="float-right pl-4 flex flex-row">
                      <div
                        onClick={() => {
                          navigator.clipboard.writeText(content);
                          track("Click history-copy button", {});
                        }}
                        className="pointer-events-auto flex-none rounded-md px-2 py-[0.3125rem] font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
                      >
                        copy
                      </div>
                      <div
                        onClick={() => {
                          removePrompt(chatid);
                          track("Click history-remove button", {});
                        }}
                        className="pointer-events-auto flex-none rounded-md px-2 py-[0.3125rem] font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
                      >
                        remove
                      </div>
                    </div>
                  </div>
                  <LongContent
                    title={title}
                    date={date}
                    chatid={chatid}
                    content={content}
                  />
                </div>
              </>{" "}
            </div>
          );
        })}
      </div>
      <div className="sticky top-0 m-4">
        <div
          onClick={() => {
            setInBackup(true);
            backupZip();
            track("Click history-backup button", {});
          }}
          ref={dropzoneRef}
          className="w-full border py-2 pointer-events-auto m-2 rounded-md px-2 font-medium text-slate-700 ring-1 ring-slate-700/10 hover:bg-slate-50"
        >
          {inBackup ? "Preparing" : "Backup"}
        </div>
      </div>
    </div>
  );
}
