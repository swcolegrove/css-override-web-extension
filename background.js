const debug = (msg) => {
  console.log(`css-override-web-extension: ${msg}`);
};

const getStorageData = (domainKey) => {
  return browser.storage.sync.get(domainKey);
};

const initializeTabStyles = () => {
    const getAllTabs = browser.tabs.query({});
    getAllTabs.then((tabs) => {
    for (const tab of tabs) {
      const tabUrl = new URL(tab.url).hostname;
      getStorageData(tabUrl).then((tabData) => {
        debug(JSON.stringify(tabData))
        if (tabData[tabUrl] && tabData[tabUrl].enabled) {
          debug(`Applying custom styles to ${tabUrl}`);
          browser.tabs.insertCSS(tab.id, {file: "resources/jira.css"});
        }
      });
    }
  });
}

const initializeExtension = () => {
  debug('Initializing extension');
  initializeTabStyles();
};

initializeExtension();
