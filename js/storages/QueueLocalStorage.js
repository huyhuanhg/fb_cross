import Storage from "./AbstractStakingStorage.js";
import { DEFAULT_STORAGE_NAMESPACE, QUEUE_STORAGE_KEY } from "./config";

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
      data: []
    };
  }

  static async isStart() {
    return await this.get().then(({ state }) => state);
  }

  static start() {
    this.get().then(({ state, ...args }) => this.set({ state: true, ...args }));
  }

  static validate(record) {
    return true;
  }
}
