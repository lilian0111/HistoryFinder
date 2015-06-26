document.addEventListener('DOMContentLoaded', function() {
    var getRecentHistory = function (maxResults) {
        var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
        var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;
        console.log(oneWeekAgo);
        chrome.history.search(
            {
                'text':'',
                'startTime': oneWeekAgo,
                'maxResults': maxResults
            },
            function (historyItems) {
                console.log(historyItems);
                console.log(historyItems.length);
                for (var i = 0; i < historyItems.length; ++i) {
                    var url = historyItems[i].url;
                    //console.log(url);
                    if(url.match(/facebook/)||url.match(/fbcdn/)){
                        continue;
                    }
                    else if(url.match(/http:/)||url.match(/https:/)){
                        getUrlContent(historyItems[i]);
                    }

                }
            }
        );
    };
    function getUrlContent(item){
        
        $.ajax({
            url:item.url,
            type: 'GET',
            async: false,
            success:function(msg){
                console.log(item.title)
                msg = html2text(msg);
                var test = JSON.stringify({
                    title:html2text(item.title),
                    url:item.url,
                    visitCount:item.visitCount,
                    lastVisitTime:item.lastVisitTime,
                    text: msg.substring(0,3000)
                });
                //console.log(test);
                var str = '{"'+item.id+'":'+test+'}';
                //console.log(str);
                var obj = JSON.parse(str);
                //console.log(obj);
                chrome.storage.local.set(obj,function(){
                    console.log('save '+item.url+' in '+item.id);
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
            getRecentHistory(10);
        });
    });
});