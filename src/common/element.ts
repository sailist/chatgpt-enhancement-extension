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

export function isFatherHasClass(el: Node, className) {
  while (el) {
    if (el instanceof HTMLElement) {
      if (el.classList.contains(className)) {
        return true;
      }
    }
    el = el.parentElement;
  }
  return false;
}

export function isFatherHasId(el: Node, id: string) {
  while (el) {
    if (el instanceof HTMLElement) {
      if (el.id === id) {
        return true;
      }
    }
    el = el.parentElement;
  }
  return false;
}
function areSetsEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
  return (
    set1.size === set2.size &&
    [...set1].every((item) => set2.has(item)) &&
    [...set2].every((item) => set1.has(item))
  );
}
export function keyEventEqualStr(e: KeyboardEvent, s: string) {
  const aim = new Set(s.toLowerCase().split("+"));
  // a.size === b.size && new Set([...a, ...b]).size === a.size
  const tgt = new Set();
  tgt.add(e.key);
  if (e.altKey) {
    tgt.add("alt");
  }
  if (e.metaKey) {
    tgt.add("meta");
  }
  if (e.ctrlKey) {
    tgt.add("ctrl");
  }
  return areSetsEqual(aim, tgt);
}
