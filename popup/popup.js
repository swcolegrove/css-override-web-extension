let ACTIVE_TAB;

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

const updatePopup = (stylesEnabled) => {
  const btnToggle = document.getElementById("btnToggle");
  const btnOpenEditor = document.getElementById("btnOpenEditor");
  btnToggle.innerHTML = stylesEnabled ? 'ON' : 'OFF';
  if (stylesEnabled) {
    btnToggle.classList.remove('neutral');
  } else {
    btnToggle.classList.add('neutral');
  }
}

const addSiteToStorage = async function(tabUrl, enabled = true) {
  debug('Applying styles to site for first time')
  let obj = {};
  obj[tabUrl] = {
    enabled,
    style: ''
  };
  await setStorageData(obj);
};

const toggleStyles = async function() {
  debug('Toggle style')
  const tabUrl = getTabUrl(ACTIVE_TAB);
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
    addSiteToStorage(tabUrl)
  }

  browser.runtime.sendMessage({
    action: 'reloadTab',
    tab: {
      id: ACTIVE_TAB.id,
      url: tabUrl,
    },
  }).then((message) => {
    updatePopup(enabled);
  });
}

const initializePopup = async function() {
  ACTIVE_TAB = await getActiveTab();
  const tabUrl = getTabUrl(ACTIVE_TAB);

  let tabData = await getStorageData(tabUrl);
  if (tabData && tabData[tabUrl]) {
    updatePopup(tabData[tabUrl].enabled);
  } else {
    updatePopup(false);
  }
};

const openEditorWindow = async function() {
  const tabUrl = getTabUrl(ACTIVE_TAB);
  const page = '../pages/editor.html'
  const url = tabUrl ? `${page}?siteId=${tabUrl}` : page;
  const createData = {
    url,
    active: true,
  };

  const tabData = await getStorageData(tabUrl);
  if (!tabData || !tabData[tabUrl]) {
    await addSiteToStorage(tabUrl, false);
  }

  browser.tabs.create(createData).then((tab) => {
    // debug(JSON.stringify(tab))
    // const msg = {
    //   url: getTabUrl(ACTIVE_TAB),
    // };
    // browser.tabs.sendMessage(tab.id, msg);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const btnToggle = document.getElementById("btnToggle");
  btnToggle.addEventListener('click', toggleStyles);

  const btnOpenEditor = document.getElementById("btnOpenEditor");
  btnOpenEditor.addEventListener('click', openEditorWindow);
  initializePopup();
});
