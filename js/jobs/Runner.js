import QueueStorage from "../storages/QueueLocalStorage.js";
import LogDetailStorage from "../storages/LogDetailLocalStorage.js";

export default class Runner {
  static state() {
    return QueueStorage.isStart();
  }

  static isEmpty() {
    return QueueStorage.isEmpty();
  }

  static async start() {
    if (await QueueStorage.isStart()) {
      return;
    }

    QueueStorage.start().then(async () => {
      LogDetailStorage.push({
        content: "Bắt đầu tự động like chéo!",
        level: "success",
      });

      const stacks = await QueueStorage.getStack();

      stacks.forEach(({ url, status }) => {
        if (status !== "active") {
          this.#execute(url);
        }
      });
    });
  }

  static async stop() {
    if (!(await QueueStorage.isStart())) {
      return;
    }

    QueueStorage.stop().then(async () => {
      LogDetailStorage.push({
        content: "Tạm dừng tự động like chéo!",
        level: "warning",
      });

      const stacks = await QueueStorage.getStack();

      stacks.forEach(({ url, status }) => {
        if (status === "active") {
          this.#unExecute(url);
        }
      });
    });
  }

  static async push(url) {
    QueueStorage.push({ url }).then(() => {
      LogDetailStorage.push({
        content: "URL :url đã được thêm vào hàng đợi!",
        level: "info",
        url,
      });
    });

    if (await QueueStorage.isStart()) {
      this.#execute(url);
    }
  }

  static primaryPage(value = null) {
    return QueueStorage.primaryPage(value);
  }

  static delete(url) {
    QueueStorage.delete(url);
    LogDetailStorage.push({
      url,
      level: "danger",
      content: "URL :url đã được xóa khỏi hàng đợi!",
    });
  }

  static reset() {
    QueueStorage.reset();
    LogDetailStorage.reset();
  }

  static #execute(url) {
    chrome.tabs.create({ url, active: false }, function (tab) {
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          files: ["./js/main.js"],
        })
    });
  }

  static #unExecute(url) {}
}
