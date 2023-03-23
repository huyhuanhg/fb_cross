import StackingStorage from './AbstractStakingStorage.js'
import { DEFAULT_STORAGE_NAMESPACE, LOG_DETAIL_STORAGE_KEY } from './config';

export default class LogDetailLocalStorage extends StackingStorage {
  static get NAMESPACE() {
    return DEFAULT_STORAGE_NAMESPACE;
  }

  static get KEY() {
    return LOG_DETAIL_STORAGE_KEY;
  }

  static get STACKING_REQUIRE_KEYS() {
    return ["content", "level"];
  }

  static get STACKING_DEFAULT_VALUES() {
    return {
      level: 'default'
    };
  }

  static get INIT_VALUE() {
    return [];
  }

  static get CONTENT_KEY() {
    return "content";
  }

  static get LOG_LEVEL_COLOR() {
    return {
      danger: "#dc3545",
      info: "#0d6efd",
      success: "#198754",
      warning: "#ffc107",
      default: "#6c757d",
    };
  }

  static format(value) {
    return `<span style="color: ${this.LOG_LEVEL_COLOR[value.level]}" data-time="" title="">${value[this.CONTENT_KEY].replaceAll(
      /:(\w+)/g,
      (_, key) => (value.hasOwnProperty(key) ? value[key] : "")
    )}</span>`
  }
}
