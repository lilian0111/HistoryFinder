// listen to user clicking on extension button
chrome.browserAction.onClicked.addListener(function(activeTab){
    var newURL = chrome.extension.getURL('popup.html');
    chrome.tabs.create({ url: newURL });
});

// store history entry to local storage
function checkAndStore(obj){
    chrome.storage.local.get(function(msg){
        var oldestVisitTime = obj.lastVisitTime, oldestHistory;
        var historyNum = 0;
        var foundHistory = 0;
        var entry = {};
        entry[obj.id] = obj;
        
        for(var i in msg){
            historyNum++;
            if(msg[i].lastVisitTime < oldestVisitTime)
                oldestHistory = i;
            if(obj.id.localeCompare(msg[i].id) == 0){
                chrome.storage.local.set(entry, function(){});
                return;
            }
        }
        
        if(historyNum >= 500){
            chrome.storage.local.remove(i, function(){
                chrome.storage.local.set(entry, function(){});
            });
        }
        else{
            chrome.storage.local.set(entry, function(){});
        }
    });
}

// inject script to current web page
chrome.webNavigation.onDOMContentLoaded.addListener(function(details){
    chrome.tabs.executeScript(details.tabId, {
        code: 'tabId = ' + details.tabId + ';'
    }, function() {
        chrome.tabs.executeScript(details.tabId, {
            file: "html2text.js"
        }, function() {
            chrome.tabs.executeScript(details.tabId, {
                file: "getPagesContent.js"
            }, function() {
            });
        });
    });
});

// listen to message sent from injected script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    chrome.tabs.get(request.tabId, function(tab){
        chrome.history.getVisits(
            {
                'url': tab.url,
            },
            function (visitItems) {
                if(visitItems.length == 0){
                    return;
                }
                
                var obj = {
                    id: visitItems[0].id,
                    title: html2text(tab.title),
                    text: request.text,
                    url: html2text(tab.url),
                    visitCount: visitItems.length,
                    lastVisitTime: (new Date).getTime(),
                    trueTitle: tab.title,
                    trueUrl: tab.url
                }
                checkAndStore(obj);
            }
        );
    });
});
