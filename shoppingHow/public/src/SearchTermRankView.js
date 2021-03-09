import fetch from 'cross-fetch';
import { getResponseJsonUrl, delay } from './serviceUtil.js';

function SearchTermRankView({ $inputElement, $rankKeywordList, rankUrl }) {
  this.$inputElement = $inputElement;
  this.$rankKeywordList = $rankKeywordList;
  this.rankUrl = rankUrl;
  this.rankKeywordArray = [];
  this.rolling = {
    timer: null,
    timeSeconds: 3000,
    maxPosition: '220',
  };
  this.init();
}

SearchTermRankView.prototype.init = async function () {
  const rankObj = await getResponseJsonUrl(this.rankUrl);
  this.rankKeywordArray = rankObj.list.map(e => e.keyword).slice(0, 10);
  console.log(this.$rankKeywordList);
  this.makeTemplate();
  this.rollingSearchBar();
  this.observeSearchBarState();
  // this.initEvent();
}

SearchTermRankView.prototype.initEvent = function () {
  this.inputElement.addEventListener('input', async ({ target }) => {
    // const a = await getResponseJsonUrl((`https://suggest-bar.daum.net/suggest?callback=jQuery34109517340090479085_1615213153801&limit=10&mode=json&code=utf_in_out&q=${target.value}&id=shoppinghow_suggest`));
    // console.log(a)
  });
}

SearchTermRankView.prototype.makeTemplate = function () {
  let template = this.rankKeywordArray.map((item, index) => {
    return `<li>
              <span>${index + 1}</span>  <span>${item}</span>
           </li>`;
  }).join('');
  template += `<li><span>1</span>  <span>${this.rankKeywordArray[0]}</span></li>`

  this.$rankKeywordList.innerHTML = template;
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





export default SearchTermRankView;