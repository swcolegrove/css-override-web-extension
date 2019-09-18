const debug = (msg) => {
  console.log(`css-override-web-extension: ${msg}`);
};

const getActiveTab = () => {
  return browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    return tabs[0];
  });
}

const getStorageData = (domainKey) => {
  return browser.storage.sync.get(domainKey).then((data) => {
    return data
  });
};

const setStorageData = (obj) => {
  return browser.storage.sync.set(obj).then(() => true, () => false);
}

const toggleStyles = async function() {
  let activeTab = await getActiveTab();
  const tabUrl = new URL(activeTab.url).hostname;
  if (!tabUrl) {
    return;
  }

  const tabData = await getStorageData(tabUrl);
  if (tabData && tabData[tabUrl]) {

  } else {
    let obj = {};
    obj[tabUrl] = {
      enabled: true
    };
    await setStorageData(obj);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btnToggle = document.getElementById("btnToggle");
  btnToggle.addEventListener('click', toggleStyles);
});
