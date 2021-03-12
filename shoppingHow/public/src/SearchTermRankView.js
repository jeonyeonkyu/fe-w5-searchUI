import { getResponseJsonUrl, delay } from './serviceUtil.js';
import _ from './util.js';

function SearchTermRankView({ $inputElement, $rankKeywordList, $searchWord, rankUrl, currentTypingUrl, rolling }) {
  this.$inputElement = $inputElement;
  this.$rankKeywordList = $rankKeywordList;
  this.$searchWord = $searchWord;
  this.rankUrl = rankUrl;
  this.currentTypingUrl = currentTypingUrl;
  this.rolling = rolling;
  this.typingTimer = null;
  this.rankKeywordArray = [];
  this.currentTypingArray = [];
  this.inputPopupClassName = 'input_popup';
  this.RANKS_NUMBER = 10;
  this.keyWordIndex = -1;
  this.init();
}

SearchTermRankView.prototype.init = async function () {
  const rankObj = await getResponseJsonUrl(this.rankUrl);
  this.rankKeywordArray = rankObj.list.map(item => item.keyword).slice(0, this.RANKS_NUMBER);
  this.renderRollingTemplate();
  this.renderPopupTemplate();
  this.rollingSearchBar();
  this.observeSearchBarState();
  this.initEvent();
  window['putInResponseJsonpData'] = this.putInResponseJsonpData.bind(this);
}

SearchTermRankView.prototype.initEvent = function () {
  this.$inputElement.addEventListener('click', this.focusInputHandler.bind(this));
  this.$inputElement.addEventListener('input', this.typingInputHandler.bind(this));
  document.addEventListener('click', this.quitInputHandler.bind(this));
  document.addEventListener('keydown', this.keydownInputHandler.bind(this));
}

SearchTermRankView.prototype.requestJsonp = function (word, callbackName) {
  const script = document.createElement('script');
  script.src = `${this.currentTypingUrl}&q=${word}&callback=${callbackName}`;
  document.body.append(script);
}

SearchTermRankView.prototype.putInResponseJsonpData = function (data) {
  this.currentTypingArray = data.items.map(item => item.replace(/\|.+/g, ''));
}

SearchTermRankView.prototype.focusInputHandler = function () {
  this.$rankKeywordList.classList.add('display_none');
  if (!this.$inputElement.value) _.$(`.${this.inputPopupClassName}`).classList.remove('display_none');
  if (this.currentTypingArray.length) this.$searchWord.classList.remove('display_none');
  clearTimeout(this.rolling.timer);
  this.rolling.timer = null;
}

SearchTermRankView.prototype.typingInputHandler = function ({ target: { value } }) {
  this.keyWordIndex = -1;
  if (this.typingTimer) clearTimeout(this.typingTimer);
  this.typingTimer = setTimeout(async function () {
    await delay(this.requestJsonp(value, 'putInResponseJsonpData'), 500);
    if (value) {
      if (this.currentTypingArray.length) this.$searchWord.classList.remove('display_none');
      _.$(`.${this.inputPopupClassName}`).classList.add('display_none');
      this.renderSearchWordTemplate(value);
    } else {
      this.$searchWord.classList.add('display_none');
      _.$(`.${this.inputPopupClassName}`).classList.remove('display_none');
    }
  }.bind(this), 500);
}

SearchTermRankView.prototype.quitInputHandler = function ({ target }) {
  if (target === this.$inputElement || target.closest('.head__search--input')) return;
  _.$(`.${this.inputPopupClassName}`).classList.add('display_none');
  this.$searchWord.classList.add('display_none');
  if (this.$inputElement.value) return;
  this.$rankKeywordList.classList.remove('display_none');
  if (!this.rolling.timer) this.rollingSearchBar();
}

SearchTermRankView.prototype.keydownInputHandler = function ({ key }) {
  if (this.$searchWord.classList.contains('display_none')) return;
  if (!(key === 'ArrowDown' || key === 'ArrowUp')) return;
  const keyWordList = _.$All(`.${this.$searchWord.className} > ul > li`);
  keyWordList.forEach((element) => element.classList.remove('gray_background'));
  switch (key) {
    case 'ArrowDown':
      this.keyWordIndex = this.keyWordIndex < keyWordList.length - 1 ? ++this.keyWordIndex : this.keyWordIndex;
      break;
    case 'ArrowUp':
      this.keyWordIndex = this.keyWordIndex > 0 ? --this.keyWordIndex : this.keyWordIndex;
      break;
  }
  keyWordList[this.keyWordIndex].classList.add('gray_background');
  this.$inputElement.value = keyWordList[this.keyWordIndex].innerText;
}

SearchTermRankView.prototype.rollingSearchBar = function () {
  this.rolling.timer = setTimeout(function tick() {
    const currentPosition = this.$rankKeywordList.style.transform.match(/[0-9]/g).join('');
    this.$rankKeywordList.style.transform = `translateY(-${Number(currentPosition) + 22}px)`;
    this.rolling.timer = setTimeout(tick.bind(this), this.rolling.timeSeconds);
  }.bind(this), this.rolling.timeSeconds);
}

SearchTermRankView.prototype.observeSearchBarState = function () {
  const observer = new MutationObserver(async (mutations) => {
    if (mutations[0].target.style.transform.match(/[0-9]/g).join('') === this.rolling.maxPosition) {
      await delay('', 1000);
      this.$rankKeywordList.classList.remove('transition_on');
      this.$rankKeywordList.style.transform = 'translateY(0px)';
      await delay('', 1000);
      this.$rankKeywordList.classList.add('transition_on');
    }
  });
  const config = { attributes: true };
  observer.observe(this.$rankKeywordList, config);
}

SearchTermRankView.prototype.renderRollingTemplate = function () {
  let template = this.rankKeywordArray.map((item, index) => {
    return `<li>
              <span>${index + 1}</span>  <span>${item}</span>
           </li>`;
  }).join('');
  template += `<li><span>1</span>  <span>${this.rankKeywordArray[0]}</span></li>`;

  this.$rankKeywordList.innerHTML = template;
}

SearchTermRankView.prototype.renderPopupTemplate = function () {
  const template = `<div class="${this.inputPopupClassName} display_none">
                      <div>인기 쇼핑 키워드</div>
                      <ul>
                        ${this.rankKeywordArray.map((item, index) => {
    return `<li>
             <span class="bold">${index + 1}</span> <span>${item}</span>
            </li>`
  }).join('')}
                      </ul>
                    </div>`;

  this.$inputElement.insertAdjacentHTML('afterend', template);
}

SearchTermRankView.prototype.renderSearchWordTemplate = function (word) {
  const template = `<ul>
                      ${this.currentTypingArray.map(item => {
    return `<li>
              <span>${item.replace(word, `<span class='highlight'>${word}</span>`)}</span>
            </li>`
  }).join('')}
                    </ul>`;

  this.$searchWord.innerHTML = template;
}

export default SearchTermRankView;