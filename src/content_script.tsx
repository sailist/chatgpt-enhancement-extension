// import * as pdfjsLib from 'pdfjs-dist/webpack';
import * as pdfjsLib from 'pdfjs-dist'; // Error: 'Could not find a declaration file for module pdfjs-dist'
import { TextItem, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { GPTGroup, GPTPageHandler, MarkdownButton, PDFProcess } from './trigger';

const handler = new GPTPageHandler()
handler.addChatProcessor(new PDFProcess());
const mdbt = new MarkdownButton()
handler.addEventListener('response', mdbt);
handler.addEventListener('newpage', mdbt);
// class PDFProcess {
//   pdf: PDFDocumentProxy | null;
//   pageNumber: number;
//   process: number = 1;
//   stoped: boolean = false;
//   constructor() {
//     this.pdf = null;
//     this.pageNumber = 0;
//   }
//   initialize(pdf: PDFDocumentProxy) {
//     this.clear();
//     this.pdf = pdf;
//     console.log("Number of pages: " + pdf.numPages);
//     pdf.getPage(1).then(function (page) {
//       pdf_obj.parsePage(page, 1)
//     });
//   }

//   parsePage(page: PDFPageProxy, process: number) {
//     let that = this;
//     if (this.stoped) {
//       return;
//     }
//     page.getTextContent().then(function (textContent) {
//       // 搜索指定章节的文本
//       chrome.storage.sync.get(
//         {
//           prompt: "Summary the content",
//         },
//         (items) => {
//           var page_str = textContent.items.map(i => (i as any).str).join(' ')
//           var input = document.querySelector('form textarea') as HTMLTextAreaElement
//           var sendbt = document.querySelector('form button') as HTMLButtonElement
//           input.value = items.prompt + page_str
//           sendbt.click()
//           that.process = process;
//         }
//       );
//     });
//   }

//   clear() {
//     if (this.pdf) {

//       this.pdf.cleanup()
//       this.pageNumber = 0
//       this.stoped = false;
//       this.process = 0;
//     }
//   }

// }

var pdf_obj = new PDFProcess();

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.color) {
    console.log("Receive color = " + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else {
    sendResponse("Color message is none.");
  }
});

// function makeDragable() {
//   var dropzone = document.createElement('div');
//   // var dropzone = '';
//   // var dropzone = document.querySelector('body')!;
//   dropzone.textContent = 'drag & drop here'
//   dropzone.addEventListener('dragover', function (e) {
//     (e.target as HTMLElement).style.backgroundColor = ''
//     e.preventDefault();
//     e.stopPropagation();
//     this.style.border = '2px solid #ccc';
//   });
//   dropzone.addEventListener('dragleave', function (e) {
//     e.preventDefault();
//     e.stopPropagation();
//     this.style.border = '2px dashed #ccc';
//   });
//   dropzone.addEventListener('drop', function (e: DragEvent) {
//     e.preventDefault();
//     e.stopPropagation();
//     this.style.border = '2px dashed #ccc';
//     if (e.dataTransfer) {
//       var file = e.dataTransfer.files[0];
//       var reader = new FileReader();
//       reader.onload = function (event) {
//         var arrayBuffer = event.target!.result as ArrayBuffer;
//         // var dataView = new DataView(arrayBuffer);

//         // 使用 dataView 对象读取二进制数据
//         // var intData = dataView.getInt32(0);
//         // console.log("Binary data: " + arrayBuffer);
//         // pdfjsLib.getDocument("");
//         var data = new Uint8Array(arrayBuffer!);
//         var loadingTask = pdfjsLib.getDocument(data!);

//         loadingTask.promise.then(function (pdf) {
//           pdf_obj.initialize(pdf);

//         }, function (reason) {
//           // PDF loading error
//           console.error(reason);
//         });
//       };
//       reader.readAsArrayBuffer(file);
//     }
//   });
//   return dropzone;
// }


// function initialize() {
//   var dropzone = makeDragable();
//   var parent = document.querySelector('form textarea')
//   // var parent = document.querySelector('form')
//   pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

//   if (parent) {
//     parent.parentElement!.insertAdjacentElement("afterend", dropzone)
//     console.log(parent);
//   } else {
//     // Stop generating

//     console.log(parent);
//     parent = document.querySelector('form')
//     parent?.appendChild(dropzone)
//   }

// }


// 创建一个 MutationObserver 实例
var observer = new MutationObserver(function (mutations) {
  // onSwitchPage
  // onResponse
  // onStopGeneration
  // onTextareaCreate
  mutations.forEach(function (mutation) {
    if (mutation.target instanceof HTMLElement) {
      if (mutation.target.classList) {
        var markdown_node = null;
        if (mutation.type == 'attributes'
          && mutation.target.classList.contains("markdown")
          && !mutation.target.classList.contains("result-streaming")) {
          console.log(mutation)
          markdown_node = mutation.target;
          console.log('End response');
          let group_node = (
            markdown_node!.parentElement!.parentElement!.parentElement!.parentElement!.parentElement!
          )
          handler.onResponse(new GPTGroup(group_node as HTMLDivElement))
          // setTimeout(() => {
          //   if (pdf_obj.pdf) {
          //     if (pdf_obj.process < pdf_obj.pdf.numPages) {
          //       console.log(pdf_obj.pdf.getPage(pdf_obj.process + 1).then((page) => {
          //         pdf_obj.parsePage(page, pdf_obj.process + 1)
          //       }));
          //     }
          //   }
          // }, 2000)
          return
        } else if (mutation.target.textContent == 'Stop generating') {
          mutation.target.querySelector('button')?.addEventListener('click', () => {
            handler.onStopGeneration()
          })
          console.log(mutation);
          return
        } else if (mutation.type == 'childList' && mutation.target.querySelector('textarea[tabindex="0"]')) {
          let textarea = mutation.target.querySelector('textarea[tabindex="0"]')
          console.log("onTextareaCreate")
          handler.onTextareaCreate(textarea as HTMLTextAreaElement)
        } else if (mutation.target.tagName.toLowerCase() == 'nav') {
          console.log("onSwitchPage")
          console.log(mutation)
          handler.onSwitchPage()
        } else {
          // console.log(mutation)
        }
      }
    }
  });
});

// 配置 MutationObserver 监听选项
var config = {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true,
  characterDataOldValue: true,
};

// 开始监听目标元素变化
observer.observe(document.body, config);