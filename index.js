var CONTEXT_MENU_FIELDS = {
    "id": "addScripts",
    "title": "Add scripts",
    "contexts": ["all"]
}
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
    if(changeInfo.status === 'complete'){
        chrome.storage.sync.get(null, function(data){
            if(data[tab.url] !== undefined){
                chrome.tabs.executeScript(tabID, {
                    code: data[tab.url]
                }, function(){
                    //alert('executing...');
                });
            }
        })
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