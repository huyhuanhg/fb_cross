let totalImage = 0;
let totalImageIsAddToRequestData = 0;

function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };

    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

function getFileName(source)
{
    return source.split('/').pop();
}

function isDiffDomain(url) {
    ecBeingDomain = 'https://allu-officialcom.ecbeing.biz/';
    return url.indexOf(ecBeingDomain) === -1
}

function setImageToData(data, img, dataKey)
{
    totalImage += 1;
    data.append(`${dataKey}[fileName]`, getFileName(img.src));
    if (isDiffDomain(img.src)) {
        data.append(`${dataKey}[fileUrl]`, img.src);
        totalImageIsAddToRequestData += 1;
    } else {
        toDataURL(img.src, function(dataUrl) {
            data.append(`${dataKey}[fileContent]`, dataUrl);
            totalImageIsAddToRequestData += 1;
        });
    }
}

window.onload = function() {

    let form = document.getElementsByTagName('form')[0];
    let data = new FormData(form);

    // process thumbnail img
    let img = form.querySelector("#section_simpleblog_base > div > dl:nth-child(10) > dd > div > div:nth-child(1) > div.section_gray_field_border_.align_c_ > img");
    if (img) {
        setImageToData(data, img, "thumbnail");
    }

    // process body
    let body = form.querySelector("textarea[name='body']").value;

    // convert usus-offical to allu-offical
    body = body.replace(/usus-official.com/g, "allu-official.com");

    // convert alt="> => alt="">
    body = body.replace(/alt=\">/g, 'alt="">');

    // convert sec=" => src="
    body = body.replace(/sec=\"/g, 'src="');

    let el = document.createElement("div");
    el.setAttribute("style", "display:none;");
    el.setAttribute("id", "divBody");
    el.innerHTML = body;
    form.append(el);

    let imgs = el.querySelectorAll('img');
    if (imgs.length > 0) {
        let _id = 0;
        imgs.forEach(_img => {
            if (_img.src.includes('URL') == false) {
                setImageToData(data, _img, `bodyImgs[${_id}]`);
                _id++;
            }
        });
    }

    let productRows = form.querySelectorAll('.table_one_column_common_.layout_fixed_:last-child tbody tr');
    if (productRows.length > 0) {
        let productRowId = 1;
        productRows.forEach(row => {
            let trElmName = row.querySelector('td:nth-child(3)');
            if (trElmName !== null) {
                console.log(trElmName.firstChild.textContent);
                data.append(`simpleblog_goods_name${productRowId}`, trElmName.firstChild.textContent);
            }

            let trElmCat = row.querySelector('td:nth-child(4)');
            if (trElmCat !== null) {
                data.append(`simpleblog_goods_category${productRowId}`, trElmCat.firstChild.textContent);
            }

            if (trElmName !== null || trElmCat !== null) {
                productRowId += 1;
            }
        });
    }

    let flg = false;
    setInterval(function() {
        if (flg == false) {
            if (totalImage == totalImageIsAddToRequestData) {
                flg = true;
                var apiBlogStoreUrl = 'http://localhost:12082/blog';
                fetch(apiBlogStoreUrl, {method: 'POST', body: data})
                    .then(response => {
                        if (200 === response.status) {
                            window.close();
                        }
                    });
            }
        }
    }, 2000);
}

// let flg = false;
// setInterval(function() {
//     // if (totalImages == totalBase64Images && totalImages != 0) {
//     if (flg == false) {
//         if (totalImages == totalBase64Images) {
//             flg = true;
//             // call api
//             var apiBlogStoreUrl = 'http://localhost:12082/blog';
//             fetch(apiBlogStoreUrl, {method: 'POST', body: data})
//                 .then(response => {
//                     if (200 === response.status) {
//                         window.close();
//                     }
//                 });
//         } else {
//             console.log('not yet');
//             console.log(totalImages);
//             console.log(totalBase64Images);
//         }
//     }
// }, 5000);