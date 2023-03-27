import { Arr } from "../helpers/index.js";
import QueueStorage from "../storages/QueueLocalStorage.js";
import LogDetailStorage from "../storages/LogDetailLocalStorage.js";

export default class Tab {
  static create(url, active = false) {
    return chrome.tabs.create({ url, active });
  }

  static remove(tabId) {
    chrome.tabs.remove(tabId);
  }

  static async firstByPk(url, tabId = null) {
    return chrome.tabs.query({ url: [url] }).then((tabs) => {
      if (tabs.length === 0) {
        return Promise.resolve(null);
      }

      if (tabId) {
        const tabResult = tabs.find((tab) => tab.id === tabId);

        if (tabResult) {
          return Promise.resolve(tabResult);
        }

        return Promise.resolve(null);
      }

      return Promise.resolve(tabs[0]);
    });
  }

  static inject(tabId) {
    return chrome.scripting.executeScript({
      target: { tabId },
      files: ["./js/main.js"],
    });
  }

  static registerUpdated() {
    chrome.tabs.onUpdated.addListener(async (tabId, info) => {
      const queue = await QueueStorage.get();
      const queueStack = Arr.where(queue.data, ["tab_id", tabId]);

      if (
        queueStack &&
        info.status === "complete" &&
        queue.state &&
        queueStack.status === "active" &&
        !queueStack.is_inject
      ) {
        this.inject(tabId).then(() => {
          QueueStorage.update(queueStack.url, {
            ...queueStack,
            is_inject: true,
          });
        });
      }

      if (
        queueStack &&
        queue.state &&
        info.title &&
        !/\s\|\sFacebook$/.test(info.title)
      ) {
        LogDetailStorage.push({
          level: "success",
          title: info.title,
          content: 'Nhóm ":title" đã bắt đầu được theo dõi!',
        });
        QueueStorage.update(queueStack.url, {
          ...queueStack,
          title: info.title,
        });
      }
    });
  }
}
