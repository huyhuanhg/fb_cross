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

  static get STACKING_DEFAULT_VALUES() {
    return { status: "inactive" };
  }

  static get INIT_VALUE() {
    return {
      state: false,
      primary_page: '',
      data: [],
    };
  }

  static async isStart() {
    return await this.attr("state");
  }

  static async isEmpty() {
    return await this.attr("data").then((result) => Promise.resolve(result.length === 0));
  }

  static start() {
    return this.attr({ state: true });
  }

  static stop() {
    return this.attr({ state: false });
  }

  static async primaryPage(value = null) {
    return await this.attr(value === null ? 'primary_page' : { primary_page: value });
  }

  static validateData(item, data) {
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
