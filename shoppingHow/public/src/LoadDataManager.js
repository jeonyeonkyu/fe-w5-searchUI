import fetch from 'cross-fetch';

class LoadDataManager {
  constructor({ mainImg, moreImg }) {
    this.mainImg = mainImg;
    this.moreImg = moreImg;
    this.nextImgUrlPage = 1;
  }

  getResponseMainImgUrl() {
    return fetch(this.mainImg)
      .then(response => response.json());
  }

  getResponseMoreImgUrl() {
    return fetch(this.moreImg)
      .then(response => response.json());
  }

  getEventImgUrl() {
    return this.getResponseMainImgUrl()
      .then(data => data.event.imgurl);
  }

  getMileageImgUrlList() {
    return this.getResponseMainImgUrl()
      .then(data => data.mileageList.map(item => item.imgurl));
  }

  getMallEventDataList() {
    return this.getResponseMainImgUrl()
      .then(data => data.mallEventList.map(data => {
        const { imgurl, text, text2 } = data;
        return { imgurl, text, text2 };
      }));
  }

  getMoreDataList() {
    return this.getResponseMoreImgUrl()
      .then(data => {
        this.setNextImgUrl(data);
        return data.contents.map(item => {
          const { imgurl, title, subtitle } = item.eventContent;
          return { imgurl, title, subtitle };
        })
      });
  }

  setNextImgUrl({ pageInfo }) {
    const nextPageUrl = this.moreImg.replace(/(page=)\d+/, `page=${++this.nextImgUrlPage}`);
    const nextMinNumUrl = nextPageUrl.replace(/(min_num=)\d+/, `min_num=${pageInfo.min_num}`);
    this.moreImg = nextMinNumUrl;
  }
}

export default LoadDataManager;