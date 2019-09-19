const debug = (msg) => {
  console.log(`css-override-web-extension: ${msg}`);
};

const getTabUrl = (tab) => new URL(tab.url).hostname;

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

const updatePopup = (enabled) => {
  const btnToggle = document.getElementById("btnToggle");
  btnToggle.innerHTML = enabled ? 'ON' : 'OFF';
  if (enabled) {
    btnToggle.classList.remove('off');
  } else {
    btnToggle.classList.add('off');
  }
}

const toggleStyles = async function() {
  debug('Toggle style')
  let activeTab = await getActiveTab();
  const tabUrl = getTabUrl(activeTab);
  if (!tabUrl) {
    return;
  }

  let tabData = await getStorageData(tabUrl);
  let enabled = true;
  if (tabData && tabData[tabUrl]) {
    tabData[tabUrl].enabled = !tabData[tabUrl].enabled;
    enabled = tabData[tabUrl].enabled;
    await setStorageData(tabData);
  } else {
    debug('Applying styles to site for first time')
    let obj = {};
    obj[tabUrl] = {
      enabled
    };
    await setStorageData(obj);
  }

  browser.runtime.sendMessage({
    action: 'reloadTab',
    tab: {
      id: activeTab.id,
      url: tabUrl,
    },
  }).then((message) => {
    updatePopup(enabled);
  });
}

const initializePopup = async function() {
  let activeTab = await getActiveTab();
  const tabUrl = getTabUrl(activeTab);

  let tabData = await getStorageData(tabUrl);
  let enabled = true;
  if (tabData && tabData[tabUrl]) {
    updatePopup(tabData[tabUrl].enabled);
  } else {
    updatePopup(false);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const btnToggle = document.getElementById("btnToggle");
  btnToggle.addEventListener('click', toggleStyles);
  initializePopup();
});
