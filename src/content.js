// document.body.style.backgroundColor = "yellow";
function preCodeToMarkdown(pre) {
  lang = pre.querySelector("span");
  if (lang) {
    lang = lang.textContent;
  } else {
    lang = "";
  }
  code = pre.querySelector("code").textContent;
  markdown = "\n```" + lang;
  markdown += "\n";
  markdown += code.trim();
  markdown += "\n";
  markdown += "```\n";
  return markdown;
}

function tableToMarkdown(table) {
  function nodeListToList(nodeList) {
    var list = [];
    for (var i = 0; i < nodeList.length; i++) {
      list.push(nodeList[i].textContent);
    }
    return list.join(" | ");
  }

  thead = table.querySelector("thead");
  column_num = thead.querySelectorAll("th").length;

  tbody = table.querySelector("tbody");
  markdown = "| " + nodeListToList(thead.querySelectorAll("th")) + " |\n";
  markdown += "| " + Array(column_num).fill("---").join(" | ") + " |\n";
  trs = tbody.querySelectorAll("tr");
  for (var i = 0; i < trs.length; i++) {
    markdown += "| " + nodeListToList(trs[i].querySelectorAll("td")) + " |\n";
  }
  markdown += "\n";
  return markdown;
}

function divToMarkdown(div) {
  var result = "";

  // 处理 div 元素的子元素
  for (var i = 0; i < div.childNodes.length; i++) {
    var node = div.childNodes[i];

    // 如果当前节点是文本节点，则将其文本内容添加到结果中
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent.trim();
    }
    // 如果当前节点是元素节点，则递归调用 divToMarkdown 函数，并将其结果添加到结果中
    else if (node.nodeType === Node.ELEMENT_NODE) {
      switch (node.tagName.toLowerCase()) {
        case "p":
          result += divToMarkdown(node) + "\n\n";
          break;
        case "h1":
          result += "# " + divToMarkdown(node) + "\n\n";
          break;
        case "h2":
          result += "## " + divToMarkdown(node) + "\n\n";
          break;
        case "h3":
          result += "### " + divToMarkdown(node) + "\n\n";
          break;
        case "h4":
          result += "#### " + divToMarkdown(node) + "\n\n";
          break;
        case "h5":
          result += "##### " + divToMarkdown(node) + "\n\n";
          break;
        case "h6":
          result += "###### " + divToMarkdown(node) + "\n\n";
          break;
        case "code":
          result += "`" + divToMarkdown(node) + "`";
          break;
        case "del":
          result += "~~" + divToMarkdown(node) + "~~";
          break;
        case "strong":
        case "b":
          result += "**" + divToMarkdown(node) + "**";
          break;
        case "em":
        case "i":
          result += "_" + divToMarkdown(node) + "_";
          break;
        case "a":
          result += "[" + divToMarkdown(node) + "](" + node.href + ")";
          break;
        case "img":
          result += "![" + node.alt + "](" + node.src + ")";
          break;
        case "br":
          result += "  \n";
          break;
        case "ul":
          for (var j = 0; j < node.childNodes.length; j++) {
            result += "- " + divToMarkdown(node.childNodes[j]) + "\n";
          }
          result += "\n";
          break;
        case "ol":
          for (var j = 0; j < node.childNodes.length; j++) {
            result += j + 1 + ". " + divToMarkdown(node.childNodes[j]) + "\n";
          }
          result += "\n";
          break;
        case "li":
          result += divToMarkdown(node) + "\n";
          break;
        case "blockquote":
          result += "> " + divToMarkdown(node) + "\n\n";
          break;
        case "div":
          if (node.classList.contains("math")) {
            math = node.querySelector(".katex-mathml").textContent;
            result += "\n$$\n" + math + "\n$$\n";
          }
          break;
        case "table":
          result += tableToMarkdown(node);
          break;
        case "pre":
          result += preCodeToMarkdown(node);
          break;
        default:
          result += divToMarkdown(node);
      }
    }
  }

  return result;
}

function makeButton(name) {
  bt = document.createElement("button");
  bt.className = "btn relative btn-neutral border-0 md:border";
  bt.classList.add("bt-" + name);
  bt.textContent = name;
  bt.style.cursor = "pointer";
  return bt;
}

function copyTextToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {})
    .catch((error) => {});
}

function injectTab(markdown_node) {
  if (markdown_node.classList.contains("remarked")) {
    return;
  }
  markdown_node.paren;
  markdown_node.classList.add("remarked");
  wrap = document.createElement("div");
  wrap.style.width = "100%";
  wrap.className = "toolbox";

  old_wrap = markdown_node.parentElement.querySelector("div.toolbox");
  if (old_wrap) {
    old_wrap.remove();
  }

  mdbt = makeButton("markdown");
  prebt = makeButton("preview");
  cpbt = makeButton("copy");
  cpbt.style.float = "right";

  wrap.appendChild(mdbt);
  wrap.appendChild(prebt);
  wrap.appendChild(cpbt);

  function btToParent(bt) {
    return bt.parentElement.parentElement;
  }

  cpbt.addEventListener("click", (e) => {
    // console.log(e);
    // console.log(cpbt.parentElement.parentElement.querySelector("pre.raw-text"));
    content = btToParent(e.srcElement)
      .querySelector("pre.raw-text")
      .querySelector("p");
    console.log(content.textContent);
    copyTextToClipboard(content.textContent);
  });

  mdbt.addEventListener("click", (e) => {
    mdbt_ = e.srcElement;
    prebt_ = mdbt_.parentElement.querySelector("button.bt-preview");
    mdbt_.style.backgroundColor = "gray";
    prebt_.style.backgroundColor = null;

    markdown_node = btToParent(e.srcElement).querySelector("div.markdown");
    pre = btToParent(e.srcElement).querySelector("pre.raw-text");

    markdown_node.style.display = "none";
    pre.style.display = "block";
  });

  prebt.addEventListener("click", (e) => {
    prebt_ = e.srcElement;
    mdbt_ = prebt_.parentElement.querySelector("button.bt-markdown");

    prebt_.style.backgroundColor = "gray";
    mdbt_.style.backgroundColor = null;

    markdown_node = btToParent(e.srcElement).querySelector("div.markdown");
    pre = btToParent(e.srcElement).querySelector("pre.raw-text");

    pre.style.display = "none";
    markdown_node.style.display = "block";
  });

  markdown_node.insertAdjacentElement("beforebegin", wrap);

  old_pre = markdown_node.parentElement.querySelector("pre.raw-text");
  if (old_pre) {
    old_pre.remove();
  }

  pre = document.createElement("pre");
  pre.className = "raw-text";
  pre.style.whiteSpace = "break-spaces";
  code = document.createElement("p");
  pre.appendChild(code);

  code.textContent = divToMarkdown(markdown_node);

  markdown_node.insertAdjacentElement("afterend", pre);
  pre.style.display = "none";
  prebt.style.backgroundColor = "gray";
}

// 创建一个 MutationObserver 实例
var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.target.classList) {
      markdown_node = null;
      if (mutation.target.classList.contains("markdown")) {
        markdown_node = mutation.target;
      } else {
        if (mutation.target.querySelector(".markdown")) {
          markdown_node = mutation.target.querySelector(".markdown");
        }
      }
      if (markdown_node) {
        injectTab(markdown_node);
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
