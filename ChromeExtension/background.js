/**
 * History Finder
 * IR final project
 * @author: wentsung
 */

chrome.webNavigation.onCompleted.addListener(function(details) {
    chrome.tabs.executeScript(null, {
        file: "getPagesSource.js"
    }, function() {
        if (chrome.extension.lastError) {
        }
    });
});

chrome.extension.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
        console.log(request.source);
        var urlid;
        chrome.tabs.getSelected(null, function(tab){
            chrome.history.getVisits(
                {
                    'url': tab.url,
                },
                function (visitItems) {
                    urlid = visitItems[0].id;
                    visitTime = visitItems[0].visitTime;
                    console.log(urlid);
                    console.log(visitTime);
                }
            );
        });
    }
});
