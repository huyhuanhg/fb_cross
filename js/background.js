chrome.storage.onChanged.addListener(
  (changes, areaName) => {
    console.log('changes :>> ', changes);
  }
)
