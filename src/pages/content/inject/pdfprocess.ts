import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.5.141/pdf.worker.min.js";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
// import { AppState, defaultState } from "./components/prompt";
import { RegPromptValue } from "@src/pages/options/main/RegPrompts";
import { GPTEventListener, GPTGroup, GPTPageHandler } from "../inject/page";
import { storage } from "@src/common";
import { track } from "@src/common/track";

export class PDFProcess implements GPTEventListener {
  onProgress(gptGroup: GPTGroup): void {}
  plugin_name = "pdf_process";
  gptpage?: GPTPageHandler;
  pdf?: PDFDocumentProxy;
  text?: string[];
  stoped = false;
  process = 0;

  onTextareaCreate(el: HTMLTextAreaElement) {
    const that = this;
    const dropzone = el.parentElement as HTMLElement;
    dropzone.style.border = "2px dashed #ccc";
    console.log("Try Adding dropable");
    if (!dropzone.classList.contains("dropable")) {
      dropzone.addEventListener("dragover", function (e) {
        (e.target as HTMLElement).style.backgroundColor = "";
        e.preventDefault();
        e.stopPropagation();
        this.style.border = "2px dashed #ccc";
      });
      dropzone.addEventListener("dragleave", function (e) {
        this.style.border = "2px dashed #ccc";
        e.preventDefault();
        e.stopPropagation();
        this.style.border = "2px solid #ccc";
      });
      dropzone.addEventListener("drop", function (e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        this.style.border = "2px dashed #ccc";
        if (e.dataTransfer) {
          const file = e.dataTransfer.files[0];
          const fn = file.name.toLowerCase();
          if (fn.endsWith("pdf")) {
            that.onDropFile(file);
            track("Drag PDF file", {});
          } else if (fn.endsWith("pptx")) {
          } else {
            that.onDropText(file);
            const suff = fn.split(".");
            track("Drag other file", { suff: suff[suff.length - 1] });
          }
        } else {
        }
      });
      dropzone.classList.add("dropable");
      console.log("Add dropable");
      console.log(dropzone);
    }
  }

  bindGPT(gptpage: GPTPageHandler): void {
    this.gptpage = gptpage;
    this.gptpage.vote(this);
    console.log("bind pdf processor");
  }
  onSwitchPage(old: boolean): void {}

  onHooked() {}
  onUnHooked() {}

  onResponse(gptGroup: GPTGroup) {
    const that = this;
    that.process++;
    setTimeout(() => {
      if (that.pdf) {
        that.sendNextPage();
      } else if (that.text) {
        that.sendNextText();
      }
    }, 2000);
  }
  onSendStart() {
    // throw new Error("Method not implemented.");
  }
  onStopGeneration() {
    // throw new Error("Method not implemented.");
    this.stoped = true;
  }
  onDropText(file: File) {
    console.log("onDropFile");
    console.log(file);
    const that = this;
    var reader = new FileReader();

    reader.onload = function (event) {
      var textContent = event.target!.result as string;
      that.text = textContent.split("\n\n");
      // 这里可以对读取到的文本内容进行处理
      that.pdf = undefined;
      that.stoped = false;
      that.process = -1;
      that.sendNextText();
    };
    reader.readAsText(file);
  }
  onDropFile(file: File) {
    const that = this;
    var reader = new FileReader();

    reader.onload = function (event) {
      var arrayBuffer = event.target!.result as ArrayBuffer;
      var data = new Uint8Array(arrayBuffer!);
      var loadingTask = pdfjsLib.getDocument(data!);

      loadingTask.promise.then(
        function (pdf) {
          that.pdf = pdf;
          that.text = undefined;
          that.stoped = false;
          that.process = 0;
          console.log("load pdf success");
          that.sendNextPage();
        },
        function (reason) {
          console.error(reason);
        }
      );
    };
    reader.readAsArrayBuffer(file);
  }

  sendNextText() {
    const gptPage = this.gptpage!;
    gptPage.vote(this);
    if (this.stoped) {
      console.log("if (this.stoped) {");
      return;
    }

    if (!this.text) {
      console.log("if (!this.pdf) {");
      return;
    }

    let page_n = this.process;
    if (page_n >= this.text.length) {
      console.log("if (page_n >= this.pdf.numPages) {");
      return;
    }

    const that = this;
    storage
      .get<RegPromptValue>("currentRegPrompt", {
        title: "default",
        prefix: "未找到可用 Prompt",
        contents: [],
      })
      .then((regPrompt) => {
        const page_str = that.text![that.process + 1];
        const matchedPrompt = regPrompt.contents
          .map((item) => {
            const pattern = new RegExp(item.regex);
            return {
              pattern: pattern,
              match: pattern.exec(page_str.toLowerCase()),
              prompt: item.prompt,
            };
          })
          .filter((item) => {
            console.log(item);
            return item.match;
          });

        let prompt_str = "";
        if (matchedPrompt.length == 0) {
          that.process++;
          that.sendNextText();
          return;
        }
        prompt_str =
          matchedPrompt
            .map((item) => {
              let prompt = item.prompt;
              for (let i = 1; i < item.match!.length; i++) {
                prompt = prompt.replace(`$${i}`, item.match![i]);
              }
              return ` - ${prompt}`;
            })
            .join("\n") + "\n";
        prompt_str = `\n${regPrompt.prefix}\n${prompt_str}`;
        gptPage.send(page_str + prompt_str);
      });
  }

  sendNextPage() {
    const gptPage = this.gptpage!;
    gptPage.vote(this);
    if (this.stoped) {
      console.log("if (this.stoped) {");
      return;
    }

    if (!this.pdf) {
      console.log("if (!this.pdf) {");
      return;
    }

    const page_n = this.process;
    if (page_n >= this.pdf.numPages) {
      console.log("if (page_n >= this.pdf.numPages) {");
      return;
    }

    this.pdf.getPage(page_n + 1).then(function (page) {
      page.getTextContent().then(function (page_content) {
        storage
          .get<RegPromptValue>("currentRegPrompt", {
            title: "default",
            prefix: "未找到可用 Prompt",
            contents: [],
          })
          .then((regPrompt) => {
            const page_str = page_content.items
              .map((i) => (i as any).str)
              .join(" ");
            const matchedPrompt = regPrompt.contents
              .map((item) => {
                const pattern = new RegExp(item.regex);
                return {
                  pattern: pattern,
                  match: pattern.exec(page_str.toLowerCase()),
                  prompt: item.prompt,
                };
              })
              .filter((item) => {
                console.log(item);
                return item.match;
              });

            let prompt_str = "";
            prompt_str =
              matchedPrompt
                .map((item) => {
                  let prompt = item.prompt;
                  for (let i = 1; i < item.match!.length; i++) {
                    prompt = prompt.replace(`$${i}`, item.match![i]);
                  }
                  return ` - ${prompt}`;
                })
                .join("\n") + "\n";
            prompt_str = `\n${regPrompt.prefix}\n${prompt_str}`;
            gptPage.send(page_str + prompt_str);
          });
      });
    });
  }
}
