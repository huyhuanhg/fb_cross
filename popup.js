/*
// when i click on my button
document.getElementById('getLink').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['js/all-link.js']
        });
    });

    chrome.storage.sync.get(['list_href'], function(result) {
        if (result.list_href) {
            document.querySelector('#doCloneBlock').style.display = 'block';
            document.querySelector('#doCloneScriptBlock').style.display = 'block';
        }
    });
});

document.getElementById('doClone').addEventListener('click', function() {
    chrome.storage.sync.get(['list_href'], function(result) {
        result.list_href.forEach((url) => {
            openTab(url);
        });
    });
    chrome.storage.sync.set({'list_href': []});
});

document.getElementById('doCloneScript').addEventListener('click', function() {
    url = 'https://allu-official.com/js/sys/allu_random.js';
    chrome.tabs.create({url: url}, function(tab) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['js/clone-script.js']
        });
    });
});

function openTab(url) {
    chrome.tabs.create({url: url}, function(tab) {
        // chrome.scripting.executeScript({
        //     target: { tabId: tab.id },
        //     files: ['js/clone-blog-detail.js']
        // });
    });
}
*/

class ContentInfo extends HTMLElement {
  constructor() {
    super();
    this.registerAction()
  }

  registerAction () {
    this.btnSwitch = this.querySelector('#btn_switch')
    this.btnSwitch.onclick = this.onSwitch.bind(this)
  }

  onSwitch() {
    const currentClass = this.btnSwitch.dataset.currentClass
    const currentLabel = this.btnSwitch.innerText

    this.classList.remove(currentClass)
    this.classList.add(this.dataset.switchClass)
    this.btnSwitch.dataset.currentClass = this.dataset.switchClass
    this.dataset.switchClass = currentClass
    this.btnSwitch.innerText = this.btnSwitch.dataset.switchText
    this.btnSwitch.dataset.switchText = currentLabel
  }
}

customElements.define("content-info", ContentInfo);