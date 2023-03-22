class AbstractStorage {
  static get KEY() {
    throw new Error("You have to implement the constant KEY!");
  }

  static get NAMESPACE() {
    throw new Error("You have to implement the constant NAMESPACE!");
  }

  static get REQUIRE_KEY() {
    throw new Error("You have to implement the constant REQUIRE_KEY!");
  }

  static get REQUIRE_KEYS() {
    throw new Error("You have to implement the constant PRIMARY_KEY!");
  }

  static get DEFAULT_VALUE() {
    throw new Error("You have to implement the constant DEFAULT_VALUE!");
  }

  static push(value) {
    throw new Error("You have to implement the method push!");
  }

  static gets(keys) {
    if (typeof keys !== "object" && Array.isArray(keys)) {
      return Promise.reject(new Error("Variable type is valid"));
    }

    return chrome.storage[this.NAMESPACE].get(keys).then(
      (result) => Promise.resolve(result),
      (error) => Promise.reject(error)
    );
  }

  static async get() {
    return chrome.storage[this.NAMESPACE].get([this.KEY]).then(
      (result) => Promise.resolve(result[this.KEY] || this.DEFAULT_VALUE),
      () => Promise.resolve(this.DEFAULT_VALUE)
    );
  }

  static set(value) {
    if (this.isInvalidRequireKeys(value)) {
      return;
    }

    chrome.storage[this.NAMESPACE].set({ [this.KEY]: value });
  }

  static reset() {
    chrome.storage[this.NAMESPACE].set({ [this.KEY]: this.DEFAULT_VALUE });
  }

  static isInvalidRequireKeys(value) {
    for (const key of this.REQUIRE_KEYS) {
      if (!value.hasOwnProperty(key)) {
        if (this.DEFAULT_KEY_VALUE && this.DEFAULT_KEY_VALUE.hasOwnProperty(key)) {
          value[key] = this.DEFAULT_KEY_VALUE[key]

          continue;
        }

        return true;
      }
    }

    return false;
  }
}

class QueueLocalStorage extends AbstractStorage {
  static get NAMESPACE() {
    return "local";
  }

  static get KEY() {
    return "queue";
  }

  static get PRIMARY_KEY() {
    return "url";
  }

  static get REQUIRE_KEYS() {
    return ["url", "status"];
  }

  static get DEFAULT_VALUE() {
    return [];
  }

  static push(value) {
    if (this.isInvalidRequireKeys(value)) {
      return;
    }

    this.get().then((result) => {
      const pushingPKValue = value[this.PRIMARY_KEY];
      if (!pushingPKValue) {
        return;
      }

      const cloneResult = [...result];

      const pushingValueIndex = cloneResult.findIndex(
        (cloneVal) => cloneVal[this.PRIMARY_KEY] === pushingPKValue
      );

      if (pushingValueIndex !== -1) {
        return;
      }

      this.set([...result, value]);
    });
  }

  static async getByPK(PKVal) {
    return this.get().then((result) => {
      const PKRecord = result.find(
        (resultVal) => resultVal[this.PRIMARY_KEY] === PKVal
      );
      return PKRecord ? Promise.resolve(PKRecord) : Promise.resolve(null);
    });
  }

  static delete(PKVal) {
    this.get().then((result) => {
      const cloneResult = [...result];

      const pushingValueIndex = cloneResult.findIndex(
        (cloneVal) => cloneVal[this.PRIMARY_KEY] === PKVal
      );

      if (pushingValueIndex === -1) {
        return;
      }

      cloneResult.splice(pushingValueIndex, 1);

      this.set(cloneResult);
    });
  }
}

class LogDetailLocalStorage extends AbstractStorage {
  static get NAMESPACE() {
    return "local";
  }

  static get KEY() {
    return "log_detail";
  }

  static get REQUIRE_KEYS() {
    return ["content", "level"];
  }

  static get DEFAULT_KEY_VALUE() {
    return {
      level: 'default'
    };
  }

  static get DEFAULT_VALUE() {
    return [];
  }

  static get CONTENT_KEY() {
    return "content";
  }

  static get LOG_LEVEL_COLOR() {
    return {
      danger: "#dc3545",
      info: "#0d6efd",
      success: "#198754",
      warning: "#ffc107",
      default: "#6c757d",
    };
  }

  static push(value) {
    if (this.isInvalidRequireKeys(value)) {
      return;
    }

    value = this.#convertFormatContent(value);

    this.get().then((result) => {
      this.set([...result, value]);
    });
  }

  static #convertFormatContent(value) {
    return `<span style="color: ${this.LOG_LEVEL_COLOR[value.level]}" data-time="" title="">${value[this.CONTENT_KEY].replaceAll(
      /:(\w+)/g,
      (_, key) => (value.hasOwnProperty(key) ? value[key] : "")
    )}</span>`
  }
}

class Runner {}

const addQueue = (url, status = "inactive") => {
  chrome.storage.sync.get(["queue"], ({ queue }) => {
    chrome.storage.sync.set({
      queue: [...(queue || []), { url, status }],
    });
  });
};

