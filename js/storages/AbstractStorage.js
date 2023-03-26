import { Obj } from "../helpers/index.js";

export default class AbstractStorage {
  static get NAMESPACE() {
    throw new Error("You have to implement the constant NAMESPACE!");
  }

  static get KEY() {
    throw new Error("You have to implement the constant KEY!");
  }

  static get INIT_VALUE() {
    throw new Error("You have to implement the constant INIT_VALUE!");
  }

  static get IS_STACKING() {
    return false;
  }

  static gets(keys) {
    if (typeof keys !== "object" && Array.isArray(keys)) {
      return Promise.reject(new Error("Variable type is valid"));
    }

    return chrome.storage[this.NAMESPACE].get(keys).then(
      (result) => Promise.resolve(result),
      (error) => Promise.reject(error)
    );
  }

  static async get() {
    return chrome.storage[this.NAMESPACE].get([this.KEY]).then(
      (result) => Promise.resolve(result[this.KEY] || this.INIT_VALUE),
      () => Promise.resolve(this.INIT_VALUE)
    );
  }

  static async attr(request) {
    return this.get().then((args) => {
      if (!Obj.isObject(request) && typeof request !== "string") {
        return Promise.reject();
      }

      if (Obj.isObject(request)) {
        this.set({ ...args, ...request });
        return Promise.resolve();
      }

      return Promise.resolve(Obj.get(args, request));
    });
  }

  static set(value) {
    chrome.storage[this.NAMESPACE].set({ [this.KEY]: value });
  }

  static reset() {
    chrome.storage[this.NAMESPACE].set({ [this.KEY]: this.INIT_VALUE });
  }

  static change(callback, key = "") {
    if (!callback || typeof callback !== "function") {
      return;
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== this.NAMESPACE) {
        return;
      }

      if (changes.hasOwnProperty(this.KEY)) {
        const {
          [this.KEY]: { newValue },
        } = changes;
        callback(Obj.get(newValue, key));
      }
    });
  }
}
