import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { getCurrentTime } from "../utils";
import { storage } from "@src/common";
import SearchBar from "@src/common/components/SearchBar";

export type PromptValue = { title: string; content: string; common?: boolean };
export type Prompts = {
  [key: string]: PromptValue;
};

export type PromptKeys = string[];

export function _(k: string) {
  return "p+" + k;
}
export function __(k: string[]) {
  return k.map((item) => _(item));
}
export const EMPTY_PROMPT: PromptValue = {
  title: "",
  content: "",
  common: false,
};

export const DEFAULT_PROMPT: Prompts = {
  default: { title: "default", content: "I'm chatgpt-enhancement-extension" },
  defaultCh: { title: "中文", content: "我是 chatgpt-enhancement-extension" },
  defaultForSelect: {
    title: "Explain",
    content: "Explain this text",
    common: true,
  },
  defaultForSelectCh: {
    title: "解释这段话",
    content: "这段话是什么意思",
    common: true,
  },
};

export default function Prompts() {
  const [edit, setEdit] = useState(-1);
  const [format, setFormat] = useState("json");

  const [editContent, setEditContent] = useState<PromptValue>(EMPTY_PROMPT);
  const dropzoneRef = useRef<any>();
  const [filter, setFilter] = useState("");
  const [prompts, setPrompts] = useState<Prompts>(DEFAULT_PROMPT);

  useEffect(() => {
    storage.get<PromptKeys>("prompt_keys", []).then((prompt_keys) => {
      if (prompt_keys.length === 0) {
        const res = {};
        Object.keys(DEFAULT_PROMPT).forEach((item) => {
          res[_(DEFAULT_PROMPT[item].title)] = DEFAULT_PROMPT[item];
        });
        storage.sets(res).then(() => {
          storage.gets(__(prompt_keys)).then((items: Prompts) => {
            if (Object.keys(items).length > 0) {
              const newPrompts = Object.assign({}, items);
              setPrompts(newPrompts);
            }
          });
        });
      } else {
        storage.gets(__(prompt_keys)).then((items: Prompts) => {
          if (Object.keys(items).length > 0) {
            const newPrompts = Object.assign({}, items);
            setPrompts(newPrompts);
          }
        });
      }
    });
  }, []);

  const removePrompt = (title: string) => {
    storage.get<PromptKeys>("prompt_keys", []).then((prompt_keys) => {
      const newPromptKeys = prompt_keys.filter((item) => item !== title);
      storage.remove(_(title)).then(() => {
        storage.sets({ prompt_keys: newPromptKeys }).then(() => {
          const newPrompts = Object.assign({}, prompts);
          delete newPrompts[_(title)];
          setPrompts(newPrompts);
        });
      });
    });
  };

  const setPrompt = (content: PromptValue, oldTitle?: string) => {
    storage.get<PromptKeys>("prompt_keys", []).then((prompt_keys) => {
      const title = content.title;
      const res: { [key: string]: any } = {};
      const newPrompKeys = prompt_keys.filter((item) => item !== oldTitle);
      newPrompKeys.push(title);
      res["prompt_keys"] = newPrompKeys;
      if (oldTitle) {
        delete res[_(oldTitle)];
      }
      res[_(title)] = content;
      storage.sets(res).then(() => {
        const newPrompts = Object.assign({}, prompts);
        newPrompts[_(title)] = content;
        setPrompts(newPrompts);
      });
    });
  };

  const prepareText = (filterd: boolean = false) => {
    let res = Object.keys(prompts).map((item) => {
      return prompts[item];
    });
    if (filterd) {
      res = res.filter((item) => {
        return item.title.indexOf(filter) >= 0;
      });
    }
    if (format === "json") {
      return JSON.stringify(res);
    } else {
      const text = res
        .map((item) => {
          return "## " + item.title + "\n\n" + item.content + "\n\n";
        })
        .join("\n");
      return text;
    }
  };

  const handleImport = (jsonStr: string) => {
    const importPrompts: PromptValue[] = JSON.parse(jsonStr);
    storage.get<PromptKeys>("prompt_keys", ["default"]).then((prompt_keys) => {
      const res: { [key: string]: any } = {};
      importPrompts.forEach((item) => {
        res[_(item.title)] = item;
      });

      const newPrompts = Object.assign({}, prompts, res);
      const newPrompKeys = Array.from(
        new Set(prompt_keys.concat(importPrompts.map((item) => item.title)))
      );
      res["prompt_keys"] = newPrompKeys;

      storage.sets(res).then(() => {
        setPrompts(newPrompts);
      });
    });
  };

  const handleFile = (file: File) => {
    console.log(file);
    const reader = new FileReader();

    reader.addEventListener("load", (event) => {
      const contents = event.target.result as string;
      handleImport(contents);
    });

    reader.readAsText(file);
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    // dropzoneRef.current.classList.add(classes.dropzoneActive);
  };

  const handleDragLeave: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    // dropzoneRef.current.classList.remove(classes.dropzoneActive);
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    // dropzoneRef.current.classList.remove(classes.dropzoneActive);
    handleFile(event.dataTransfer.files[0]);
  };

  const maxIndex = Object.keys(prompts).length;

  console.log(maxIndex);
  return (
    <div className="flex flex-row">
      <div className="w-[40.5rem] divide-y divide-slate-200 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
        <SearchBar
          onChange={(event) => {
            const text = (event.target as any).value as string;
            setFilter(text);
          }}
        />
        {Object.keys(prompts)
          .concat(["---"])
          .map((item, index) => {
            const { title, content, common } = prompts[item] || editContent;
            if (filter.trim().length > 0 && title.indexOf(filter) < 0) {
              return <div key={index}></div>;
            }

            if (index === maxIndex && edit !== maxIndex) {
              return (
                <div className="flex p-4 text-center" key={index}>
                  <div
                    onClick={() => {
                      setEditContent({ title: "", content: "" });
                      setEdit(index);
                    }}
                    className="w-full py-2 pointer-events-auto m-2 rounded-md px-2 font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
                  >
                    Add
                  </div>
                  <div
                    onClick={() => {
                      storage
                        .get<PromptKeys>("prompt_keys", ["default"])
                        .then((prompt_keys) => {
                          storage.remove(__(prompt_keys)).then(() => {
                            storage.set("prompt_keys", []).then(() => {
                              setPrompts({});
                            });
                          });
                        });
                    }}
                    className="w-full text-white bg-red-500 py-2 pointer-events-auto m-2 rounded-md px-2 font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-red-700 "
                  >
                    Clear
                  </div>
                </div>
              );
            }

            return (
              <div key={index} className="flex p-4">
                {edit === index && (
                  <>
                    <div className="flex-auto">
                      <textarea
                        value={editContent.title}
                        onChange={(event) => {
                          setEditContent({
                            title: event.target.value,
                            content: editContent.content,
                          });
                        }}
                        className="min-h-0 h-auto resize-y font-medium block w-full rounded-md border-0 py-1.5 pl-4 pr-4
                    text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      ></textarea>
                      <textarea
                        value={editContent.content}
                        onChange={(event) => {
                          setEditContent({
                            title: editContent.title,
                            content: event.target.value,
                          });
                        }}
                        className="min-h-0 h-auto resize-y mt-1 text-slate-700 font-medium block w-full rounded-md border-0 py-1.5 pl-4 pr-4
                    text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      ></textarea>
                    </div>
                    <div className="flex flex-col">
                      <div
                        onClick={() => {
                          setPrompt(editContent, title);
                          setEdit(-1);
                        }}
                        className="pointer-events-auto ml-4 flex-none rounded-md px-2 py-[0.3125rem] font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
                      >
                        submit
                      </div>
                      <div
                        onClick={() => {
                          setEdit(-1);
                        }}
                        className="pointer-events-auto ml-4 flex-none rounded-md px-2 py-[0.3125rem] font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
                      >
                        cancel
                      </div>
                    </div>
                  </>
                )}
                {edit !== index && (
                  <>
                    <div className="w-full">
                      <div className="mr-2 break-words font-medium">
                        <div className="float-right pl-4 flex flex-row">
                          <div
                            onClick={() => {
                              if (common) {
                                setPrompt({ ...prompts[item], common: false });
                              } else {
                                setPrompt({ ...prompts[item], common: true });
                              }
                            }}
                            className="item-center pointer-events-auto flex-none rounded-md px-2 py-[0.3125rem] font-medium"
                          >
                            <button
                              className={clsx(
                                "hover:bg-yellow-300 rounded-full my-auto h-3 w-3",
                                common ? "bg-yellow-200" : "bg-yellow-500"
                              )}
                            ></button>
                          </div>
                          <div
                            onClick={() => {
                              setEditContent(prompts[item]);
                              setEdit(index);
                            }}
                            className="pointer-events-auto flex-none rounded-md px-2 py-[0.3125rem] font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
                          >
                            edit
                          </div>
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
                              removePrompt(title);
                            }}
                            className="pointer-events-auto flex-none rounded-md px-2 py-[0.3125rem] font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
                          >
                            remove
                          </div>
                        </div>
                        {title}
                      </div>
                      <div className="break-words mt-1 text-slate-700">
                        {content}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
      <div className="sticky top-0 m-4">
        <div className="flex flex-row">
          <div
            onClick={() => {
              setFormat("json");
            }}
            className={clsx(
              "w-full py-2 pointer-events-auto m-2 rounded-md px-2 font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50",
              format === "json" ? "bg-slate-300" : ""
            )}
          >
            JSON
          </div>
          <div
            onClick={() => {
              setFormat("markdown");
            }}
            className={clsx(
              "w-full py-2 pointer-events-auto m-2 rounded-md px-2 font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50",
              format === "markdown" ? "bg-slate-300" : ""
            )}
          >
            Markdown
          </div>
        </div>
        <div
          onClick={() => {
            const text = prepareText();
            navigator.clipboard.writeText(text);
          }}
          className="w-full py-2 pointer-events-auto m-2 rounded-md px-2 font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
        >
          Copy All
        </div>
        <div
          onClick={() => {
            const text = prepareText(true);
            navigator.clipboard.writeText(text);
          }}
          className="w-full py-2 pointer-events-auto m-2 rounded-md px-2 font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
        >
          Copy Filtered
        </div>
        <div
          onClick={() => {
            const blob = new Blob([prepareText()], {
              type: "text/plain;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `prompt-backup-${getCurrentTime()}.${
              format === "json" ? "json" : "md"
            }`;
            link.click();
            URL.revokeObjectURL(url);
          }}
          className="w-full py-2 pointer-events-auto m-2 rounded-md px-2 font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
        >
          Backup
        </div>
        <div
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.addEventListener("change", (event) => {
              const file = (event.target as any).files[0];
              handleFile(file);
            });
            input.click();
          }}
          ref={dropzoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="w-full border border-dashed border-slate-300 border-slate-500 py-2 pointer-events-auto m-2 rounded-md px-2 font-medium text-slate-700 ring-1 ring-slate-700/10 hover:bg-slate-50"
        >
          Import (from Json File)
        </div>
        <div
          onClick={() => {
            navigator.clipboard.readText().then((item) => {
              handleImport(item);
            });
          }}
          className="w-full py-2 pointer-events-auto m-2 rounded-md px-2 font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
        >
          Import (from Clipboard)
        </div>
      </div>
    </div>
  );
}
