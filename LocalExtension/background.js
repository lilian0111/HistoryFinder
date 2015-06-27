/**
 * History Finder
 * IR final project
 * @author: wentsung
 */

function storeToLocal(obj){
    chrome.storage.local.get(function(msg){
        var oldestVisitTime = obj.lastVisitTime, oldestHistory
        var historyNum = 0;
        var foundHistory = 0;
        for(var i in msg){
            historyNum++;
            if(msg[i].lastVisitTime < oldestVisitTime)
                oldestHistory = i;
            if(obj.id.localeCompare(msg[i].id) == 0){
                var entry = {};
                entry[obj.id] = obj;
                chrome.storage.local.set(entry, function(){});
                return;
            }
        }
        
        if(historyNum >= 500){
            chrome.storage.local.remove(i, function(){
                var entry = {};
                entry[obj.id] = obj;
                chrome.storage.local.set(entry, function(){});
            });
        }
        else{
            var entry = {};
            entry[obj.id] = obj;
            chrome.storage.local.set(entry, function(){});
        }
    });
}

chrome.webNavigation.onCompleted.addListener(function(details){
    chrome.tabs.executeScript(details.tabId, {
        code: "tabId = " + details.tabId + ";"
    }, function() {
        chrome.tabs.executeScript(details.tabId, {
            file: "getPagesContent.js"
        }, function() {
        });
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    chrome.tabs.get(request.tabId, function(tab){
        chrome.history.getVisits(
            {
                'url': tab.url,
            },
            function (visitItems) {
                var visitCount = 0, lastVisitTime = visitItems[0].visitTime;
                for(var i = 0; i < visitItems.length; i++){
                    visitCount++;
                    if(visitItems[i].visitTime > lastVisitTime)
                        lastVisitTime = visitItems[i].visitTime;
                }
                
                var obj = {
                    id: visitItems[0].id,
                    title: tab.title,
                    url: tab.url,
                    visitCount: visitCount,
                    lastVisitTime: lastVisitTime,
                    text: request.text
                }
                storeToLocal(obj);
            }
        );
    });
});