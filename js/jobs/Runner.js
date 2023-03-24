import QueueStorage from "../storages/QueueLocalStorage";
import LogDetailStorage from "../storages/LogDetailLocalStorage";

export default class Runner {
  static state() {
    return QueueStorage.isStart();
  }

  static start() {
    if (QueueStorage.isStart()) {
      return;
    }

    LogDetailStorage.push({
      message: "",
    });
  }

  static stop() {
    if (!QueueStorage.isStart()) {
      return;
    }

    LogDetailStorage.push({
      message: "",
    });
  }

  static push(url) {
    QueueStorage.push({ url });

    LogDetailStorage.push({
      message: "URL :url đã được thêm vào hàng đợi!",
      level: "info",
      url,
    });

    if (QueueStorage.isStart()) {
      this.#execute(url)
    }
  }

  static update(url) {

  }

  static delete(url) {
    QueueStorage.delete(url);
    LogDetailStorage.push({
      url,
      level: "danger",
      message: "URL :url đã được xóa khỏi hàng đợi!",
    });
  }

  static reset() {
    QueueStorage.reset();
    LogDetailStorage.reset();
  }

  static #execute(url) {}
}
