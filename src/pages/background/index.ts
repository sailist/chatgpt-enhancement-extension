import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

console.log("background loaded 2023-04-11-20-33");

const inMemory = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "get-new-id") {
    if (sender.tab && inMemory[sender.tab.id]) {
      sendResponse({
        code: 200,
        msg: inMemory[sender.tab.id],
      });
    } else {
      sendResponse({
        code: 404,
        msg: "not found",
      });
    }
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log(details);
    const res = details.url.split("/");
    inMemory[details.tabId] = res[res.length - 1];
    // chrome.runtime.sendMessage("has-new-id", () => {});
  },
  { urls: ["*://chat.openai.com/backend-api/conversation/gen_title/*"] },
  []
);
// "https://chat.openai.com/backend-api/conversation/gen_title/65fa6a69-a848-4c7d-be51-798fa5d60ed0"
