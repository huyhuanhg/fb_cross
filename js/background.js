(() => {
  chrome.storage.onChanged.addListener(
    (changes, areaName) => {
      console.log('areaName :>> ', areaName);
      console.log('changes :>> ', changes);
    }
  );
})();
