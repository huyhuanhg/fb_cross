import LogDetailStorage from "./js/storages/LogDetailLocalStorage.js";
import QueueStorage from "./js/storages/QueueLocalStorage.js";
import Runner from "./js/jobs/Runner.js";
import Tab from "./js/entities/Tab.js";

class ContentInfo extends HTMLElement {
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

  async listenAndRender() {
    const queue = await QueueStorage.getStack()
    const log = await LogDetailStorage.getStack()
    this.#renderFollow(queue);
    this.#renderDetail(log);

    QueueStorage.change(this.#renderFollow.bind(this), 'data');
    LogDetailStorage.change(this.#renderDetail.bind(this));
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

  #renderFollow(data) {
    this.logFollowElement.innerHTML = "";

    data.forEach(({ url, status }) => {
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

  #renderDetail(data) {
    this.logDetailElement.innerHTML = "";

    data.forEach((message) => {
      const logDetailWrapper = document.createElement("div");
      logDetailWrapper.classList.add("log-detail-wrapper");

      logDetailWrapper.innerHTML = message;

      this.logDetailElement.append(logDetailWrapper);
    });
  }

  #deleteUrl(url) {
    Runner.delete(url);
  }
}

class ContentControl extends HTMLElement {
  constructor() {
    super();
    this.init();
    this.registerAction();
  }

  async init() {
    this.yourPageUrlInput = this.querySelector("#your_page_url_input");
    this.btnYourPageUrlInputEdit = this.querySelector(
      "#your_page_url_input+span"
    );
    this.btnAddPage = this.querySelector("#btn_follow_page");
    this.btnPrimary = this.querySelector("#btn_primary");
    this.btnReset = this.querySelector("#btn_reset");

    if (await Runner.state()) {
      this.btnPrimary.dataset.onClickLabel = "is_start";
      this.btnPrimary.innerText = "Tạm dừng";
    }

    const primaryPage = await Runner.primaryPage()

    if (primaryPage) {
      this.yourPageUrlInput.value = primaryPage
      this.yourPageUrlInput.disabled = true
    }
  }

  registerAction() {
    Tab.registerUpdated();
    this.yourPageUrlInput.onkeypress = this.#onPressEnterYourPageUrl.bind(this);
    this.yourPageUrlInput.onblur = this.#handleDisableYourPageUrlInput.bind(this);
    this.btnYourPageUrlInputEdit.onclick = this.#onEditYourPageUrl.bind(this);
    this.btnAddPage.onclick = this.#onAdd.bind(this);
    this.btnPrimary.onclick = this.#action.bind(this);
    this.btnReset.onclick = this.#reset.bind(this);
  }

  async #action() {
    const isStart = await Runner.state()
    if (! isStart && ! await Runner.isEmpty()) {
      this.btnPrimary.dataset.onClickLabel = "is_start";
      this.btnPrimary.innerText = "Tạm dừng";
      return Runner.start();
    }

    this.btnPrimary.dataset.onClickLabel = "is_stop";
    this.btnPrimary.innerText = "Bắt đầu";
    return Runner.stop();
  }

  #reset() {
    this.yourPageUrlInput.value = ''
    this.yourPageUrlInput.disabled = false
    Runner.reset();
  }

  #onAdd() {
    const url = this.#getUrlValue();
    if (this.#validateUrl(url)) {
      Runner.push(url);
      this.querySelector("form.main-content-control__form").reset();
    }
  }

  async #onEditYourPageUrl() {
    if (!this.yourPageUrlInput.disabled) {
      return;
    }

    const yourPageUrlLength = this.yourPageUrlInput.value.length;
    this.yourPageUrlInput.disabled = false;
    this.yourPageUrlInput.focus();
    this.yourPageUrlInput.setSelectionRange(
      yourPageUrlLength,
      yourPageUrlLength
    );

    if (await Runner.state()) {
      this.btnPrimary.click().bind(this)
    }
  }

  #onPressEnterYourPageUrl(event) {
    if (event.key === "Enter") {
      this.#handleDisableYourPageUrlInput();
    }
  }

  #handleDisableYourPageUrlInput() {
    if (this.#validateUrl(this.yourPageUrlInput.value)) {
      this.yourPageUrlInput.disabled = true;
      Runner.primaryPage(this.yourPageUrlInput.value)
    } else {
      this.yourPageUrlInput.value = "";
    }
  }

  #getUrlValue() {
    return this.querySelector("#url_input").value;
  }

  #validateUrl(url) {
    return url && /^https:\/\/www\.facebook\.com\//.test(url);
  }
}

customElements.define("content-info", ContentInfo);
customElements.define("content-control", ContentControl);
