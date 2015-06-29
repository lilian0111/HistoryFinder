document.addEventListener('DOMContentLoaded', function() {
    // set counter to check ending time
    var historyCounter = 0;
    
    // check whether to retrieve web pages or not
    function checkUrl(url){
        url = url.substring(url.length - 5).toLowerCase();
        if( (url.indexOf('.jpg') >= 0) || 
            (url.indexOf('.jpeg') >= 0) || 
            (url.indexOf('.png') >= 0) || 
            (url.indexOf('.gif') >= 0) || 
            (url.indexOf('.bmp') >= 0) ||
            (url.indexOf('.pdf') >= 0) )
            return false;
        return true;
    }
    
    // store to local storage
    function storeToLocal(item, text){
        var entry = {};
        entry[item.id] = {
            id: item.id,
            title: html2text(item.title),
            text: text,
            url: html2text(item.url),
            visitCount: item.visitCount,
            lastVisitTime: item.lastVisitTime,
            trueTitle: item.title,
            trueUrl: item.url
        };
        if(entry[item.id].trueTitle.length == 0)
            entry[item.id].trueTitle = entry[item.id].trueUrl;
        
        chrome.storage.local.set(entry, function(){
            checkHistoryCounter();
            console.log('save "' + entry[item.id].trueTitle + '" in ' + entry[item.id].id);
        });
    }
    
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
                    if(checkUrl(historyItems[i].url) == true)
                        getUrlContent(historyItems[i]);
                    else
                        storeToLocal(historyItems[i], '');
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
            dataType: 'html',
            timeout: 60000, // 60s
            headers: { 
                Accept : "text/plain; charset=utf-8",
            	    "Content-Type": "text/plain; charset=utf-8"
            },
            success: function(msg){
                storeToLocal(item, html2text(msg).substring(0,3000));
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
