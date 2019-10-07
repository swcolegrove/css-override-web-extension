let ACTIVE_TAB;

const debug = (msg) => {
  console.log(`css-override-web-extension: ${msg}`); // eslint-disable-line
};

const getTabUrl = (tab) => new URL(tab.url).hostname;

const getActiveTab = () => browser.tabs.query({ active: true, currentWindow: true })
  .then((tabs) => tabs[0]);


const getStorageData = (domainKey) => browser.storage.sync.get(domainKey)
  .then((data) => data);

const setStorageData = (obj) => browser.storage.sync.set(obj).then(() => true, () => false);

const updatePopup = (stylesEnabled) => {
  const btnToggle = document.getElementById('btnToggle');
  btnToggle.innerHTML = stylesEnabled ? 'ON' : 'OFF';
  if (stylesEnabled) {
    btnToggle.classList.remove('neutral');
  } else {
    btnToggle.classList.add('neutral');
  }
};

const addSiteToStorage = async (tabUrl, enabled = true) => {
  debug('Applying styles to site for first time');
  const obj = {};
  obj[tabUrl] = {
    enabled,
    style: '',
  };
  await setStorageData(obj);
};

const toggleStyles = async () => {
  debug('Toggle style');
  const tabUrl = getTabUrl(ACTIVE_TAB);
  if (!tabUrl) {
    return;
  }

  const tabData = await getStorageData(tabUrl);
  let enabled = true;
  if (tabData && tabData[tabUrl]) {
    tabData[tabUrl].enabled = !tabData[tabUrl].enabled;
    enabled = tabData[tabUrl].enabled;
    await setStorageData(tabData);
  } else {
    addSiteToStorage(tabUrl);
  }

  browser.runtime.sendMessage({
    action: 'reloadTab',
    tab: {
      id: ACTIVE_TAB.id,
      url: tabUrl,
    },
  }).then(() => {
    updatePopup(enabled);
  });
};

const initializePopup = async () => {
  ACTIVE_TAB = await getActiveTab();
  const tabUrl = getTabUrl(ACTIVE_TAB);

  const tabData = await getStorageData(tabUrl);
  if (tabData && tabData[tabUrl]) {
    updatePopup(tabData[tabUrl].enabled);
  } else {
    updatePopup(false);
  }
};

const openEditorWindow = async () => {
  const tabUrl = getTabUrl(ACTIVE_TAB);
  const page = '../pages/editor.html';
  const url = tabUrl ? `${page}?siteId=${tabUrl}` : page;
  const createData = {
    url,
    active: true,
  };

  const tabData = await getStorageData(tabUrl);
  if (!tabData || !tabData[tabUrl]) {
    await addSiteToStorage(tabUrl, false);
  }

  browser.tabs.create(createData).then(() => {
    // debug(JSON.stringify(tab))
    // const msg = {
    //   url: getTabUrl(ACTIVE_TAB),
    // };
    // browser.tabs.sendMessage(tab.id, msg);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const btnToggle = document.getElementById('btnToggle');
  btnToggle.addEventListener('click', toggleStyles);

  const btnOpenEditor = document.getElementById('btnOpenEditor');
  btnOpenEditor.addEventListener('click', openEditorWindow);
  initializePopup();
});
