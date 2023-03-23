import Storage from './AbstractStorage.js'
import { DEFAULT_STORAGE_NAMESPACE, QUEUE_STORAGE_KEY } from './config';

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
    }
  }

  static async getByPK(PKVal) {
    return this.get().then((result) => {
      const PKRecord = result.find(
        (resultVal) => resultVal[this.PRIMARY_KEY] === PKVal
      );
      return PKRecord ? Promise.resolve(PKRecord) : Promise.resolve(null);
    });
  }
}
