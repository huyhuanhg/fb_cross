export class ObjectHelper {
  static has(object, key) {
    if (!key && typeof key === "string") {
      return true;
    }

    if (typeof key !== "string" || !this.isObject(object)) {
      throw new Error("Args type is invalid!");
    }

    this.object = object;

    if (this.#eval(key)) {
      return true;
    }

    const parent = this.#parent(key);

    return !!(
      this.isObject(parent) &&
      parent.hasOwnProperty(key.replace(/^(.+?)\.(\w+)$/, "$2"))
    );
  }

  static get(object, key) {
    if (!key && typeof key === "string") {
      return object;
    }

    if (typeof key !== "string" || !this.isObject(object)) {
      throw new Error("Args type is invalid!");
    }

    this.object = object;

    return this.#eval(key);
  }

  static isObject(objectValue) {
    return (
      objectValue &&
      typeof objectValue === "object" &&
      objectValue.constructor === Object
    );
  }

  static #parent(fullKey) {
    const parentKey = fullKey.replace(/(.+?)\.\w+$/, "$1");

    return this.#eval(parentKey);
  }

  static #has(object, key) {
    try {
      return object.hasOwnProperty(key);
    } catch (e) {
      return false;
    }
  }

  static #eval(text, ...args) {
    const obj = args.length === 0 ? this.object : args[0]

    if (!text) {
      return obj;
    }

    const firstKey = text.replace(/(\w+)([\.\w]+)?/, "$1");

    if (!this.#has(obj, firstKey)) {
      return undefined;
    }

    return this.#eval(text.replace(/^\w+(\.)?(.+)?$/, "$2"), obj[firstKey]);
  }
}
