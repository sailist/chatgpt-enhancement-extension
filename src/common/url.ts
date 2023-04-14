export const REGEX_GPTURL = /https:\/\/chat.openai.com\/.*/;
export const REGEX_GPT_ID =
  /https:\/\/chat\.openai\.com\/.*\/([a-zA-Z0-9\\-]+)$/;

export function getPureUrl() {
  const regex = /(\?.*|#.*)$/;
  return document.URL.replace(regex, "");
}
