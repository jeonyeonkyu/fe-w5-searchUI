const delay = (data, ms) => new Promise(resolve => setTimeout(() => resolve(data), ms));
const getResponseJsonUrl = async (url) => (await fetch(url)).json();

export { delay, getResponseJsonUrl };