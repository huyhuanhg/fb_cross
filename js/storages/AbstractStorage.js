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
      (result) => Promise.resolve(result[this.KEY] || this.DEFAULT_VALUE),
      () => Promise.resolve(this.DEFAULT_VALUE)
    );
  }

  static set(value) {
    chrome.storage[this.NAMESPACE].set({ [this.KEY]: value });
  }

  static reset() {
    chrome.storage[this.NAMESPACE].set({ [this.KEY]: this.INIT_VALUE });
  }
}
