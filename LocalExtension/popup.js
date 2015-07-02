document.addEventListener('DOMContentLoaded', function() {
    // set counter to check ending time
    var historyCounter = 0,totalCounter = 0;
    var progressbar = $( "#progressbar" ),progressLabel = $( ".progress-label" );
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
                console.log('his len: ' + historyItems.length);
                historyCounter = 0;
                totalCounter = historyItems.length;
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
        historyCounter++;
        progressbar.progressbar( "value",  Math.floor(historyCounter*100/totalCounter));
        console.log(historyCounter);
        if (historyCounter == totalCounter) {
            showIndexButton();
        }
    }

    // for indexing button
    function showIndexButton(){
        progressbar.hide();
        //document.getElementById('indexArea').innerHTML = '<a class="round green" id="indexButton">Index First</a>';
		document.getElementById('indexArea').innerHTML = '<input type="button" value="index" id="indexButton"/>';
        document.getElementById('indexButton').addEventListener('click', function() {
            document.getElementById('indexArea').innerHTML = '';
            progressbar.show();
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

    
    progressbar.progressbar({
      value: 0,
      change: function() {
        progressLabel.text( progressbar.progressbar( "value" ) + "%" );
      },
      complete: function() {
        progressLabel.text( "Complete!" );
      }
    });
});
