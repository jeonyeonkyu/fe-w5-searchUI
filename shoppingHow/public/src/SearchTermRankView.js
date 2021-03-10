import { getResponseJsonUrl, delay } from './serviceUtil.js';
import _ from './util.js';

function SearchTermRankView({ $inputElement, $rankKeywordList, rankUrl, rolling }) {
  this.$inputElement = $inputElement;
  this.$rankKeywordList = $rankKeywordList;
  this.rankUrl = rankUrl;
  this.rolling = rolling;
  this.rankKeywordArray = [];
  this.inputPopupClassName = 'input_popup';
  this.RANKS_NUMBER = 10;
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
}

SearchTermRankView.prototype.initEvent = function () {
  this.$inputElement.addEventListener('click', this.focusInputHandler.bind(this));
  document.addEventListener('click', this.quitInputHandler.bind(this));

  this.$inputElement.addEventListener('input', async ({ target }) => {
    console.log(target.value);
  });
}

SearchTermRankView.prototype.focusInputHandler = function () {
  _.$(`.${this.inputPopupClassName}`).classList.remove('display_none');
  clearTimeout(this.rolling.timer);
}

SearchTermRankView.prototype.quitInputHandler = function ({ target }) {
  if (target === this.$inputElement) return;
  _.$(`.${this.inputPopupClassName}`).classList.add('display_none');
  this.rollingSearchBar();
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
  })
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

export default SearchTermRankView;