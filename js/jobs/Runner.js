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
        const tab = await Tab.firstByPk(stackItem.url, stackItem.tab_id);

        this.#execute(stackItem, tab);
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

      QueueStorage.get().then((result) => {
        QueueStorage.set({
          ...result,
          data: result.data.map((stack) => ({
            ...stack,
            status: "pending",
          })),
        });
      });
    });
  }

  static async push(url) {
    QueueStorage.push({ url }).then(() => {
      LogDetailStorage.push({
        content: "URL :url đã được thêm vào hệ thống!",
        level: "info",
        url,
      });
    });

    if (await QueueStorage.isStart()) {
      const tab = await Tab.firstByPk(url);
      this.#execute({ url }, tab);
    }
  }

  static primaryPage(value = null) {
    return QueueStorage.primaryPage(value);
  }

  static async delete(url) {
    const stack = await QueueStorage.getByPK(url)

    if (!stack) {
      return
    }

    if (stack.tab_id) {
      Tab.remove(stack.tab_id)
    }

    QueueStorage.delete(url);
    LogDetailStorage.push({
      url,
      level: "danger",
      content: "URL :url đã được xóa khỏi hệ thống!",
    });
  }

  static reset() {
    QueueStorage.reset();
    LogDetailStorage.reset();
  }

  static #execute(stack, tab = null) {
    if (!tab) {
      return Tab.create(stack.url).then((newTab) =>
        this.#update(stack.url, newTab.id)
      );
    }

    LogDetailStorage.push({
      content: 'Nhóm ":title" bắt đầu được theo dõi!',
      level: "success",
      title: tab.title,
    });

    if (stack.tab_id !== tab.id) {
      return Tab.inject(tab.id).then(() =>
        this.#update(stack.url, tab.id, "active", true, tab.title)
      );
    }

    return this.#update(stack.url, stack.tab_id, "active", true, stack.title);
  }

  static #update(
    url,
    tabId = null,
    status = "active",
    isInject = false,
    title = ""
  ) {
    return QueueStorage.update(url, {
      url,
      tab_id: tabId,
      is_inject: isInject,
      status,
      title,
    });
  }
}
