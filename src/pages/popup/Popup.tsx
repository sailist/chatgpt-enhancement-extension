import React, { useEffect, useRef, useState } from "react";
import logo from "@assets/img/logo.svg";
import { MT, sendMessage } from "@src/common/message";
import { Readability } from "@mozilla/readability";
import Button from "@src/common/components/Button";
import {
  DEFAULT_SETTINGS,
  SettingDict,
  settingKeys,
} from "../options/main/Setting";
import { storage } from "@src/common";

const Popup = () => {
  const [settings, setSettings] = useState<SettingDict>({});

  useEffect(() => {
    storage.gets<SettingDict>(settingKeys).then((item) => {
      setSettings(Object.assign({}, DEFAULT_SETTINGS, item));
    });
  });

  return (
    <div
      style={{
        width: 200,
      }}
    >
      <Button
        content="Active"
        onClick={() => {
          sendMessage({ type: MT.ACTIVE_GPTPAGE });
        }}
      />
      <Button
        content="Option Page"
        onClick={() => {
          chrome.tabs.create({ url: "src/pages/options/index.html" });
        }}
      />
      <div>Setting Values</div>
      {Object.keys(settings).map((item, index) => {
        const row = settings[item];
        return (
          <div key={index} className="flex flex col">
            <div>
              <b className="text-bold">{row.name}</b>: {row[row.type]}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Popup;
