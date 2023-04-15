import { Readability } from "@mozilla/readability";
import {
  FAIL_MSG,
  MT,
  PARSE_SELECTION,
  PARSE_SELECTION_RESULT,
  SUCCEED_MSG,
  addMessageListener,
  sendTabMessage,
} from "@src/common/message";
import { track } from "@src/common/track";
import { REGEX_GPTURL } from "@src/common/url";
import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */

console.log("background loaded 2023-04-11-20-33");
let initialized = false;

function initialize() {
  const inMemory = {};

  const status: { tabid?: number; pendingMessage? } = {};

  const setIcon = (ava: boolean) => {
    const avaStr = ava ? "ava" : "unava";
    chrome.action.setIcon(
      {
        path: {
          "32": `/icon-${avaStr}-32.png`,
          "16": `/icon-${avaStr}-16.png`,
        },
      },
      () => {}
    );
  };

  addMessageListener<any, any>((message, sender, sendResponse) => {
    if (message.type === MT.GET_RESPONSE_ID) {
      if (sender.tab && inMemory[sender.tab.id]) {
        sendResponse({
          type: "return-new-id",
          payload: inMemory[sender.tab.id],
          code: 200,
        });
      } else {
        sendResponse({
          type: "return-new-id",
          payload: "",
          code: 404,
        });
      }
    } else if (message.type === MT.REGISTER_GPT) {
      status["tabid"] = sender.tab.id;
      console.log("ChatGPT registered");
      setIcon(true);
      track("Registered chatgpt page", {});
      if (status.pendingMessage) {
        sendTabMessage<PARSE_SELECTION["payload"], any>(
          status["tabid"],
          status.pendingMessage
        )
          .then((message) => {
            track("pended message sended", {});
          })
          .catch(() => {
            track("pended message failed", {});
          })
          .finally(() => {
            status.pendingMessage = undefined;
          });
      }
    } else if (message.type === MT.GET_GPT_TABID) {
      if (status["tabid"]) {
        sendResponse({
          type: MT.GET_GPT_TABID,
          payload: status["tabid"],
          code: 200,
        });
      } else {
        sendResponse({
          type: MT.GET_GPT_TABID,
          payload: -1,
          code: 404,
        });
      }
    } else if (message.type === MT.PARSE_SELECTION) {
      const gptTabId = status["tabid"];
      const typedMsg = message as PARSE_SELECTION;
      typedMsg.payload.fromTab = sender.tab.id;

      if (gptTabId) {
        sendResponse(SUCCEED_MSG());
        sendTabMessage<PARSE_SELECTION["payload"], any>(gptTabId, message).then(
          (message) => {
            console.log("send page question");
          }
        );
      } else {
        sendResponse(SUCCEED_MSG());
        chrome.tabs.query({ url: "https://chat.openai.com/*" }).then((tabs) => {
          if (tabs.length > 0) {
            status.tabid = tabs[0].id;
            sendTabMessage<PARSE_SELECTION["payload"], any>(
              status.tabid,
              message
            )
              .then((message) => {
                console.log("send page question");
              })
              .catch(() => {
                status.pendingMessage = typedMsg;
                console.log("Cannot establish connection, reload chatgpt page");
                chrome.tabs.reload(status.tabid);
              });
            track("Find unconnected chatgpt page", {});
          } else {
            status.pendingMessage = typedMsg;
            chrome.tabs.create({
              url: "https://chat.openai.com/",
              active: false,
            });
            track("Create new chatgpt page", {});
          }
        });
        // sendResponse(FAIL_MSG("no chatgpt page found", 404));
      }
    } else if (message.type === MT.PARSE_SELECTION_RESULT) {
      const typedMsg = message as PARSE_SELECTION_RESULT;
      if (typedMsg.payload.toTab) {
        sendTabMessage<PARSE_SELECTION_RESULT["payload"], string>(
          typedMsg.payload.toTab,
          message
        ).then((message) => {
          console.log("response success", message);
        });
      }
    } else if (message.type === MT.ACTIVE_GPTPAGE) {
      if (status.tabid) {
        // chrome.tabs.
        chrome.tabs
          .update(status.tabid, { active: true })
          .then(() => {
            console.log(status);
          })
          .catch(() => {
            console.log("any error");
          });
        track("Find old chatgpt page", {});
        return;
      } else {
        chrome.tabs.query({ url: "https://chat.openai.com/*" }).then((tabs) => {
          if (tabs.length > 0) {
            status.tabid = tabs[0].id;
            chrome.tabs.update(tabs[0].id, { active: true }).then(() => {});
            track("Find unconnected chatgpt page", {});
          } else {
            chrome.tabs.create({
              url: "https://chat.openai.com/",
              active: false,
            });
            track("Create new chatgpt page", {});
          }
        });
      }
    }
    // const url = "https://chat.openai.com/";
    //         window.open(url, "_blank");
    else {
      sendResponse(FAIL_MSG(`no handler for ${message.type}`));
    }
  });

  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      console.log(details);
      const res = details.url.split("/");
      inMemory[details.tabId] = res[res.length - 1];
    },
    { urls: ["*://chat.openai.com/backend-api/conversation/gen_title/*"] },
    []
  );
  // "https://chat.openai.com/backend-api/conversation/gen_title/65fa6a69-a848-4c7d-be51-798fa5d60ed0"

  chrome.contextMenus.create({
    title: "ChatGPT Enhancement",
    id: "ask",
    contexts: ["selection"],
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    // Code to execute when the context menu is clicked
    const gptTabId = status["tabid"];
    if (gptTabId) {
      if (info.pageUrl.startsWith("chrome-extension")) {
        const typedMsg: PARSE_SELECTION = {
          code: 200,
          type: MT.PARSE_SELECTION,
          payload: { content: info.selectionText },
        };

        sendTabMessage<PARSE_SELECTION["payload"], any>(
          gptTabId,
          typedMsg
        ).then((message) => {
          console.log("send page question");
        });
      } else {
        const typedMsg: PARSE_SELECTION = {
          code: 200,
          type: MT.PARSE_SELECTION,
          payload: { content: info.selectionText, fromTab: tab.id },
        };

        sendTabMessage<PARSE_SELECTION["payload"], any>(
          gptTabId,
          typedMsg
        ).then((message) => {
          console.log("send page question");
        });
      }
    }
    console.log(info, tab);
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log(tabId, changeInfo, tab);
    if (status["tabid"] === tab.id && !REGEX_GPTURL.test(tab.url)) {
      status["tabid"] = undefined;
      console.log(changeInfo);
      console.log(tab);
      console.log("ChatGPT unused");
      setIcon(false);
    }
  });

  chrome.tabs.onRemoved.addListener((tabid, info) => {
    console.log(tabid, info);
    console.log(status);
    if (status.tabid === tabid) {
      setIcon(false);
      status.tabid = undefined;
    }
  });

  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      chrome.runtime.setUninstallURL(
        "https://github.com/sailist/chatgpt-enhancement-extension"
      );
    }
    track("installed", { details });
  });
}
if (!initialized) {
  initialize();
}
