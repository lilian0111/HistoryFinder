document.addEventListener('DOMContentLoaded', function() {
    // set counter to check ending time
    var historyCounter = 0;
    
    // use Chrome API to get recent history
    function getRecentHistory(maxResults) {
        chrome.history.search(
            {
                'text': '',
                'startTime': 0,
                'maxResults': maxResults
            },
            function (historyItems) {
                console.log(historyItems);
                console.log(historyItems.length);
                historyCounter = historyItems.length;
                for(var i = 0; i < historyItems.length; ++i){
                    getUrlContent(historyItems[i]);
                }
            }
        );
    };
    
    // use ajax to retrieve web pages
    function getUrlContent(item){
        $.ajax({
            url: item.url,
            type: 'GET',
            async: true,
            timeout: 60000, // 60s
            success: function(msg){
                var entry = {};
                entry[item.id] = {
                    id: item.id,
                    title: html2text(item.title),
                    text: html2text(msg).substring(0,3000),
                    url: html2text(item.url),
                    visitCount: item.visitCount,
                    lastVisitTime: item.lastVisitTime,
                    trueTitle: item.title,
                    trueUrl: item.url
                };
				if($.trim(entry[item.id].trueTitle) === "")
					entry[item.id].trueTitle = entry[item.id].text.substring(0,20);
                chrome.storage.local.set(entry, function(){
                    checkHistoryCounter();
                    console.log('save "' + item.trueTitle + '" in ' + item.id);
                });
            },
            error: function() {
                checkHistoryCounter();
            }
        });
    }

    // reduce counter value and check
    function checkHistoryCounter() {
        historyCounter--;
        console.log(historyCounter);
        if (historyCounter == 0) {
            showIndexButton();
        }
    }

    // for indexing button
    function showIndexButton(){
        document.getElementById('indexArea').innerHTML = '<input type="button" value="index" id="indexButton"/>';
        document.getElementById('indexButton').addEventListener('click', function() {
            document.getElementById('indexArea').innerHTML = '<img src="progress_bar.gif">';
            chrome.storage.local.clear(function(){
                console.log('clear');
                getRecentHistory(500);
            });
        });
    }
    showIndexButton();
    
    // send query kerword and show the result
    document.getElementById('searchImage').addEventListener('click', function() {
        chrome.storage.local.get(searchHistory);
    });
    
    // on the text input, add an enter key to submit query keyword
    document.getElementById('searchText').addEventListener('keydown', function(e){
        code = (e.keyCode ? e.keyCode : e.which);
        // for Enter key
        if (code == 13){
            chrome.storage.local.get(searchHistory);
        }
    });
    
    // clear all record
    document.getElementById('refreshImage').addEventListener('click', function() {
        chrome.storage.local.clear(function(){
            console.log('clear all');
        });
    });
});
