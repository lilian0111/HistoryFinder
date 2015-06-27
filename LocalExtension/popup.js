document.addEventListener('DOMContentLoaded', function() {
    function getRecentHistory(maxResults) {
        var minisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
        var oneWeekAgo = (new Date).getTime() - minisecondsPerWeek;
        chrome.history.search(
            {
                'text': '',
                'startTime': oneWeekAgo,
                'maxResults': maxResults
            },
            function (historyItems) {
                console.log(historyItems);
                console.log(historyItems.length);
                for (var i = 0; i < historyItems.length; ++i) {
                    var url = historyItems[i].url;
                    if(url.match(/facebook/)||url.match(/fbcdn/)||url.match(/\.jpg/)||url.match(/\.png/)){
                        continue;
                    }
                    else if(url.match(/http:/) || url.match(/https:/)){
                        getUrlContent(historyItems[i]);
                    }
                }
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
                    console.log('save "' + item.title + '" in ' + item.id);
                });
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
    
    document.getElementById('indexButton').addEventListener('click', function() {
        chrome.storage.local.clear(function(){
            console.log('clear');
            getRecentHistory(500);
        });
    });
    
    document.getElementById('searchImage').addEventListener('click', function() {
        chrome.storage.local.get(searchHistory);
    });
    
    document.getElementById('searchText').addEventListener('keydown', function(e){
        code = (e.keyCode ? e.keyCode : e.which);
        // for Enter key
        if (code == 13){
            chrome.storage.local.get(searchHistory);
        }
    });
});