const getStorage = (key, callback) => {
  chrome.storage.sync.get([key], (storage) => {
    callback(storage[key]);
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

class Container {
  static isStart(callback) {
    getStorage("container", (container) => {
      callback(container?.is_start);
    });
  }

  static start() {
    this.isStart(
      ((isStart) => {
        if (isStart) {
          return;
        }

        getStorage("container", (container) => {
          let cloneContainer = {};
          if (
            container &&
            typeof container === "object" &&
            container.constructor === Object
          ) {
            cloneContainer = { ...container, is_start: true };
          } else {
            cloneContainer = { is_start: true };
          }

          chrome.storage.sync.set({
            container: cloneContainer,
          });
        });

        addLogDetail("Tự động like chéo đã bắt đầu!", {
          level: "success",
        });
      }).bind(this)
    );
  }

  static stop() {
    this.isStart(
      ((isStart) => {
        if (!isStart) {
          return;
        }

        getStorage("container", (container) => {
          let cloneContainer = {};
          if (
            container &&
            typeof container === "object" &&
            container.constructor === Object
          ) {
            cloneContainer = { ...container, is_start: false };
          } else {
            cloneContainer = { is_start: false };
          }

          chrome.storage.sync.set({
            container: cloneContainer,
          });
        });

        addLogDetail("Tự động like chéo đã tạm dừng", {
          level: "default",
        });
      }).bind(this)
    );
  }

  static add(url) {}

  static delete(url) {}

  static #execute() {}
}

class ContentInfo extends HTMLElement {
  get logLevelMap() {
    return {
      danger: "#dc3545",
      info: "#0d6efd",
      success: "#198754",
      warning: "#ffc107",
      default: "#6c757d",
    };
  }

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
      logDetailWrapper.dataset.status = status;

      const urlText = document.createElement("span");
      urlText.classList.add("log-follow-page-url");
      urlText.title = `[${
        status === "active" ? "Đang chạy" : "Chưa hoạt động"
      }] ${url}`;

      urlText.innerText = url.replace("https://www.facebook.com", "");

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
    Container.delete(url);
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
    this.yourPageUrlInput = this.querySelector("#your_page_url_input");
    this.btnYourPageUrlInputEdit = this.querySelector(
      "#your_page_url_input+span"
    );
    this.btnAddPage = this.querySelector("#btn_follow_page");
    this.btnPrimary = this.querySelector("#btn_primary");
    this.btnReset = this.querySelector("#btn_reset");

    Container.isStart(
      ((isStart) => {
        if (isStart) {
          this.btnPrimary.dataset.onClickLabel = "Bắt đầu";
          this.btnPrimary.innerText = "Tạm dừng";
        }
      }).bind(this)
    );
  }

  registerAction() {
    this.yourPageUrlInput.onkeypress = this.#onPressEnterYourPageUrl.bind(this);
    this.yourPageUrlInput.onblur =
      this.#handleDisableYourPageUrlInput.bind(this);
    this.btnYourPageUrlInputEdit.onclick = this.#onEditYourPageUrl.bind(this);
    this.btnAddPage.onclick = this.#onAdd.bind(this);
    this.btnPrimary.onclick = this.#action.bind(this);
    this.btnReset.onclick = this.#reset.bind(this);
  }

  #action() {
    getStorage(
      "queue",
      ((queue) => {
        if (queue?.length > 0) {
          const nextLabel = this.btnPrimary.dataset.onClickLabel;
          this.btnPrimary.dataset.onClickLabel = this.btnPrimary.innerText;
          this.btnPrimary.innerText = nextLabel;

          Container.isStart((isStart) => {
            if (isStart) {
              Container.stop();
            } else {
              Container.start();
            }
          });
        }
      }).bind(this)
    );
  }

  #reset() {
    chrome.storage.sync.set({ queue: null });
    chrome.storage.sync.set({ log_detail: null });
    Container.stop();
  }

  #onAdd() {
    const url = this.#getUrlValue();
    if (this.#validateUrl(url)) {
      this.#addUrl(url);
      this.#addDetail(url);
    } else {
      this.querySelector("form.main-content-control__form").reset();
    }
  }

  #onEditYourPageUrl() {
    if (!this.yourPageUrlInput.disabled) {
      return;
    }

    Container.isStart(
      ((isStart) => isStart && this.btnPrimary.click()).bind(this)
    );

    const yourPageUrlLength = this.yourPageUrlInput.value.length;
    this.yourPageUrlInput.disabled = false;
    this.yourPageUrlInput.focus();
    this.yourPageUrlInput.setSelectionRange(
      yourPageUrlLength,
      yourPageUrlLength
    );
  }

  #onPressEnterYourPageUrl(event) {
    if (event.key === "Enter") {
      this.#handleDisableYourPageUrlInput();
    }
  }

  #handleDisableYourPageUrlInput() {
    if (this.#validateUrl(this.yourPageUrlInput.value)) {
      this.yourPageUrlInput.disabled = true;
    } else {
      this.yourPageUrlInput.value = "";
    }
  }

  #getUrlValue() {
    return this.querySelector("#url_input").value;
  }

  #addUrl(url) {
    Container.add(url);
    addQueue(url);
  }

  #addDetail(url) {
    addLogDetail("URL :url đã được thêm vào hàng đợi!", {
      url: `<strong>${url}</strong>`,
      level: "info",
    });
  }

  #validateQueueUrl(url) {
    if (! this.#validateUrl(url)) {
      return false
    }

    return true;
  }

  #validateUrl(url) {
    return /^https:\/\/www\.facebook\.com\//.test(url) && !!url;
  }
}

customElements.define("content-info", ContentInfo);
customElements.define("content-control", ContentControl);
