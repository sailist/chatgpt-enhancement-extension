import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { getCurrentTime } from "../utils";

export default function About() {
  const [edit, setEdit] = useState(-1);
  const [format, setFormat] = useState("json");

  return (
    <div className="flex flex-row">
      <h1>ChatGPT Enhancement Extension</h1>
    </div>
  );
}
