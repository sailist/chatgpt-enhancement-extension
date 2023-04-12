import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { getCurrentTime } from "../utils";

const CONST_KEYNAME = "reg_prompt_key";

export interface RegPromptValue {
  title: string;
  prefix: string;
  contents: { regex: string; prompt: string }[];
}

const EMPTY: RegPromptValue = {
  title: "",
  prefix: "Answer the following question",
  contents: [{ regex: ".*", prompt: "Summary the content" }],
};

export const DEFAULT_REGPROMPT: RegPrompts = {
  default: {
    title: "default",
    prefix: "Answer the following question one by one: ",
    contents: [
      { regex: ".*", prompt: "Summary the content" },
      { regex: "table.*", prompt: "What is table $1 trying to explain" },
      {
        regex: "method",
        prompt:
          "Prompting 3 question about the proposed method, then reply it one by one",
      },
      {
        regex: "method",
        prompt: "The abbr of the proposed method and its components.",
      },
      {
        regex: "table\\s?([0-9]+)",
        prompt: "What does Table $1 try to prove?",
      },
      {
        regex: "dataset",
        prompt: "What datasets dose the paper use?",
      },
    ],
  },

  defaultChinses: {
    title: "默认",
    prefix: "逐项用中文回答以下问题: ",
    contents: [
      { regex: ".*", prompt: "总结这段内容" },
      {
        regex: "method",
        prompt: "对内容中难以理解部分，提出三个问题并依次回答",
      },
      {
        regex: "table\\s?([0-9]+)",
        prompt: "表格 $1 解释了哪些内容?",
      },
      {
        regex: "dataset",
        prompt: "文中用到了哪些数据集?",
      },
    ],
  },
};

type RegPrompts = {
  [key: string]: RegPromptValue;
};

type RegPromptKeys = string[];

function _(k: string) {
  return "regp+" + k;
}
function __(k: string[]) {
  return k.map((item) => _(item));
}

interface PromptsProp {
  sidebar?: boolean;
  onSelectChange?: (prompt: RegPromptValue) => void;
}

