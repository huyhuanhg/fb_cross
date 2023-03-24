// chrome.storage.onChanged.addListener(
//   (changes, areaName) => {
//     console.log('changes :>> ', changes);
//   }
// )

(() => {
  chrome.storage.onChanged.addListener(
    ((changes, areaName) => {
      if (areaName !== "local") {
        return;
      }

      if (changes.hasOwnProperty("queue")) {
        const {
          queue: { newValue },
        } = changes;
        console.log("queue :>> ", newValue);
      }
    }).bind(this)
  );

  chrome.storage.onChanged.addListener(
    ((changes, areaName) => {
      if (areaName !== "local") {
        return;
      }

      if (changes.hasOwnProperty("log_detail")) {
        const {
          log_detail: { newValue },
        } = changes;
        console.log("log_detail :>> ", newValue);
      }
    }).bind(this)
  );
})();
