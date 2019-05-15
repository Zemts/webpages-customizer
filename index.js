var CONTEXT_MENU_FIELDS = {
    "id": "addScripts",
    "title": "Add scripts",
    "contexts": ["all"]
}
// current storage
var syncStorage = {};
// storage handlers and listeners
chrome.storage.sync.get(null, function(data){
    syncStorage = data;
});
chrome.storage.onChanged.addListener(function(changes, areaName){
    if(areaName === 'sync'){
        for(var key in changes){
            if(!changes.hasOwnProperty(key)){
                continue;
            }
            if(syncStorage[key]){
                syncStorage[key] = changes[key].newValue;
            }
        }
    }
});
// initialization
chrome.runtime.onInstalled.addListener(function(){
    chrome.contextMenus.create(CONTEXT_MENU_FIELDS);
    chrome.declarativeContent.onPageChanged.removeRules(
        undefined,
        function(){
            chrome.declarativeContent.onPageChanged.addRules([
                {
                    conditions: [
                        new chrome.declarativeContent.PageStateMatcher({
                            pageUrl: {
                                schemes: ["http", "https"]
                            },
                        })
                    ],
                    actions: [
                        new chrome.declarativeContent.ShowPageAction()
                    ]
                }
            ]);
        }
    );
});
// context menus
chrome.contextMenus.onClicked.addListener(function(itemData){
    if(itemData.menuItemId == CONTEXT_MENU_FIELDS.id){
        alert("Place for opening app(extension) for adding scripts");
    }
});

chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab){
    if(changeInfo.status === 'loading' && syncStorage[tab.url]){
        chrome.tabs.executeScript(tabID, {
            code: syncStorage[tab.url].code,
            runAt: syncStorage[tab.url].runAt
        });
    }
});
/*
chrome.tabs.onActivated.addListener(function(activeInfo){
    chrome.tabs.get(activeInfo.tabId, function(tab){
        chrome.storage.sync.set({
            mydata: tab.url
        })
    });
});

chrome.storage.onChanged.addListener(function(){

});
*/