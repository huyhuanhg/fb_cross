import Storage from "./AbstractStakingStorage.js";
import { DEFAULT_STORAGE_NAMESPACE, QUEUE_STORAGE_KEY } from "../config.js";

export default class QueueLocalStorage extends Storage {
  static get NAMESPACE() {
    return DEFAULT_STORAGE_NAMESPACE;
  }

  static get KEY() {
    return QUEUE_STORAGE_KEY;
  }

  static get IS_STACKING() {
    return true;
  }

  static get STACKING_WRAPPER() {
    return `${QUEUE_STORAGE_KEY}.data`;
  }

  static get STACKING_PRIMARY_KEY() {
    return "url";
  }

  static get STACKING_REQUIRE_KEYS() {
    return ["url", "status"];
  }

  static get INIT_VALUE() {
    return {
      state: false,
      data: [],
    };
  }

  static async isStart() {
    return await this.get().then(({ state }) => state);
  }

  static start() {
    this.get().then(({ state, ...args }) => this.set({ state: true, ...args }));
  }

  static attr(key, value) {
    this.get().then(args => this.set({ ...args, [key]: value }));
  }

  static validate(item, data) {
    if (!this.#validateUnique(item, data)) {
      return false;
    }

    return true;
  }

  static #validateUnique(item, data) {
    const pKIndex = data.findIndex(
      (record) =>
        record[this.STACKING_PRIMARY_KEY] === item[this.STACKING_PRIMARY_KEY]
    );

    return pKIndex === -1;
  }
}
