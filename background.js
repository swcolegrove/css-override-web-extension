const debug = (msg) => {
  console.log(`css-override-web-extension: ${msg}`); // eslint-disable-line
};

const getStorageData = (domainKey) => browser.storage.sync.get(domainKey);

const getTabUrl = (tab) => new URL(tab.url).hostname;

const toggleCSS = (tabId, enabled, style) => {
  if (enabled) {
    browser.tabs.insertCSS(tabId, { code: style });
  } else {
    browser.tabs.removeCSS(tabId, { code: style });
  }
};

const setTabStyle = (id, url) => {
  getStorageData(url).then((tabData) => {
    debug(JSON.stringify(tabData));
    if (tabData[url]) {
      const { enabled } = tabData[url];
      toggleCSS(id, enabled, tabData[url].style);
    }
  });
};

const initializeTabStyles = () => {
  const getAllTabs = browser.tabs.query({});
  getAllTabs.then((tabs) => {
  /* eslint-disable no-restricted-syntax */
    for (const tab of tabs) {
      const tabUrl = getTabUrl(tab);
      setTabStyle(tab.id, tabUrl);
    }
  /* eslint-enable no-restricted-syntax */
  });
};

const reloadTab = (tab) => {
  debug('Reloading tab');
  setTabStyle(tab.id, tab.url);
};

const tabStyleChanged = (urlToUpdate) => {
  const getAllTabs = browser.tabs.query({});
  getAllTabs.then((tabs) => {
    /* eslint-disable no-restricted-syntax */
    for (const tab of tabs) {
      const tabUrl = getTabUrl(tab);
      if (tabUrl === urlToUpdate) {
        browser.tabs.reload(tab.id);
      }
    }
    /* eslint-enable no-restricted-syntax */
  });
};

// Listen for actions passed from popup window
const eventListener = (request, sender, sendResponse) => {
  debug(`Event listener action ${request.action}`);
  if (request.action === 'reloadTab') {
    reloadTab(request.tab);
    sendResponse({ response: true });
  } else if (request.action === 'updateStyle') {
    // if styles for a url changed - update all its tabs
    tabStyleChanged(request.tabUrl);
  }
};

const initializeExtension = () => {
  debug('Initializing extension');
  initializeTabStyles();

  browser.runtime.onMessage.addListener(eventListener);
  browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
    // Re apply styles if tab is updated (refresh)
    reloadTab({ id, url: getTabUrl(tab) });
  });
};

initializeExtension();
