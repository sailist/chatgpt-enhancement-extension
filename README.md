# ChatGPT Enhancement Extension

![](images/small_promo.jpg)

To provide additional features to enhance the ChatGPT experience, including converting replies to markdown strings, uploading files, and automatically asking questions based on regular expressions.

Features:

- [Prompt hint](#prompt-hint): type "/" in input area and see the hint
- [PDF support](#pdf-support): Load PDF file and read page by page with [Regex Prompt Group](#regex-prompt-group)
- [Markdown support](#markdown-support): Convert dialogues into markdown format
- Save, Copy and Export: Copy, Save and Export dialogues by [injected button group](#injected-button-group).
- [Admin Dashboard](#admin-dashboard): Easy to managem all in option page.

## Prompt hint

![](images/prompt-hint.gif)

Type `Enter` to send prompt directly or `Tab` to edit it.

## PDF Support

Drag the PDF file into the textarea, then every page will generate a prompt automatically.

![](images/overview-pdf.gif)

Additional prompts will be added to the end of each page string based on the [Regex Prompt Group](#regex-prompt-group).

### Regex Prompt Group

![](images/reg-prompt-0.png)
![](images/reg-prompt-1.png)

## Markdown Support

![](images/preview.png)

### Injected Button Group

![](images/injected-button-preview.png)

## Admin Dashboard

Prompt hints:

![](images/dashboard-0.png)

Regex prompt groups:

![](images/dashboard-1.png)

Saved dialogue history:

![](images/dashboard-2.png)

## Load PDF and prompting questions based on regexp

- Step 1. Write your own regexp-supported pattern and prompt
- Step 2. Drop a PDF file in the textarea
- Step 3. Wait for response

Manage multiple regex-prompt group in option page:

![](images/options-preview-2.png)

# How to install

## Install from Chrome Web Store

> currently pending review

## Install from crx

In Chrome/Arc/Edge browser:

- [download dist.crx](./dist.crx)
- Go to the extensions management page
- Turn on `Developer mode`
- Click on `Load unpacked` among the buttons that appear
- Drag `./dist.crx` into the extensions management page.
- Refresh the ChatGPT page

> If you have any question about load extension, try asking ChatGPT

# Development

```
git clone --depth=1 https://github.com/sailist/chatgpt-enhancement-extension/
cd chatgpt-enhancement-extension
npm install
npm run dev

# load ./dist in Chrome browser
```

# Acknowledge

Thanks for the [chrome-extension-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite) scanfold and ChatGPT ❤.
