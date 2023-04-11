function preCodeToMarkdown(pre: HTMLElement) {
  let lang_el = pre.querySelector("span");
  if (lang_el) {
    var lang = lang_el.textContent;
  } else {
    lang = "";
  }
  const code = pre.querySelector("code")!.textContent!;
  let markdown = "\n```" + lang;
  markdown += "\n";
  markdown += code.trim();
  markdown += "\n";
  markdown += "```\n";
  return markdown;
}

function padLeft(s: string, n: number): string {
  return s
    .split("\n")
    .map((item) => " ".repeat(n) + item)
    .join("\n");
}

function tableToMarkdown(table: HTMLElement) {
  function nodeListToList(nodeList: NodeList) {
    var list = [];
    for (var i = 0; i < nodeList.length; i++) {
      list.push(divToMarkdown(nodeList[i] as HTMLElement));
    }
    return list.join(" | ");
  }

  const thead = table.querySelector("thead")!;
  const column_num = thead.querySelectorAll("th").length;

  const tbody = table.querySelector("tbody")!;
  let markdown = "| " + nodeListToList(thead.querySelectorAll("th")) + " |\n";
  markdown += "| " + Array(column_num).fill("---").join(" | ") + " |\n";
  const trs = tbody.querySelectorAll("tr");
  for (var i = 0; i < trs.length; i++) {
    markdown += "| " + nodeListToList(trs[i].querySelectorAll("td")) + " |\n";
  }
  markdown += "\n";
  return markdown;
}

export function divToMarkdown(div: HTMLElement, level: number = 0) {
  var result = "";

  // 处理 div 元素的子元素
  for (var i = 0; i < div.childNodes.length; i++) {
    var node_cm = div.childNodes[i];

    // 如果当前节点是文本节点，则将其文本内容添加到结果中
    if (node_cm.nodeType === Node.TEXT_NODE) {
      let node = node_cm as Text;
      result += node.textContent!.trim();
    }
    // 如果当前节点是元素节点，则递归调用 divToMarkdown 函数，并将其结果添加到结果中
    else if (node_cm.nodeType === Node.ELEMENT_NODE) {
      let node = node_cm as HTMLElement;
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
          result += " `" + divToMarkdown(node) + "` ";
          break;
        case "del":
          result += " ~~" + divToMarkdown(node) + "~~ ";
          break;
        case "strong":
        case "b":
          result += " **" + divToMarkdown(node) + "** ";
          break;
        case "em":
        case "i":
          result += " _" + divToMarkdown(node) + "_ ";
          break;
        case "a":
          result +=
            "[" +
            divToMarkdown(node) +
            "](" +
            (node as HTMLLinkElement).href +
            ")";
          break;
        case "img":
          result +=
            "![" +
            (node as HTMLImageElement).alt +
            "](" +
            (node as HTMLImageElement).src +
            ")";
          break;
        case "br":
          result += "  \n";
          break;

        case "ul":
          for (var j = 0; j < node.childNodes.length; j++) {
            const child = node.childNodes[j];
            if (level > 0) {
              result += "\n";
            }
            result +=
              "    ".repeat(level) +
              "- " +
              divToMarkdown(node.childNodes[j] as HTMLElement, level + 1);

            if (level === 0) {
              result += "\n";
            }
          }
          if (level === 0) {
            result += "\n";
          }
          break;
        case "ol":
          for (var j = 0; j < node.childNodes.length; j++) {
            if (level > 0) {
              result += "\n";
            }
            result +=
              "    ".repeat(level) +
              (j + 1) +
              ". " +
              divToMarkdown(node.childNodes[j] as HTMLElement, level + 1);
            if (level === 0) {
              result += "\n";
            }
          }
          if (level === 0) {
            result += "\n";
          }
          break;
        case "li":
          result += divToMarkdown(node, level) + "\n";
          break;
        case "blockquote":
          result += "> " + divToMarkdown(node) + "\n\n";
          break;
        case "div":
          if (node.classList.contains("math")) {
            let math = node.querySelector(".katex-mathml")!.textContent;
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
