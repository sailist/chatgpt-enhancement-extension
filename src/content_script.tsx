import { GPTGroup, GPTPageHandler, MarkdownButton, PDFProcess } from './trigger';
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import SideBar from './sidebar';
import './output.css';


// 创建一个浮动在右上角的半圆元素，鼠标移过去会展开
const extensionRoot = document.createElement('div')
document.body.appendChild(extensionRoot)
const root = createRoot(extensionRoot);


root.render(
  <React.StrictMode>
    <SideBar />
  </React.StrictMode>
);
