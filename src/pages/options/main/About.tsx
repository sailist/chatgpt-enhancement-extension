import React, { useState, useEffect, useRef } from "react";
import weixin from "@assets/img/weixin.jpg";
import zhifubao from "@assets/img/zhifubao.png";

export default function About() {
  return (
    <div className="flex flex-col m-4">
      <div className="text-lg">
        <h1 className="my-4 text-xl text-bold">
          关于 ChatGPT Enhancement Extension
        </h1>
        <p className="">
          {" "}
          <a
            className="mr-1 text-blue-500 hover:text-blue-700"
            target="_blank"
            href="https://github.com/sailist/chatgpt-enhancement-extension"
            rel="noreferrer"
          >
            ChatGPT Enhancement Extension
          </a>
          是一项开源 Chrome 插件，旨在提高使用 ChatGPT
          原生应用工作的效率。插件通过嵌入额外的页面提供多项完整的工作流 。
          如果你对本项目感兴趣，或者希望提出改进意见，欢迎提出
          <a
            className="mx-1 text-blue-500 hover:text-blue-700"
            target="_blank"
            href="https://github.com/sailist/chatgpt-enhancement-extension/issues/new"
            rel="noreferrer"
          >
            issue
          </a>
          或通过以下方式联系我。
        </p>
        <h1 className="my-4 text-xl text-bold">关于作者</h1>
        <p>
          HaoZhe, 向全栈努力的炼丹师。 联系方式：
          <a
            className="mr-2 text-blue-500 hover:text-blue-700"
            href="https://www.zhihu.com/people/sailist"
            target="_blank"
            rel="noreferrer"
          >
            [ZhiHu]
          </a>
          <a
            className="mr-2 text-blue-500 hover:text-blue-700"
            href="https://www.github.com/sailist"
            target="_blank"
            rel="noreferrer"
          >
            [GitHub]
          </a>
          <a
            className="mr-2 text-blue-500 hover:text-blue-700"
            href="mailto:sailist@outlook.com"
            target="_blank"
            rel="noreferrer"
          >
            [Email]
          </a>
        </p>
        <p>Buy me a coffee:</p>
        <p className="flex flex-row">
          <img className="mr-4" src={weixin} width={200} id="weixin" />
          <img src={zhifubao} width={200} id="zhifubao" />
        </p>
      </div>
    </div>
  );
}
