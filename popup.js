import LogDetailStorage from "./js/storages/LogDetailLocalStorage.js";
import QueueStorage from "./js/storages/QueueLocalStorage.js";
import Runner from "./js/jobs/Runner.js";

class ContentInfo extends HTMLElement {
  constructor() {
    super();
    this.registerAction();
  }

  registerAction() {
    // this.logFollowElement = this.querySelector("#main_content_follow");
    // this.logDetailElement = this.querySelector("#main_content_detail");
    this.btnSwitch = this.querySelector("#btn_switch");
    this.btnSwitch.onclick = this.onSwitch.bind(this);
    // this.listenAndRender();
  }

  listenAndRender() {
    this.#renderFollow(QueueStorage.getStack());
    this.#renderDetail(LogDetailStorage.getStack());

    QueueStorage.change(this.#renderFollow.bind(this));
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

    value.forEach((message) => {
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
    // this.init();
    // this.registerAction();
  }

  init() {
    this.yourPageUrlInput = this.querySelector("#your_page_url_input");
    this.btnYourPageUrlInputEdit = this.querySelector(
      "#your_page_url_input+span"
    );
    this.btnAddPage = this.querySelector("#btn_follow_page");
    this.btnPrimary = this.querySelector("#btn_primary");
    this.btnReset = this.querySelector("#btn_reset");

    if (Runner.state()) {
      this.btnPrimary.dataset.onClickLabel = "Bắt đầu";
      this.btnPrimary.innerText = "Tạm dừng";
    }
  }

  registerAction() {
    this.yourPageUrlInput.onkeypress = this.#onPressEnterYourPageUrl.bind(this);
    this.yourPageUrlInput.onblur = this.#handleDisableYourPageUrlInput.bind(this);
    this.btnYourPageUrlInputEdit.onclick = this.#onEditYourPageUrl.bind(this);
    this.btnAddPage.onclick = this.#onAdd.bind(this);
    this.btnPrimary.onclick = this.#action.bind(this);
    this.btnReset.onclick = this.#reset.bind(this);
  }

  #action() {
    if (Runner.state()) {
      Runner.stop();
    } else {
      Runner.start();
    }
  }

  #reset() {
    Runner.reset();
  }

  #onAdd() {
    const url = this.#getUrlValue();
    if (this.#validateUrl(url)) {
      Runner.push(url);
    } else {
      this.querySelector("form.main-content-control__form").reset();
    }
  }

  #onEditYourPageUrl() {
    if (!this.yourPageUrlInput.disabled) {
      return;
    }

    if (Runner.state()) {
      this.btnPrimary.click().bind(this)
    }

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
      Runner.attr('primary_page', this.yourPageUrlInput.value)
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
