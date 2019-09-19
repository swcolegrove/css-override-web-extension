const debug = (msg) => {
  console.log(`css-override-web-extension: ${msg}`);
};

const getStorageData = (domainKey) => {
  return browser.storage.sync.get(domainKey);
};

const getTabUrl = (tab) => new URL(tab.url).hostname;

const toggleCSS = (tabId, enabled) => {
  if (enabled) {
    browser.tabs.insertCSS(tabId, {file: "resources/jira.css"});
  } else {
    browser.tabs.removeCSS(tabId, {file: "resources/jira.css"});
  }
};

const setTabStyle = (id, url) => {
  getStorageData(url).then((tabData) => {
    debug(JSON.stringify(tabData))
    if (tabData[url]) {
      const enabled = tabData[url].enabled;
      toggleCSS(id, enabled)
    }
  });
}

const initializeTabStyles = () => {
    const getAllTabs = browser.tabs.query({});
    getAllTabs.then((tabs) => {
    for (const tab of tabs) {
      const tabUrl = getTabUrl(tab);
      setTabStyle(tab.id, tabUrl)
    }
  });
}

const reloadTab = (tab) => {
  debug('Reloading tab');
  setTabStyle(tab.id, tab.url)
};

// Listen for actions passed from popup window
const eventListener = (request, sender, sendResponse) => {
  debug(`Event listener action ${request.action}`);
  if (request.action === 'reloadTab') {
    reloadTab(request.tab);
    sendResponse({response: true});
  }
}

const initializeExtension = () => {
  debug('Initializing extension');
  initializeTabStyles();

  browser.runtime.onMessage.addListener(eventListener);
  browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
    // Re apply styles if tab is updated (refresh)
    reloadTab({id, url: getTabUrl(tab)});
  });
};

initializeExtension();
