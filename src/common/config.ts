class Storage {
  set(key: string, value: any) {
    const res = {};
    res[key] = value;
    return chrome.storage.local.set(res);
  }

  sets(object: { [key: string]: any }) {
    return chrome.storage.local.set(object);
  }

  remove(keys: string | string[]) {
    return chrome.storage.local.remove(keys);
  }

  get<T>(key: string, defaultValue?: any) {
    return chrome.storage.local.get(key).then((item) => {
      return new Promise<T>((resolve, reject) => {
        if (item && item[key]) {
          resolve(item[key]);
        } else {
          if (defaultValue !== undefined) {
            resolve(defaultValue);
          } else {
            reject(new Error(`The key ${key} does not exist in local storage`));
          }
        }
      });
    });
  }
  gets<T>(obj: { [key: string]: any }) {
    return chrome.storage.local.get(obj) as Promise<T>;
  }
}

export const storage = new Storage();