export default function RegPrompts(props: PromptsProp) {
  const { sidebar, onSelectChange } = Object.assign(
    { sidebar: false, onSelectChange: () => {} },
    props
  );
  const [menuExpand, setMenuExpand] = useState(false);
  const [menuSelected, setMenuSelected] = useState("");

  const [edit, setEdit] = useState(-1);
  const [format, setFormat] = useState("json");
  // const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState<RegPromptValue>(EMPTY);
  // const classes = useStyles();
  const dropzoneRef = useRef<any>();

  const [filter, setFilter] = useState("");

  const [prompts, setPrompts] = useState<RegPrompts>(DEFAULT_REGPROMPT);

  useEffect(() => {
    console.log("keys");

    chrome.storage.local.get(
      { reg_prompt_keys: ["default"], currentRegPrompt: null } as {
        reg_prompt_keys: RegPromptKeys;
        currentRegPrompt: RegPromptValue;
      },
      (items) => {
        const { reg_prompt_keys, currentRegPrompt } = items as {
          reg_prompt_keys: RegPromptKeys;
          currentRegPrompt: RegPromptValue;
        };

        chrome.storage.local.get(__(reg_prompt_keys), (items) => {
          if (sidebar) {
            if (currentRegPrompt) {
              setMenuSelected(currentRegPrompt.title);
            } else if (Object.keys(items).length > 0) {
              const newPrompts = Object.assign({}, items);
              setPrompts(newPrompts);
              setMenuSelected(items[Object.keys(items)[0]].title);
            } else {
              setMenuSelected("default");
            }
          }
        });
      }
    );
  }, []);

  const addRegexItem = () => {
    const newContents = editContent.contents.slice();
    newContents.push({ regex: "", prompt: "" });
    setEditContent({ ...editContent, contents: newContents });
  };

  const removeRegexItem = (index: number) => {
    const newContents = editContent.contents.slice();
    newContents.splice(index, 1);
    setEditContent({ ...editContent, contents: newContents });
  };

  const setEditRegexItem = (regex: string, index: number) => {
    const newContents = editContent.contents.slice();
    newContents[index]["regex"] = regex;
    setEditContent({ ...editContent, contents: newContents });
  };

  const setEditPrefix = (prefix: string) => {
    setEditContent({ ...editContent, prefix: prefix });
  };

  const setEditTitle = (title: string) => {
    setEditContent({ ...editContent, title: title });
    console.log({ ...editContent, title: title });
  };

  const setEditPromptItem = (prompt: string, index: number) => {
    const newContents = editContent.contents.slice();
    newContents[index]["prompt"] = prompt;
    setEditContent({ ...editContent, contents: newContents });
  };

  const removePrompt = (title: string) => {
    chrome.storage.local.get(
      { reg_prompt_keys: ["default"] } as { reg_prompt_keys: RegPromptKeys },
      (items) => {
        const { reg_prompt_keys } = items as { reg_prompt_keys: RegPromptKeys };
        const res: { [key: string]: any } = {};
        const newPromptKeys = reg_prompt_keys.filter((item) => item !== title);
        chrome.storage.local.remove(_(title), () => {
          chrome.storage.local.set({ reg_prompt_keys: newPromptKeys }, () => {
            const newPrompts = Object.assign({}, prompts);
            delete newPrompts[_(title)];
            setPrompts(newPrompts);
          });
        });
      }
    );
  };

  const setPrompt = (
    title: string,
    content: RegPromptValue,
    oldTitle?: string
  ) => {
    chrome.storage.local.get(
      { reg_prompt_keys: ["default"] } as { reg_prompt_keys: RegPromptKeys },
      (items) => {
        const title = content.title;
        const { reg_prompt_keys } = items as { reg_prompt_keys: RegPromptKeys };
        const res: { [key: string]: any } = {};
        const newPrompKeys = reg_prompt_keys.filter(
          (item) => item !== oldTitle
        );
        newPrompKeys.push(title);
        res["reg_prompt_keys"] = newPrompKeys;
        if (oldTitle) {
          delete res[_(oldTitle)];
        }
        res[_(title)] = content;
        chrome.storage.local.set(res, () => {
          const newPrompts = Object.assign({}, prompts);
          newPrompts[_(title)] = content;
          if (oldTitle !== title) {
            delete newPrompts[_(oldTitle)];
          }
          setPrompts(newPrompts);
        });
      }
    );
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
          return (
            "## " +
            item.title +
            "\n\n" +
            item.prefix +
            "\n\n" +
            item.contents
              .map((content) => {
                return `- \`${content.regex}\` : ${content.prompt}`;
              })
              .join("\n") +
            "\n\n"
          );
        })
        .join("\n");
      return text;
    }
  };

  const handleImport = (jsonStr: string) => {
    const importPrompts: RegPromptValue[] = JSON.parse(jsonStr);
    chrome.storage.local.get(
      { reg_prompt_keys: ["default"] } as { reg_prompt_keys: RegPromptKeys },
      (items) => {
        const res: { [key: string]: any } = {};
        importPrompts.forEach((item) => {
          res[_(item.title)] = item;
        });

        const newPrompts = Object.assign({}, prompts, res);
        const { reg_prompt_keys } = items as { reg_prompt_keys: RegPromptKeys };
        const newPrompKeys = Array.from(
          new Set(
            reg_prompt_keys.concat(importPrompts.map((item) => item.title))
          )
        );
        res["reg_prompt_keys"] = newPrompKeys;

        chrome.storage.local.set(res, () => {
          setPrompts(newPrompts);
        });
      }
    );
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

  console.log(maxIndex);
  return (
    <div className="flex flex-row">
      <div className="w-[40.5rem] divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
        {!sidebar && (
          <div className="sticky bg-white top-0 hidden w-full lg:flex items-center text-sm leading-6 text-slate-400 rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3 hover:ring-slate-300 dark:bg-slate-800 dark:highlight-white/5 dark:hover:bg-slate-700">
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
        )}
        <div>
          {sidebar && (
            <div className="relative mt-2">
              <button
                type="button"
                onClick={() => {
                  setMenuExpand(!menuExpand);
                }}
                className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
              >
                {menuSelected}
              </button>
              {menuExpand && (
                <ul
                  className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                  tabIndex={-1}
                  role="listbox"
                  aria-labelledby="listbox-label"
                  aria-activedescendant="listbox-option-3"
                >
                  {Object.keys(prompts).map((item, index) => {
                    return (
                      <li
                        key={index}
                        onClick={() => {
                          setMenuExpand(false);
                          setMenuSelected(prompts[item].title);
                          onSelectChange(prompts[item]);
                        }}
                        className="hover:bg-slate-200 text-gray-900 relative cursor-default select-none py-2 pl-3 pr-9"
                        role="option"
                      >
                        <div className="flex items-center">
                          <span className="font-normal ml-3 block truncate">
                            {prompts[item].title}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {Object.keys(prompts)
          .concat(["---"])
          .map((item, index) => {
            const { title, prefix, contents } = prompts[item] || editContent;
            if (sidebar && menuSelected !== title) {
              return <></>;
            }
            if (filter.trim().length > 0 && title.indexOf(filter) < 0) {
              return <div key={index}></div>;
            }

            if (index === maxIndex && edit !== maxIndex) {
              if (sidebar) {
                return <></>;
              }
              return (
                <div className="flex p-4 text-center" key={index}>
                  <div
                    onClick={() => {
                      setEditContent(EMPTY);
                      setEdit(index);
                    }}
                    className="w-full py-2 pointer-events-auto m-2 rounded-md px-2 font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
                  >
                    Add
                  </div>
                  <div
                    onClick={() => {
                      chrome.storage.local.get(
                        { reg_prompt_keys: ["default"] } as {
                          reg_prompt_keys: RegPromptKeys;
                        },
                        (items) => {
                          const { reg_prompt_keys } = items as {
                            reg_prompt_keys: RegPromptKeys;
                          };

                          chrome.storage.local.remove(
                            __(reg_prompt_keys),
                            () => {
                              chrome.storage.local.set(
                                { reg_prompt_keys: [] },
                                () => {
                                  setPrompts({});
                                }
                              );
                            }
                          );
                        }
                      );
                    }}
                    className="w-full text-white bg-red-500 py-2 pointer-events-auto m-2 rounded-md px-2 font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-red-700 "
                  >
                    Clear
                  </div>
                </div>
              );
            }

            const editmode = edit === index;

            return (
              <div key={index} className="flex p-4">
                <>
                  <div className="w-full">
                    <div className="mr-2 break-words font-medium flex justify-between">
                      {/* 标题，sidebar 因为有下拉框省略 */}
                      {!sidebar && (
                        <div className="w-full">
                          {editmode ? (
                            <input
                              placeholder="title"
                              onChange={(event) => {
                                setEditTitle(event.target.value);
                              }}
                              className="w-full"
                              value={editContent.title}
                            />
                          ) : (
                            title
                          )}
                        </div>
                      )}

                      <div className="ml-auto pl-4 flex flex-row">
                        {/* 按钮 */}
                        {!sidebar && (
                          <>
                            {editmode ? (
                              <>
                                <div
                                  onClick={() => {
                                    setPrompt("unused", editContent, title);
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
                              </>
                            ) : (
                              <>
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
                                    navigator.clipboard.writeText(
                                      JSON.stringify(prompts[item])
                                    );
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
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="break-words mt-1 text-slate-700">
                      {/* 通用前缀 */}
                      {editmode ? (
                        <textarea
                          className="w-full resize-y"
                          placeholder="prefix"
                          onChange={(event) => {
                            setEditPrefix(event.target.value);
                            console.log(event.target.value);
                          }}
                          value={editContent.prefix}
                        />
                      ) : (
                        prefix
                      )}
                    </div>
                    <div className="break-words mt-1 text-slate-700">
                      <table className="w-full border-collapse border border-slate-400">
                        <thead>
                          <tr>
                            <th className="border border-slate-300">Regex</th>
                            <th className="border border-slate-300">Prompt</th>
                            {editmode && (
                              <th className="border border-slate-300">x</th>
                            )}
                          </tr>
                        </thead>
                        {(editmode ? editContent.contents : contents).map(
                          (item, index) => {
                            return (
                              <tbody key={index}>
                                <tr>
                                  <td className="px-2 py-1 border border-slate-300">
                                    {editmode ? (
                                      <textarea
                                        value={item.regex}
                                        className="w-full"
                                        onChange={(event) => {
                                          setEditRegexItem(
                                            event.target.value,
                                            index
                                          );
                                        }}
                                        placeholder="regex"
                                      />
                                    ) : (
                                      item.regex
                                    )}
                                  </td>
                                  <td className="px-2 py-1 border border-slate-300">
                                    {editmode ? (
                                      <textarea
                                        className="w-full"
                                        onChange={(event) => {
                                          setEditPromptItem(
                                            event.target.value,
                                            index
                                          );
                                        }}
                                        placeholder="prompt"
                                        value={item.prompt}
                                      />
                                    ) : (
                                      item.prompt
                                    )}
                                  </td>
                                  {editmode && (
                                    <td className="px-2 py-1 items-center border border-slate-300">
                                      <div
                                        onClick={() => {
                                          removeRegexItem(index);
                                        }}
                                        className="text-center pointer-events-auto flex-none rounded-md px-2 py-[0.3125rem] font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
                                      >
                                        X
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              </tbody>
                            );
                          }
                        )}
                      </table>
                      {editmode && (
                        <div
                          onClick={() => {
                            addRegexItem();
                          }}
                          className="pointer-events-auto ml-4 flex-none rounded-md px-2 py-[0.3125rem] font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
                        >
                          add row
                        </div>
                      )}
                    </div>
                  </div>
                </>
              </div>
            );
          })}
      </div>
      {!sidebar && (
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
              const input = document.createElement("input");
              input.type = "file";
              input.addEventListener("change", (event) => {
                const file = event.target.files[0];
                handleFile(file);
              });
              input.click();
            }}
            ref={dropzoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="w-full border border-dashed py-2 pointer-events-auto m-2 rounded-md px-2 font-medium text-slate-700 ring-1 ring-slate-700/10 hover:bg-slate-50"
          >
            Import (from Json File)
          </div>
          <div
            onClick={() => {
              navigator.clipboard.readText().then((item) => {
                handleImport(item);
              });
            }}
            ref={dropzoneRef}
            className="w-full border border-dashed py-2 pointer-events-auto m-2 rounded-md px-2 font-medium text-slate-700 ring-1 ring-slate-700/10 hover:bg-slate-50"
          >
            Import (from Clipboard)
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
            ref={dropzoneRef}
            className="w-full border border-dashed py-2 pointer-events-auto m-2 rounded-md px-2 font-medium text-slate-700 ring-1 ring-slate-700/10 hover:bg-slate-50"
          >
            Backup
          </div>
        </div>
      )}
    </div>
  );
}
