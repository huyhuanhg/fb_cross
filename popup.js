const addQueue = (url, status = "inactive") => {
  chrome.storage.sync.get(["queue"], ({ queue }) => {
    chrome.storage.sync.set({
      queue: [...(queue || []), { url, status }],
    });
  });
};

const addLogDetail = (message, args) => {
  chrome.storage.sync.get(["log_detail"], ({ log_detail }) => {
    chrome.storage.sync.set({
      log_detail: [...(log_detail || []), { message, ...args }],
    });
  });
};

const deleteQueue = (urlDelete) => {
  chrome.storage.sync.get(["queue"], ({ queue }) => {
    const nextValue = [...(queue || [])];
    const urlIndex = nextValue.findIndex(({ url }) => urlDelete === url);

    if (urlIndex > -1) {
      nextValue.splice(urlIndex, 1);
      chrome.storage.sync.set({ queue: nextValue });
    }
  });
};

class ContentInfo extends HTMLElement {
  logLevelMap = {
    danger: "#dc3545",
    info: "#0d6efd",
    success: '#198754',
    warning: "#ffc107",
    default: "#6c757d",
  };

  constructor() {
    super();
    this.registerAction();
  }

  registerAction() {
    this.logFollowElement = this.querySelector("#main_content_follow");
    this.logDetailElement = this.querySelector("#main_content_detail");
    this.btnSwitch = this.querySelector("#btn_switch");
    this.btnSwitch.onclick = this.onSwitch.bind(this);
    this.listenAndRender();
  }

  onSwitch() {
    const currentClass = this.btnSwitch.dataset.currentClass;
    const currentLabel = this.btnSwitch.innerText;

    this.classList.remove(currentClass);
    this.classList.add(this.dataset.switchClass);
    this.btnSwitch.dataset.currentClass = this.dataset.switchClass;
    this.dataset.switchClass = currentClass;
    this.btnSwitch.innerText = this.btnSwitch.dataset.switchText;
    this.btnSwitch.dataset.switchText = currentLabel;
  }

  listenAndRender() {
    chrome.storage.sync.get(
      ["queue"],
      (({ queue }) => {
        this.#renderFollow(queue || []);
      }).bind(this)
    );

    chrome.storage.sync.get(
      ["log_detail"],
      (({ log_detail }) => {
        this.#renderDetail(log_detail || []);
      }).bind(this)
    );

    chrome.storage.onChanged.addListener(
      ((changes, areaName) => {
        if (areaName !== "sync") {
          return;
        }

        if (changes.hasOwnProperty("queue")) {
          const {
            queue: { newValue },
          } = changes;
          this.#renderFollow(newValue);
        }

        if (changes.hasOwnProperty("log_detail")) {
          const {
            log_detail: { newValue },
          } = changes;
          this.#renderDetail(newValue);
        }
      }).bind(this)
    );
  }

  #renderFollow(value) {
    this.logFollowElement.innerHTML = "";

    value.forEach(({ url, status }) => {
      const logDetailWrapper = document.createElement("div");
      logDetailWrapper.classList.add("log-follow-wrapper");

      const urlText = document.createElement("span");
      urlText.classList.add("log-follow-page-url");
      urlText.title = url;

      urlText.innerText = url.replace("https://www.facebook.com", "")

      const urlAction = document.createElement("span");
      urlAction.classList.add("log-follow-page-action");

      urlAction.onclick = this.#deleteUrl.bind(this, url);
      urlAction.innerText = "Xóa";

      logDetailWrapper.append(urlText);
      logDetailWrapper.append(urlAction);

      this.logFollowElement.append(logDetailWrapper);
    });
  }

  #renderDetail(value) {
    this.logDetailElement.innerHTML = "";

    value.forEach(({ message, ...logVariables }) => {
      const logDetailWrapper = document.createElement("div");
      logDetailWrapper.classList.add("log-detail-wrapper");

      if (logVariables.hasOwnProperty("level")) {
        const color =
          this.logLevelMap[logVariables.level] || this.logLevelMap.default;

        logDetailWrapper.style.color = color;
      }

      logDetailWrapper.innerHTML = `<span>${message.replaceAll(
        /:(\w+)/g,
        (_, key) => (logVariables.hasOwnProperty(key) ? logVariables[key] : "")
      )}</span>`;

      this.logDetailElement.append(logDetailWrapper);
    });
  }

  #deleteUrl(url) {
    deleteQueue(url);
    addLogDetail("URL :url đã được xóa khỏi hàng đợi!", {
      url: `<strong>${url}</strong>`,
      level: "danger",
    });
  }
}

class ContentControl extends HTMLElement {
  constructor() {
    super();
    this.init();
    this.registerAction();
  }

  init() {
    this.btnAddPage = this.querySelector("#btn_follow_page");
    this.btnPrimary = this.querySelector("#btn_primary");
    this.btnReset = this.querySelector("#btn_reset");
  }

  registerAction() {
    this.btnAddPage.onclick = this.#onAdd.bind(this);
    this.btnPrimary.onclick = this.#action.bind(this);
    this.btnReset.onclick = this.#reset.bind(this);
  }

  #action() {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["js/main.js"],
    });
  }

  #reset() {
    chrome.storage.sync.set({ queue: null });
    chrome.storage.sync.set({ log_detail: null });
  }

  #onAdd() {
    const url = this.#getUrlValue();
    if (this.#validateUrl(url)) {
      this.#addUrl(url);
      this.#addDetail(url);
    }
  }

  #getUrlValue() {
    return this.querySelector("#url_input").value;
  }

  #addUrl(url) {
    addQueue(url);
  }

  #addDetail(url) {
    addLogDetail("URL :url đã được thêm vào hàng đợi!", {
      url: `<strong>${url}</strong>`,
      level: "info",
    });
  }

  #validateUrl(url) {
    return /^https:\/\/www\.facebook\.com\//.test(url) && !!url;
  }
}

customElements.define("content-info", ContentInfo);
customElements.define("content-control", ContentControl);
