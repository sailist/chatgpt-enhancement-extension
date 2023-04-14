import React from "react";
import logo from "@assets/img/logo.svg";
import "@pages/popup/Popup.css";
import { MT, sendMessage } from "@src/common/message";
import { Readability } from "@mozilla/readability";

const Popup = () => {
  return (
    <div className="App">
      <button
        onClick={() => {
          console.log("click");
          sendMessage<any, number>({ type: MT.GET_GPT_TABID }).then(
            (message) => {
              console.log("injected result");
              if (message.code === 200) {
                const gptTabId = message.payload!;
                chrome.tabs
                  .query({ active: true, currentWindow: true }) // 查询当前 tab
                  .then(function (tabs) {
                    // 注入执行代码
                    console.log("execute in currentTab");
                    const currentTabId = tabs[0].id;

                    return chrome.scripting.executeScript({
                      target: { tabId: currentTabId },
                      func: function () {
                        return {
                          body: document.body.outerHTML,
                          url: document.URL,
                        };
                      },
                    });
                  }) // 注入执行代码
                  .then(function (doc) {
                    console.log("injected get result");

                    const newDocument = new DOMParser().parseFromString(
                      doc[0].result.body,
                      "text/html"
                    );
                    const article = new Readability(newDocument, {}).parse();

                    console.log(article.textContent);
                  }); // 分析文档内容
              }
            }
          );
        }}
      >
        try send
      </button>
    </div>
  );
};

export default Popup;
