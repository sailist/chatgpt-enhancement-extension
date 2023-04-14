console.log("content loaded");

/**
 * @description
 * Chrome extensions don't support modules in content scripts.
 */
if (/https:\/\/chat.openai.com\/.*/.test(document.URL)) {
  import("./sidebar");
}
import("./select");
