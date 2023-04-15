export interface ExMessage<T> {
  code?: number;
  type: string;
  payload?: T;
  msg?: string;
}

export function SUCCEED_MSG(msg?: string): ExMessage<any> {
  return { code: 200, type: msg || "success_response" };
}
export function FAIL_MSG(
  msg: string = "failed",
  code: number = 500
): ExMessage<any> {
  return { code: code, type: "failed_response", msg };
}

export const MessageType = {
  PARSE_SELECTION: "parse-selection",
  PARSE_SELECTION_RESULT: "parse-selection-result",
  GET_RESPONSE_ID: "get-new-id",
  REGISTER_GPT: "register-chatgpt-page",
  GET_GPT_TABID: "get-chatgpt-tabid",
  ACTIVE_GPTPAGE: "active-chatgpt-page",
};
export const MT = MessageType; // alias

export type PARSE_SELECTION = ExMessage<{
  content: string;
  prompt?: string;
  fromTab?: number;
}>;
export type PARSE_SELECTION_RESULT = ExMessage<{
  prompt: string;
  content: string;
  streaming?: boolean;
  timestamp: number;
  toTab?: number;
}>;
export type GET_RESPONSE_ID = ExMessage<any>;
export type REGISTER_GPT = ExMessage<any>;
export type GET_GPT_TABID = ExMessage<any>;

export type ExMessageCallback<I, O> = (
  message: ExMessage<I>,
  sender: chrome.runtime.MessageSender,
  sendResponse: (message: ExMessage<O>) => void
) => void;

export function addMessageListener<I, O>(callback: ExMessageCallback<I, O>) {
  console.log("Add Message Listener");
  chrome.runtime.onMessage.addListener(callback);
}

export function sendMessage<I, O>(
  message: ExMessage<I>
): Promise<ExMessage<O>> {
  return chrome.runtime.sendMessage(message);
}

export function sendTabMessage<I, O>(
  tabId: number,
  message: ExMessage<I>
): Promise<ExMessage<O>> {
  return chrome.tabs.sendMessage(tabId, message);
}
