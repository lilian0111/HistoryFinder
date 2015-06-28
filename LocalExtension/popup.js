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
                    url: item.url,
                    visitCount: item.visitCount,
                    lastVisitTime: item.lastVisitTime,
                    text: html2text(msg).substring(0,3000)
                };
                chrome.storage.local.set(entry, function(){
                    checkHistoryCounter();
                    console.log('save "' + item.title + '" in ' + item.id);
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
    
    // convert html to text
    function html2text(html) {
        html = html.replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/ig, '');
        html = html.replace(/<noscript[^>]+?\/>|<noscript(.|\s)*?\/noscript>/ig, '');
        html = html.replace(/<style[^>]+?\/>|<style(.|\s)*?\/style>/ig, '');
        html = html.replace(/<(\?)label>/ig, '');
        html = html.replace(/<\!--(.|\s)*?-->/ig, '');
        html = html.replace(/<(.|\s)*?>/ig, '');
        html = html.replace(/['"\\]/ig, '');
        html = html.replace(/&(quot|#34);/ig, '');
        html = html.replace(/&(amp|#38);/ig, '');
        html = html.replace(/&(lt|#60);/ig, '');
        html = html.replace(/&(gt|#62);/ig, '');
        html = html.replace(/&(nbsp|#160);/ig, '');
        html = html.replace(/&(iexcl|#161);/ig, '');
        html = html.replace(/&(cent|#162);/ig, '');
        html = html.replace(/&(pound|#163);/ig, '');
        html = html.replace(/&(copy|#169);/ig, '');
        html = html.replace(/&(reg|#174);/ig, '');
        html = html.replace(/&#(d+);/, '');
        html = html.replace(/\s+/ig, ' ');

        return html;
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

