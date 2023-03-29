export function makeButton(name: string) {
  let bt = document.createElement("button");
  bt.className = "btn relative btn-neutral border-0 md:border";
  bt.classList.add("bt-" + name);
  bt.textContent = name;
  bt.style.cursor = "pointer";
  return bt;
}

export function copyTextToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {})
    .catch((error) => {});
}

export function applyStyle(el: HTMLElement, styles: { [key: string]: string }) {
  for (let key in styles) {
    el.style[key as any] = styles[key];
  }
}
