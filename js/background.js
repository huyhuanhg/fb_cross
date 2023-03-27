(() => {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local") {
      if (changes.hasOwnProperty("queue")) {
        console.log("QUEUE STORAGE CHANGE: >> ", changes);
      }
      if (changes.hasOwnProperty("log_detail")) {
        const { newValue } = changes.log_detail;
        const logs = newValue || [];

        if (logs.length > 0) {
          console.log(
            "LOG DETAIL: >> ",
            logs[newValue.length - 1].replace(/^<span(.+)>(.+)<\/span>$/, "$2")
          );
        }
      }
    }
  });

  chrome.tabs.onUpdated.addListener((tabId, info) => {
    console.log("TAB CHANGE: tabId :>> ", tabId);
    console.log("TAB CHANGE: info :>> ", info);
  });

  chrome.tabs.onRemoved.addListener((tabId, info) => {
    chrome.storage.local.get(["queue", "log_detail"]).then(({ queue, log_detail }) => {
      const stacks = queue?.data || [];
      const stackIndex = stacks.findIndex((item) => item.tab_id === tabId);

      if (stackIndex > -1) {
        const newQueueStackData = [...stacks];
        const newLogDetailData = log_detail || [];
        const [{title}] = newQueueStackData.splice(stackIndex, 1);

        const now = new Date();
        chrome.storage.local.set({
          queue: {
            ...queue,
            data: newQueueStackData,
          },
          log_detail: [
            ...newLogDetailData,
            `<span style="color: #dc3545" data-time="${now.getFullYear()}/${now.getMonth()}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}">Nhóm "${title}" đã được xóa khỏi hệ thống!</span>`
          ]
        });
      }
    });
  });
})();
