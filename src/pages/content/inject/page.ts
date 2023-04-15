import { ExMessage, addMessageListener } from "@src/common/message";

export type GptEventNames =
  | "newpage"
  | "response"
  | "stop generation"
  | "textarea create"
  | "regenerate" //
  | "send" //
  | "init send"; //

export class GPTGroup {
  prompt?: HTMLDivElement;
  response?: HTMLDivElement;
  constructor(response: HTMLDivElement) {
    // response element should match selector pattern".group * .markdown"
    this.response = response;
    // this.prompt match the pattern of ".group"
    this.prompt = response.previousElementSibling as HTMLDivElement;
  }

  public get markdownRoot(): HTMLDivElement {
    return this.response.querySelector(".markdown");
  }

  resubmit(prompt?: string) {
    if (this.prompt) {
      this.prompt.querySelector("button")?.click();
      let textarea = this.prompt.querySelector("textarea");
      if (textarea && prompt) {
        textarea.value = prompt;
      }
      this.prompt.querySelector("button")?.click();
    }
  }
}

export class GPTPageHandler {
  groups: GPTGroup[] = [];
  lastGroup?: GPTGroup;
  status: "idle" | "response" = "idle";
  textarea?: HTMLTextAreaElement;
  sendBt?: HTMLButtonElement;
  newPageBt?: HTMLLinkElement;
  regenerateButton?: HTMLButtonElement;
  eventListeners: { [key in GptEventNames]?: GPTEventListener[] } = {};
  chatProcessors: { [key: string]: GPTEventListener } = {};
  messageProcessors: { [key: string]: GPTEventMessageListener<any, any> } = {};
  currentChatHandler?: GPTEventListener; // 当前有权限发送 Prompt 和接收事件的（除了 eventListeners 单独注册相关事件）
  constructor() {
    this.initialize();
    const that = this;
    addMessageListener((message, sender, response) => {
      console.log("content script", message);
      if (that.messageProcessors[message.type]) {
        console.log(that.messageProcessors[message.type]);
        that.messageProcessors[message.type].onMessage(
          message,
          sender,
          response
        );
      } else {
        response({ ...message, code: 404 });
      }
    });
  }
  addMessageProcessor(
    type: string,
    callback: GPTEventMessageListener<any, any>
  ) {
    this.messageProcessors[type] = callback;
    callback.bindGPT(this);
  }

  addChatProcessor(callback: GPTEventListener) {
    this.chatProcessors[callback.plugin_name] = callback;
    callback.bindGPT(this);
  }
  addEventListener(name: GptEventNames, callback: GPTEventListener) {
    console.log("Add " + name + " EventListener: " + callback.plugin_name);
    if (!this.eventListeners[name]) {
      this.eventListeners[name] = [];
    }
    this.eventListeners[name]?.push(callback);
    callback.bindGPT(this);
  }

  initialize() {
    this.textarea = document.querySelector(
      "form textarea"
    ) as HTMLTextAreaElement;
    this.sendBt = this.textarea.nextElementSibling as HTMLButtonElement;
    this.groups = Array.from(
      document.querySelectorAll(".group * .markdown")
    ).map(
      (item) =>
        new GPTGroup(
          item.parentElement!.parentElement!.parentElement!.parentElement!
            .parentElement as HTMLDivElement
        )
    );
    this.lastGroup = this.groups[this.groups.length - 1];
    console.log("Initialize");
    console.log(this.groups.length);
    console.log(this.lastGroup);

    const xpath = '//a[contains(text(), "New chat")]';
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    if (result.snapshotLength > 0) {
      this.newPageBt = result.snapshotItem(0) as HTMLLinkElement;
    }
  }

  vote(listener: GPTEventListener) {
    if (this.currentChatHandler !== listener) {
      if (this.currentChatHandler) {
        this.currentChatHandler.onUnHooked();
      }
      this.currentChatHandler = listener;
      this.currentChatHandler.onHooked();
    }
  }

  newpage() {
    this.newPageBt?.click();
  }
  regenerate(edit?: string) {
    this.lastGroup?.resubmit(edit);
  }
  send(value: string) {
    // console.log("send\n" + value);
    // console.log(this);
    if (this.textarea && this.sendBt && this.status === "idle") {
      this.textarea.value = value;
      this.sendBt.disabled = false;
      this.sendBt.click();
      this.status = "response";
    } else {
      console.log(this);
    }
  }
  copyResponse() {}
  copyGroup() {}
  copyAllGroup() {}
  copyAllResponse() {}

  onSwitchPage(old: boolean = false) {
    this.initialize();
    this.currentChatHandler?.onSwitchPage(old);
    this.eventListeners["newpage"]?.forEach((item) => {
      item.onSwitchPage(old);
    });
    this.status = "idle";
  }
  onProgress(gptGroup: GPTGroup) {
    this.currentChatHandler?.onProgress(gptGroup);
    this.eventListeners["progress"]?.forEach((item) => {
      item.onProgress(gptGroup);
    });
  }

  onResponse(gptGroup: GPTGroup) {
    this.initialize();
    this.currentChatHandler?.onResponse(this.lastGroup!);
    this.eventListeners["response"]?.forEach((item) => {
      item.onResponse(gptGroup);
    });
    this.status = "idle";
  }
  onStopGeneration() {
    this.currentChatHandler?.onStopGeneration();
    this.eventListeners["stop generation"]?.forEach((item) => {
      item.onStopGeneration();
    });
    this.status = "idle";
  }
  onTextareaCreate(el: HTMLTextAreaElement) {
    this.textarea = el;
    // hack
    el.placeholder = "Type '/' & Send a message & Drop a PDF file";
    this.currentChatHandler?.onTextareaCreate(el);
    this.eventListeners["textarea create"]?.forEach((item) => {
      item.onTextareaCreate(el);
    });
  }
}

export interface GPTEventListener {
  plugin_name: string;
  bindGPT(gptpage: GPTPageHandler): void;

  onHooked(): void;
  onUnHooked(): void;

  onSwitchPage(old: boolean): void;
  onProgress(gptGroup: GPTGroup): void;
  onResponse(gptGroup: GPTGroup): void;
  onStopGeneration(): void;
  onTextareaCreate(el: HTMLTextAreaElement): void;

  onSendStart(): void;
}

export interface GPTEventMessageListener<I, O> extends GPTEventListener {
  onMessage(
    message: ExMessage<I>,
    sender,
    response: (message: ExMessage<O>) => void
  ): void;
}
