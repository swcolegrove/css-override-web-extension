let siteData;
const debug = (msg) => {
  console.log(`css-override-web-extension: ${msg}`);
};

const clearStorage = () => {
  browser.storage.sync.clear()
};

const getStorageData = () => {
  return browser.storage.sync.get();
};

const initializePage = () => {
  let ulSiteList = document.getElementById('siteList');
  getStorageData().then(storageData => {
    debug(JSON.stringify(storageData));
    siteData = storageData;

    Object.keys(siteData).forEach(site => {
      const li = document.createElement('li');
      li.appendChild(document.createTextNode(site));
      li.setAttribute('id', site);
      ulSiteList.appendChild(li);
    });
  });
};

// browser.runtime.onMessage.addListener(request => {
//   console.log("Message from the background script:");
//   console.log(request.msg);
// });

document.addEventListener('DOMContentLoaded', () => {
  const btnClear = document.getElementById('btnClear');
  btnClear.addEventListener('click', clearStorage);
  initializePage();
});
