import mixpanel from "mixpanel-browser";
import { storage } from "./config";
import {
  SettingRecord,
  SettingDict,
  DEFAULT_SETTINGS,
} from "@src/pages/options/main/Setting";

let enabled: boolean = false;

export function init() {
  storage
    .get<SettingRecord>(
      "settingBoolTrackEnable",
      DEFAULT_SETTINGS.settingBoolTrackEnable
    )
    .then((row) => {
      enabled = row.boolean;
      if (row.boolean) {
        // Project Token
        mixpanel.init("01ecd077ae10ea5375bd924961fc6aed", {
          debug: import.meta.env.DEV,
          ignore_dnt: true,
        });
        mixpanel.identify("sailist@outlook.com");
      }
    });
}

export function track(key: string, value: { [key: string]: any }) {
  if (enabled) {
    mixpanel.track(key, value);
    console.log("track " + key);
  } else {
    console.log("disabled track " + key);
  }
}

init();
