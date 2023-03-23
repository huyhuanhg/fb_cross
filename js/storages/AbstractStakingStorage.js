import Storage from "./AbstractStorage.js";
import { Obj, Arr } from "../helpers";

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

  static push(value) {
    if (this.isInvalidRequireKeys(value)) {
      return;
    }

    if (this.hasOwnProperty("format") && typeof this.format === "function") {
      value = this.format(value);
    }

    this.get().then((result) => {
      let cloneResult = { ...result };

      const regex = new RegExp(`^${this.KEY}((\.)(.+?))?$`)
      const key = this.STACKING_WRAPPER.replace(regex, '$3')

      if (Obj.has(cloneResult, key)) {
        const stacks = Obj.get(cloneResult, key)
        if (! Arr.isArray(stacks)) {
          return
        }

        const stackKey = !key ? this.STACKING_WRAPPER : 1
        const parent = {}

        parent[stackKey] = [ ...stacks, value ]

        this.set(cloneResult);
      }
    });
  }

  static delete(PKVal) {
    this.get().then((result) => {
      const cloneResult = [...result];

      const pushingValueIndex = cloneResult.findIndex(
        (cloneVal) => cloneVal[this.PRIMARY_KEY] === PKVal
      );

      if (pushingValueIndex === -1) {
        return;
      }

      cloneResult.splice(pushingValueIndex, 1);

      this.set(cloneResult);
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
}
