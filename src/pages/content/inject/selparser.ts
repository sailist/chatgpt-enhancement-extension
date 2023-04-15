import { GPTEventMessageListener, GPTGroup, GPTPageHandler } from "./page";
import {
  ExMessage,
  MT,
  PARSE_SELECTION,
  PARSE_SELECTION_RESULT,
  sendMessage,
} from "@src/common";

export class SelectionParser implements GPTEventMessageListener<any, any> {
  plugin_name: string = "selection_parser";
  gptpage?: GPTPageHandler;
  waitResponse?: (message: PARSE_SELECTION_RESULT) => void;
  pendingMessage?: PARSE_SELECTION;
  pendingPromot?: string;
  bindGPT(gptpage: GPTPageHandler): void {
    this.gptpage = gptpage;
    this.waitResponse = null;
  }
  onHooked(): void {}
  onUnHooked(): void {}
  onMessage(
    message: ExMessage<any>,
    sender,
    response: (message: ExMessage<any>) => void
  ) {
    if (message.type === MT.PARSE_SELECTION) {
      const typedMsg = message as PARSE_SELECTION;
      this.pendingPromot =
        (typedMsg.payload.prompt || "") + "\n" + typedMsg.payload.content;
      this.gptpage.send(this.pendingPromot);
      this.gptpage.vote(this);
      this.waitResponse = response;
      this.pendingMessage = message;
    }
  }
  onSwitchPage(old: boolean): void {}
  onProgress(gptGroup: GPTGroup): void {
    sendMessage<PARSE_SELECTION_RESULT["payload"], any>({
      code: 200,
      payload: {
        timestamp: new Date().getTime(),
        prompt: this.pendingPromot,
        content: gptGroup.markdownRoot.innerHTML,
        streaming: true,
        toTab: this.pendingMessage.payload.fromTab,
      },
      type: MT.PARSE_SELECTION_RESULT,
    }).then(() => {});
  }
  onResponse(gptGroup: GPTGroup): void {
    console.log("onResponse");
    sendMessage<PARSE_SELECTION_RESULT["payload"], any>({
      code: 200,
      payload: {
        timestamp: new Date().getTime(),
        prompt: this.pendingPromot,
        content: gptGroup.markdownRoot.innerHTML,
        toTab: this.pendingMessage.payload.fromTab,
      },
      type: MT.PARSE_SELECTION_RESULT,
    }).then(() => {});
  }

  onStopGeneration(): void {}
  onTextareaCreate(el: HTMLTextAreaElement): void {
  }
  onSendStart(): void {}
}
