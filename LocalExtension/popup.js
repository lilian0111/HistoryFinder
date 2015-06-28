document.addEventListener('DOMContentLoaded', function() {
    // set counter to check real ending time
    var historyCounter = 0;
    var historyLength = 0;

    function getRecentHistory(maxResults) {
        var minisecondsPerYear = 1000 * 60 * 60 * 24 * 365;
        var oneYearAgo = (new Date).getTime() - minisecondsPerYear;
        chrome.history.search(
            {
                'text': '',
                'startTime': oneYearAgo,
                'maxResults': maxResults
            },
            function (historyItems) {
                console.log(historyItems);
                console.log(historyItems.length);
                historyLength = historyItems.length;
                for (var i = 0; i < historyItems.length; ++i) {
                    var url = historyItems[i].url;
                    if(url.match(/facebook/)||url.match(/fbcdn/)||url.match(/phpmyadmin/)||url.match(/\.jpg/)||url.match(/\.png/)){
                        historyCounter++;
                        console.log(historyCounter);
                        continue;
                    }
                    else if(url.match(/http:/) || url.match(/https:/)){
                        getUrlContent(historyItems[i]);
                    } else {
                        historyCounter++;
                        console.log(historyCounter);
                    }
                }
                // change progess bar to index button
                // document.getElementById('indexArea').innerHTML = '<input type="button" value="index" id="indexButton"/>';
                // addIndexListener();
            }
        );
    };

    function getUrlContent(item){
        $.ajax({
            url: item.url,
            type: 'GET',
            async: true,
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
                    historyCounter++;
                    console.log(historyCounter);
                    if (historyCounter == historyLength) {
                        // change progess bar to index button
                        document.getElementById('indexArea').innerHTML = '<input type="button" value="index" id="indexButton"/>';
                        addIndexListener();
                    }
                    console.log('save "' + item.title + '" in ' + item.id);
                });
            },
            error: function() {
                historyCounter++;
                console.log(historyCounter);
            }
        });
    }

    function html2text(html) {
        html = html.replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/ig, '');
        html = html.replace(/<noscript[^>]+?\/>|<noscript(.|\s)*?\/noscript>/ig, '');
        html = html.replace(/<style[^>]+?\/>|<style(.|\s)*?\/style>/ig, '');
        html = html.replace(/<(\?)label>/ig, '');
        html = html.replace(/<\!--(.|\s)*?-->/ig, '');
        html = html.replace(/<(.|\s)*?>/ig, '');
        html = html.replace(/['"\\]/ig, '');
        html = html.replace(/\s+/ig, ' ');
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

        return html;
    }

    // for indexing button
    var addIndexListener = function () {
        document.getElementById('indexButton').addEventListener('click', function() {
            document.getElementById('indexArea').innerHTML = '<img src="progress_bar.gif">';
            chrome.storage.local.clear(function(){
                console.log('clear');
                getRecentHistory(500);
            });
        });
    };
    addIndexListener();
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
    // reset all
    document.getElementById('refreshImage').addEventListener('click', function() {
        chrome.storage.local.clear(function(){
            console.log('clear all');
        });
    });
});
