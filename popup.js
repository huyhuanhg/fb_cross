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

class ContentControl extends HTMLElement {
  constructor() {
    super();
    this.init();
    this.registerAction();
  }

  init() {
    chrome.storage.sync.set({'url_list': []})
    this.btnAddPage = this.querySelector('#btn_follow_page')
    this.btnAddArticle = this.querySelector('#btn_follow_article')
    this.btnPrimary = this.querySelector('#btn_primary')
  }

  registerAction () {
    this.btnAddPage.onclick = this.#onAdd.bind(this, this.btnAddPage.dataset.type)
    this.btnAddArticle.onclick = this.#onAdd.bind(this, this.btnAddArticle.dataset.type)
    this.btnPrimary.onclick = this.#action.bind(this)
  }

  #action () {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['js/main.js']
      });
    });
  }

  #onAdd (type) {
    const url = this.#getUrlValue()
    if (this.#validateUrl(url)) {
      this.#addUrl({url, type})
    }
  }

  #getUrlValue() {
    return this.querySelector('#url_input').value
  }

  #addUrl(url, type) {
    const urlList = chrome.storage.sync.get(['url_list'])

    urlList = [ ...urlList, { type, url } ]
    chrome.storage.sync.set({'url_list': urlList})
  }

  #validateUrl(url) {
    return /https:\/\/www\.facebook\.com/.test(url) && !!url;
  }
}

customElements.define("content-info", ContentInfo);
customElements.define("content-control", ContentControl);
