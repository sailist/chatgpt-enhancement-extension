import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { getCurrentTime } from "../utils";
import JSZip from "jszip";

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

function LongContent({ chatid, content }: { chatid: string; content: string }) {
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

  const [editContent, setEditContent] = useState<PromptValue>({
    chatid: "",
    content: "",
  });
  const dropzoneRef = useRef<any>();
  const [filter, setFilter] = useState("");
  const [prompts, setPrompts] = useState<Prompts>(DEFAULT_PROMPT);

  const [inBackup, setInBackup] = useState(false);

  useEffect(() => {
    console.log("keys");

    chrome.storage.local.get(
      { chatgptHistoryIds: [] } as { chatgptHistoryIds: HistoryKeys },
      (items) => {
        const { chatgptHistoryIds } = items as {
          chatgptHistoryIds: HistoryKeys;
        };
        chrome.storage.local.get(__(chatgptHistoryIds), (items) => {
          console.log("initial", items);
          if (Object.keys(items).length > 0) {
            const newPrompts = Object.assign({}, items);
            setPrompts(newPrompts);
          }
        });
      }
    );
  }, []);

  const removePrompt = (title: string) => {
    chrome.storage.local.get(
      { prompt_keys: ["default"] } as { prompt_keys: HistoryKeys },
      (items) => {
        const { prompt_keys } = items as { prompt_keys: HistoryKeys };
        const res: { [key: string]: any } = {};
        const newPromptKeys = prompt_keys.filter((item) => item !== title);
        chrome.storage.local.remove(_(title), () => {
          chrome.storage.local.set({ prompt_keys: newPromptKeys }, () => {
            const newPrompts = Object.assign({}, prompts);
            delete newPrompts[_(title)];
            setPrompts(newPrompts);
          });
        });
      }
    );
  };

  const setPrompt = (chatid: string, title?: string) => {
    chrome.storage.local.get(chatid, (items) => {
      const content = items[chatid] as PromptValue;
      content.title = title;
      const res = {};
      res[chatid] = content;
      chrome.storage.local.set(res, () => {
        const newPrompts = Object.assign({}, prompts);
        newPrompts[chatid] = content;
        setPrompts(newPrompts);
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

  const prepareText = (filterd: boolean = false) => {
    let res = Object.keys(prompts).map((item) => {
      return prompts[item];
    });
    if (filterd) {
      res = res.filter((item) => {
        return item.chatid.indexOf(filter) >= 0;
      });
    }
    if (format === "json") {
      return JSON.stringify(res);
    } else {
      const text = res
        .map((item) => {
          return "## " + item.chatid + "\n\n" + item.content + "\n\n";
        })
        .join("\n");
      return text;
    }
  };

  const handleImport = (jsonStr: string) => {
    const importPrompts: PromptValue[] = JSON.parse(jsonStr);
    chrome.storage.local.get(
      { prompt_keys: ["default"] } as { prompt_keys: HistoryKeys },
      (items) => {
        const res: { [key: string]: any } = {};
        importPrompts.forEach((item) => {
          res[_(item.chatid)] = item;
        });

        const newPrompts = Object.assign({}, prompts, res);
        const { prompt_keys } = items as { prompt_keys: HistoryKeys };
        const newPrompKeys = Array.from(
          new Set(prompt_keys.concat(importPrompts.map((item) => item.chatid)))
        );
        res["prompt_keys"] = newPrompKeys;

        chrome.storage.local.set(res, () => {
          setPrompts(newPrompts);
        });
      }
    );
  };

  return (
    <div className="flex flex-row">
      <div className="w-[40.5rem] divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
        <div className="bg-white sticky top-0 hidden w-full lg:flex items-center text-sm leading-6 text-slate-400 rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3 hover:ring-slate-300 dark:bg-slate-800 dark:highlight-white/5 dark:hover:bg-slate-700">
          <input
            placeholder="search"
            onChange={(event) => {
              const text = event.target.value as string;
              setFilter(text);
            }}
            className="placehold min-h-0 h-auto resize-y font-medium block w-full rounded-md border-0 py-1.5 pl-4 pr-4
                    text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        {Object.keys(prompts).map((item, index) => {
          const { chatid, content, date, title } = prompts[item];
          if (filter.trim().length > 0 && chatid.indexOf(filter) < 0) {
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
                        }}
                        className="pointer-events-auto flex-none rounded-md px-2 py-[0.3125rem] font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
                      >
                        copy
                      </div>
                      <div
                        onClick={() => {
                          removePrompt(chatid);
                        }}
                        className="pointer-events-auto flex-none rounded-md px-2 py-[0.3125rem] font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
                      >
                        remove
                      </div>
                    </div>
                  </div>
                  <LongContent chatid={chatid} content={content} />
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
          }}
          ref={dropzoneRef}
          className="w-full border border-dashed py-2 pointer-events-auto m-2 rounded-md px-2 font-medium text-slate-700 ring-1 ring-slate-700/10 hover:bg-slate-50"
        >
          Backup
        </div>
      </div>
    </div>
  );
}
