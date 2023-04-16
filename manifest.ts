import packageJson from "./package.json";

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: "ChatGPT Enhancement",
  version: packageJson.version,
  description: packageJson.description,
  options_page: "src/pages/options/index.html",
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  action: {
    default_popup: "src/pages/popup/index.html",

    default_icon: {
      "16": "icon-unava-16.png",
      "32": "icon-unava-32.png",
    },
  },

  // chrome_url_overrides: {
  //   newtab: "src/pages/newtab/index.html",
  // },
  icons: {
    "128": "icon-128.png",
    "32": "icon-32.png",
    "16": "icon-16.png",
  },
  content_scripts: [
    {
      // matches: ["http://*/*", "https://*/*", "<all_urls>"],
      matches: ["<all_urls>"],
      js: ["src/pages/content/index.js"],
      // KEY for cache invalidation
      css: ["assets/css/contentStyle.chunk.css"],
    },
    {
      matches: ["https://chat.openai.com/*"],
      css: ["assets/css/optionsIndex.chunk.css"],
    },
  ],
  omnibox: { keyword: "." },

  // devtools_page: "src/pages/devtools/index.html",
  permissions: [
    "contextMenus", // To support getting selection text in extension (like pdf reader)
    // "scripting", // inject content scripts
    // sendMessage from background to tab, create/update active tab, listen update and remove event for chatgpt page detection
    "tabs", // sendMessage between tabs and background
    "activeTab", // query currently active tab
    "webRequest", // detect request url for id
    "storage", // storage dialogue history
    "unlimitedStorage", //
  ],
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "icon-128.png",
        "icon-32.png",
        "icon-ava-32.png",
        "icon-ava-16.png",
        "icon-unava-32.png",
        "icon-unava-16.png",
      ],
      matches: ["*://*/*"],
    },
  ],
  host_permissions: ["<all_urls>"],
};

export default manifest;
