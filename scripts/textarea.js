el = document.querySelector("textarea");
el.addEventListener("keydown", (e) => {
  console.log(e);
});
el.dispatchEvent(
  new KeyboardEvent("keydown", {
    keyCode: 13,
    key: "Enter",
  })
);

el.dispatchEvent(
  new InputEvent("beforeinput", {
    inputType: "insertText",
    data: "d",
  })
);

el.dispatchEvent(
  new InputEvent("input", {
    inputType: "insertText",
    data: "d",
  })
);

el.dispatchEvent(
  new InputEvent("input", {
    inputType: "insertText",
    data: "d",
  })
);

var evt = new Event("change");

el.dispatchEvent(evt);

// chrome.debugger.attach(target, "1.2", function() {
//     chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", arguments)
// })

// https://developer.chrome.com/docs/extensions/reference/automation/
