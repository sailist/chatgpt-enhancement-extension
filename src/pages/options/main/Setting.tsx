import React, { useState, useEffect, useRef } from "react";
import produce from "immer";
import weixin from "@assets/img/weixin.jpg";
import zhifubao from "@assets/img/zhifubao.png";
import { storage } from "@src/common";
import Button from "@src/common/components/Button";
import clsx from "clsx";

const Row = ({ row, onChange }: { row: SettingRecord; onChange? }) => {
  if (!row) {
    return <></>;
  }
  if (row.type === "boolean") {
    return (
      <div className="relative flex gap-x-3">
        <div className="flex h-6 items-center">
          <input
            id="comments"
            name="comments"
            type="checkbox"
            onChange={onChange}
            value={row.boolean}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
        </div>
        <div className="text-sm leading-6">
          <label className="font-medium text-gray-900">{row.name}</label>
          <p className="text-gray-500">{row.desc}</p>
        </div>
      </div>
    );
  } else if (row.type === "string") {
    return (
      <div className="flex flex-col">
        <div className="block p-2 text-sm font-medium leading-6 text-gray-900">
          {row.name}
        </div>
        <div className="flex text-center flex-row">
          <div className="">
            <input
              type="text"
              name="first-name"
              id="first-name"
              value={row.string}
              placeholder={row.desc}
              onChange={onChange}
              className="px-2 block w-full placeholder rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>
    );
  } else {
    return <>Not Found {JSON.stringify(row)}</>;
  }
};

interface KeySetting {
  key: string;
  meta: boolean;
  alt: boolean;
  ctrl: boolean;
}

export interface SettingRecord {
  name: string;
  desc: string;
  type: "boolean" | "string" | "number";
  boolean?: boolean;
  string?: string;
  number?: number;
}

type settingKey =
  | "settingStrAPIKey"
  | "settingStrSend"
  | "settingBoolTrackEnable"
  | "settingStrSendWithPromptHint";

export type SettingDict = {
  [key in settingKey]?: SettingRecord;
};

export const settingKeys: settingKey[] = [
  "settingStrAPIKey",
  "settingStrSend",
  "settingBoolTrackEnable",
  "settingStrSendWithPromptHint",
];
export const DEFAULT_SETTINGS: SettingDict = {
  settingStrAPIKey: {
    name: "GPTAPI Key",
    type: "string",
    string: "",
    desc: "(Currently not in use)",
  },
  settingStrSend: {
    name: "Send selection",
    type: "string",
    string: "c",
    desc: "",
  },
  settingStrSendWithPromptHint: {
    name: "Send selection with prompt hint",
    type: "string",
    string: "x",
    desc: "",
  },
  settingBoolTrackEnable: {
    name: "Enable to track your anonymous user data",
    type: "boolean",
    boolean: true,
    desc: "",
  },
};

export default function Setting() {
  const [settings, setSettings] = useState<SettingDict>({});
  const [diff, setDiff] = useState(false);

  useEffect(() => {
    storage.gets<SettingDict>(settingKeys).then((item) => {
      console.log(item);
      setSettings(Object.assign({}, DEFAULT_SETTINGS, item));
    });
  }, []);

  const setSetting = (id: settingKey, newValue) => {
    const newSettings = produce(settings, (draft) => {
      const row = draft[id];
      row[row.type] = newValue as never;
    });

    console.log(newSettings.settingStrSend);
    setDiff(true);
    setSettings(newSettings);
  };

  const save = () => {
    if (diff) {
      storage.sets(settings).then(() => {
        setDiff(false);
      });
    }
  };
  console.log("refresh", settings);
  return (
    <div className="flex flex-col m-4">
      <Row
        row={settings["settingStrSend"]}
        onChange={(e) => {
          setSetting(
            "settingStrSend",
            e.target.value[e.target.value.length - 1]
          );
        }}
      />
      <Row
        row={settings["settingStrSendWithPromptHint"]}
        onChange={(e) => {
          setSetting(
            "settingStrSendWithPromptHint",
            e.target.value[e.target.value.length - 1]
          );
        }}
      />
      <Row row={settings["settingStrAPIKey"]} />
      <Button
        className={clsx("mt-2", diff ? "bg-green-200 hover:bg-green-300" : "")}
        content="Save"
        onClick={() => {
          save();
        }}
      />
    </div>
  );
}
