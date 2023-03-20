console.log(123);
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

function getContent(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            callback(xhr.responseText);
        }
    }
    xhr.open('GET', url, true);
    xhr.send();
}

function getFileName(source)
{
    return source.split('/').pop();
}

function setImageToData(data, img, dataKey)
{
    data.append(`${dataKey}[fileName]`, getFileName(img.src));

    toDataURL(img.src, function(content) {
        data.append(`${dataKey}[fileContent]`, content);
        totalBase64Images +=1 ;
    });
}

let url = 'https://allu-official.com/js/sys/allu_random.js';
let totalImages = 0;
let totalBase64Images = 0;

getContent(url, function(data) {
    // console.log(data);
    get_image_src(data);
});

function get_image_src(content)
{
    let form = document.createElement("form");
    form.setAttribute("id", "formCloneScriptBlock");
    form.setAttribute("style", "display:none;");

    let data = new FormData(form);

    let el = document.createElement("div");
    el.setAttribute("style", "display:none;");
    el.setAttribute("id", "divCloneScriptBlock");
    el.innerHTML = content;

    let imgs = el.querySelectorAll('img');
    if (imgs.length > 0) {
        let _id = 0;
        imgs.forEach(_img => {
            totalImages += 1;
            setImageToData(data, _img, `bodyImgs[${_id}]`);
            _id++;
        });
    }

    setInterval(function() {
        if (totalImages == totalBase64Images) {
            // call api
            var apiCloneScript = 'http://localhost:12082/blog/script';
            fetch(apiCloneScript, {method: 'POST', body: data})
                .then(response => {
                    if (200 === response.status) {
                        window.close();
                        // totalBase64Images = 99;
                    }
                });
        } else {
            console.log('not yet');
            console.log(totalImages);
            console.log(totalBase64Images);
        }
    }, 1000);
}
