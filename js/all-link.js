let list = [];
let elements = document.querySelectorAll("table tbody tr td a");

elements.forEach(elm => {
    onClick = elm.attributes.onClick;

    let new_href = "https://allu-officialcom.ecbeing.biz/Z3quFU8/simpleblog/" + onClick.nodeValue.substring(23, 59);
    list.push(new_href);
});

chrome.storage.sync.set({'list_href': list});

// // run manually
// let list = [
//     'https://allu-officialcom.ecbeing.biz/Z3quFU8/simpleblog/detail.aspx?simpleblog=552&mode=edit',
//     // 'https://allu-officialcom.ecbeing.biz/Z3quFU8/simpleblog/detail.aspx?simpleblog=544&mode=edit'
// ];

// chrome.storage.sync.set({'list_href': list});
