(() => {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log("STORAGE CHANGE: areaName :>> ", areaName);
    console.log("STORAGE CHANGE: changes :>> ", changes);
  });
  chrome.tabs.onUpdated.addListener((tabId, info) => {
    console.log("TAB CHANGE: tabId :>> ", tabId);
    console.log("TAB CHANGE: info :>> ", info);
  });
  chrome.tabs.onRemoved.addListener((tabId, info) => {
    console.log("TAB REMOVE: tabId :>> ", tabId);
    console.log("TAB REMOVE: info :>> ", info);
  });
})();
