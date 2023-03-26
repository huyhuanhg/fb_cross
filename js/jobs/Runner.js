import QueueStorage from "../storages/QueueLocalStorage.js";
import LogDetailStorage from "../storages/LogDetailLocalStorage.js";
import Tab from "../entities/Tab.js";
import { Arr } from "../helpers/index.js";

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
      stacks.forEach(async (stackItem) => {
        const { url, status, is_inject, tab_id } = stackItem
        const tab = await Tab.firstByPk(url, tab_id)

        if (status !== "active") {
          this.#execute(url, is_inject && tab_id ? stackItem : null);
        }
      });
    });
  }

  static async stop() {
    if (!await QueueStorage.isStart()) {
      return;
    }

    QueueStorage.stop().then(async () => {
      LogDetailStorage.push({
        content: "Tạm dừng tự động like chéo!",
        level: "warning",
      });

      const stacks = await QueueStorage.getStack();

      stacks.forEach(stackItem => {
        if (stackItem.status === "active") {
          this.#unExecute(stackItem);
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

  static #execute(url, self = null) {
    if (!self) {
      return Tab.create(url).then(tab => {
        QueueStorage.update(url, {
          url,
          tab_id: tab.id,
          status: 'active'
        })
      })
    }

    QueueStorage.update(url, {
      ...self,
      status: 'active'
    })
  }

  static async #unExecute(queue) {
    QueueStorage.update(queue.url, {
      ...queue,
      status: 'pending'
    })
  }
}
