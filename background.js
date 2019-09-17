// const TITLE_APPLY = "Apply CSS";
// const TITLE_REMOVE = "Remove CSS";
// const APPLICABLE_PROTOCOLS = ["http:", "https:"];

/*
Toggle CSS: based on the current title, insert or remove the CSS.
Update the page action's title and icon to reflect its state.
*/
// function toggleCSS(tab) {
//   function gotTitle(title) {
//     if (title === TITLE_APPLY) {
//       // browser.pageAction.setIcon({tabId: tab.id, path: "icons/on.svg"});
//       // browser.pageAction.setTitle({tabId: tab.id, title: TITLE_REMOVE});
//       browser.tabs.insertCSS({file: "resources/jira.css"});
//     } else {
//       // browser.pageAction.setIcon({tabId: tab.id, path: "icons/off.svg"});
//       // browser.pageAction.setTitle({tabId: tab.id, title: TITLE_APPLY});
//       browser.tabs.removeCSS({file: "resources/jira.css"});
//     }
//   }

//   // var gettingTitle = browser.pageAction.getTitle({tabId: tab.id});
//   // gettingTitle.then(gotTitle);
// }


const debug = (msg) => {
  console.log(`css-override-web-extension: ${msg}`);
};

const getExtensionData = () => {
  return new Promise(resolve => {
    const getExtensionStorage = browser.storage.managed.get('sites');
    getExtensionStorage.then((res) => {
      resolve(res.sites);
    });
  });
};

const initializeTabStyles = async function(siteData) {
    const getAllTabs = browser.tabs.query({});
    getAllTabs.then((tabs) => {
    for (let tab of tabs) {
      const tabUrl = new URL(tab.url).hostname;
      if (siteData[tabUrl] && siteData[tabUrl].enabled) {
        debug(`Applying custom styles to ${tabUrl}`);
        browser.tabs.insertCSS(tab.id, {file: "resources/jira.css"});
      }
    }
  });
}

const initializeExtension = async function() {
  debug('Initializing extension');

  let siteData = await getExtensionData();
  await initializeTabStyles(siteData);
};

initializeExtension();
