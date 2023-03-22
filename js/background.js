// chrome.storage.onChanged.addListener(
//   (changes, areaName) => {
//     console.log('changes :>> ', changes);
//   }
// )

(async () => {
  const set = await chrome.storage.local.set({ test: 'nextValue',test2: 'nextValue' }).then((result) => {
    console.log('set_result :>> ', result);
  }).catch((err) => {
    console.log('set_err :>> ', err);
  });


  const get = await chrome.storage.local.get(['test', 'test2', 'test3']).then(({ test, test2, test3}) => {
    console.log('get_result :>> ', test, test2, test3);
  }).catch((err) => {
    console.log('get_err :>> ', err);
  });
  console.log('get :>> ', get);
} )()
