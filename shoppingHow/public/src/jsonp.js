function requestJsonp(word) {
  const script = document.createElement('script');
  script.src = `https://suggest-bar.daum.net/suggest?callback=responseJsonpData&limit=10&mode=json&code=utf_in_out&q=${word}&id=shoppinghow_suggest`;
  document.body.append(script);
}

function responseJsonpData(data) {
  console.log(data)
}

requestJsonp('아메리카노');