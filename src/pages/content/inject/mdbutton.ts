import { divToMarkdown } from "@common/markdown";
import { makeButton, copyTextToClipboard, applyStyle } from "@common/element";

import { GPTEventListener, GPTGroup, GPTPageHandler } from "../inject/page";
import { track } from "@src/common/track";

export class MarkdownButton implements GPTEventListener {
  onProgress(gptGroup: GPTGroup): void {}
  plugin_name: string = "raw_markdown";
  gptpage?: GPTPageHandler;
  bindGPT(gptpage: GPTPageHandler): void {
    this.gptpage = gptpage;
  }
  onHooked(): void {}
  onUnHooked(): void {}
  onSwitchPage(old: boolean): void {
    console.log(this.gptpage?.groups.length);
    const that = this;
    this.gptpage?.groups.forEach((item) => {
      that.makeMarkdownWrap(item);
    });
  }

  makeButton(name: string) {
    const bt = document.createElement("button");
    bt.textContent = "Markdown";
    applyStyle(bt, {
      padding: "10px",
      marginRight: "10px",
      borderRadius: "4px",
      backgroundColor: "#ccc",
      color: "#000",
      border: "none",
      cursor: "pointer",
    });
    return;
  }
  makeButtonGroup(markdown_node: HTMLElement, preview_node: HTMLElement) {
    const wrap = document.createElement("div");
    applyStyle(wrap, {
      // display: "flex",
      // justifyContent: "space-between",
      // alignItems: "center",
      width: "100%",
      // maxWidth: "800px",
      margin: "0 auto",
    });

    const markdownButton = makeButton("Markdown");
    const previewButton = makeButton("Preview");
    const copyButton = makeButton("Copy");
    copyButton.style.float = "right";

    wrap.appendChild(markdownButton);
    wrap.appendChild(previewButton);
    wrap.appendChild(copyButton);

    // 定义一个函数来处理 div1 和 div2 的可见性
    function updateVisibility(markdownActive: boolean) {
      if (markdownActive) {
        const code = document.createElement("p");
        markdown_node.innerHTML = "";
        markdown_node.appendChild(code);
        code.textContent = divToMarkdown(preview_node);
        markdown_node.style.display = "block";
        preview_node.style.display = "none";
        markdownButton.style.backgroundColor = "lightgray";
        markdownButton.style.color = "gray";

        previewButton.style.color = null as any;
        previewButton.style.backgroundColor = null as any;
      } else {
        markdown_node.style.display = "none";
        preview_node.style.display = "block";
        markdownButton.style.color = null as any;
        markdownButton.style.backgroundColor = null as any;
        previewButton.style.backgroundColor = "lightgray";
        previewButton.style.color = "gray";
      }
    }
    previewButton.style.backgroundColor = "lightgray";
    previewButton.style.color = "gray";

    markdownButton.addEventListener("click", () => {
      updateVisibility(true);
      track("Click markdown button", {});
    });

    // 当点击 preview 按钮时，显示 div2，隐藏 div1
    previewButton.addEventListener("click", () => {
      updateVisibility(false);
      track("Click preview button", {});
    });

    copyButton.addEventListener("click", () => {
      copyTextToClipboard(markdown_node.textContent!);
      track("Click copy button", {});
    });
    return wrap;
  }

  makeMarkdownWrap(gptGroup: GPTGroup) {
    if (
      gptGroup.response!.classList.contains("remarked") &&
      gptGroup.response!.querySelector(".raw-text")
    ) {
      return;
    }

    const preview_node = gptGroup.response!.querySelector(
      ".markdown"
    )! as HTMLElement;

    console.log(gptGroup);

    const markdown_node = document.createElement("pre");
    markdown_node.className = "raw-text";
    markdown_node.style.whiteSpace = "break-spaces";
    const code = document.createElement("p");
    markdown_node.appendChild(code);
    markdown_node.style.display = "none";
    code.textContent = divToMarkdown(preview_node);

    gptGroup.response!.classList.add("remarked");

    const wrap = this.makeButtonGroup(markdown_node, preview_node);
    preview_node.insertAdjacentElement("afterend", markdown_node);
    preview_node.insertAdjacentElement("beforebegin", wrap);
  }

  onResponse(gptGroup: GPTGroup): void {
    console.log("onResponse");
    this.makeMarkdownWrap(gptGroup);
  }
  onStopGeneration(): void {}
  onTextareaCreate(el: HTMLTextAreaElement): void {
    console.log("change placeholder");
  }
  onSendStart(): void {}
}
