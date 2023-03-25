import Storage from "./AbstractStorage.js";
import { Obj, Arr } from "../helpers/index.js";

export default class AbstractStakingStorage extends Storage {
  static get IS_STACKING() {
    return true;
  }

  static get STACKING_WRAPPER() {
    if (!this.IS_STACKING) {
      throw new Error("Storage type isn't stacking!");
    }

    return this.KEY;
  }

  static get STACKING_PRIMARY_KEY() {
    throw new Error("You have to implement the constant STACKING_PRIMARY_KEY!");
  }

  static get STACKING_DEFAULT_VALUES() {
    throw new Error(
      "You have to implement the constant STACKING_DEFAULT_VALUES!"
    );
  }

  static get STACKING_REQUIRE_KEYS() {
    throw new Error(
      "You have to implement the constant STACKING_REQUIRE_KEYS!"
    );
  }

  static async getStack() {
    return this.get().then((result) => {
      const key = this.getStackKey();

      return Obj.get(result, key);
    });
  }

  static push(value) {
    if (this.isInvalidRequireKeys(value)) {
      return;
    }

    if (this.hasOwnProperty("format") && typeof this.format === "function") {
      value = this.format(value);
    }

    this.get().then((result) => {
      const key = this.getStackKey();

      if (!Obj.has(result, key)) {
        return;
      }

      if (!key && Arr.isArray(result)) {
        if (this.#validate(value, result)) {
          return this.set([...result, value]);
        }
      }

      const cloneResult = { ...result };
      let stacks = Obj.get(cloneResult, key);

      if (!Arr.isArray(stacks) || !this.#validate(value, stacks)) {
        return;
      }

      const parentKey = key.includes(".")
        ? key.replace(/^(.+?)\.\w+$/, "$1")
        : "";
      const stackKey = !parentKey ? key : key.replace(/^(.+?)\.(\w+)$/, "$2");
      const parent = Obj.get(cloneResult, parentKey);
      parent[stackKey] = [...stacks, value];

      this.set(cloneResult);
    });
  }

  static update(PkVal, value) {
    if (this.isInvalidRequireKeys(value)) {
      return;
    }

    if (this.hasOwnProperty("format") && typeof this.format === "function") {
      value = this.format(value);
    }

    this.get().then((result) => {
      const key = this.getStackKey();

      if (!Obj.has(result, key)) {
        return;
      }

      if (!key && Arr.isArray(result)) {
        const cloneResult = [...result];

        this.#updateByPK(cloneResult, PkVal, value);

        return this.set(cloneResult);
      }

      const cloneResult = { ...result };

      if (!Arr.isArray(Obj.get(cloneResult, key))) {
        return;
      }

      const parentKey = key.includes(".")
        ? key.replace(/^(.+?)\.\w+$/, "$1")
        : "";
      const stackKey = !parentKey ? key : key.replace(/^(.+?)\.(\w+)$/, "$2");
      const parent = Obj.get(cloneResult, parentKey);

      this.#updateByPK(parent[stackKey], PkVal, value);

      this.set(cloneResult);
    });
  }

  static delete(PkVal) {
    this.get().then((result) => {
      const key = this.getStackKey();

      if (!Obj.has(result, key)) {
        return;
      }

      if (!key && Arr.isArray(result)) {
        const cloneResult = [...result];

        this.#removeByPK(cloneResult, PkVal);

        return this.set(cloneResult);
      }

      const cloneResult = { ...result };

      if (!Arr.isArray(Obj.get(cloneResult, key))) {
        return;
      }

      const parentKey = key.includes(".")
        ? key.replace(/^(.+?)\.\w+$/, "$1")
        : "";
      const stackKey = !parentKey ? key : key.replace(/^(.+?)\.(\w+)$/, "$2");
      const parent = Obj.get(cloneResult, parentKey);

      this.#removeByPK(parent[stackKey], PkVal);

      this.set(cloneResult);
    });
  }

  static async getByPK(PkVal) {
    return this.get().then((result) => {
      const key = this.getStackKey();

      if (!Obj.has(result, key)) {
        return Promise.resolve(null);
      }

      if (!key && Arr.isArray(result)) {
        return this.#findByPK(result, PkVal);
      }

      const stacks = Obj.get(result, key);

      if (!Arr.isArray(stacks)) {
        return Promise.resolve(null);
      }

      return this.#findByPK(stacks, PkVal);
    });
  }

  static isInvalidRequireKeys(value) {
    for (const key of this.STACKING_REQUIRE_KEYS) {
      if (!value.hasOwnProperty(key)) {
        if (
          this.STACKING_DEFAULT_VALUES &&
          this.STACKING_DEFAULT_VALUES.hasOwnProperty(key)
        ) {
          value[key] = this.STACKING_DEFAULT_VALUES[key];

          continue;
        }

        return true;
      }
    }

    return false;
  }

  static getStackKey() {
    return this.STACKING_WRAPPER.replace(
      new RegExp(`^${this.KEY}((\.)(.+?))?$`),
      "$3"
    );
  }

  static #findByPK(stacks, PkVal, PkKey = null) {
    const PkRecord = stacks.find(
      (resultVal) => resultVal[PkKey || this.PRIMARY_KEY] === PkVal
    );

    return PkRecord ? Promise.resolve(PkRecord) : Promise.resolve(null);
  }

  static #updateByPK(stacks, PkVal, value, PkKey = null) {
    const pushingValueIndex = stacks.findIndex(
      (cloneVal) => cloneVal[PkKey || this.PRIMARY_KEY] === PkVal
    );

    if (pushingValueIndex === -1) {
      return;
    }

    stacks.splice(pushingValueIndex, 1, value);
  }

  static #removeByPK(stacks, PkVal, PkKey = null) {
    const pushingValueIndex = stacks.findIndex(
      (cloneVal) => cloneVal[PkKey || this.PRIMARY_KEY] === PkVal
    );

    if (pushingValueIndex === -1) {
      return;
    }

    stacks.splice(pushingValueIndex, 1);
  }

  static #validate(value, data) {
    if (
      !this.hasOwnProperty("validate") ||
      typeof this.validate !== "function"
    ) {
      return true;
    }

    return this.validate(value, data);
  }
}
