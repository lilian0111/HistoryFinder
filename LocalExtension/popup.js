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
                for (var i = 0; i < historyItems.length; ++i) {
                    var url = historyItems[i].url;
                    console.log(url);
                    if(url.match(/facebook/)){
                        continue;
                    }
                    else if(url.match(/http:/)||url.match(/https:/)){
                        getUrlContent(historyItems[i].id,url);
                    }

                }
            }
        );
    };
    function getUrlContent(id,url){
        $.ajax({
            url:url,
            type: 'GET',
            success:function(msg){
                msg = html2text(msg);
                chrome.storage.sync.set({id:id,data:msg},function(){
                    console.log('save '+url+' in '+id);
                });
            }
        });
    }
    function html2text(html) {
        html = html.replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/ig, '');
        html = html.replace(/<noscript[^>]+?\/>|<noscript(.|\s)*?\/noscript>/ig, '');
        html = html.replace(/<style[^>]+?\/>|<style(.|\s)*?\/style>/ig, '');
        html = html.replace(/<.*?>/ig, '');
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
    getRecentHistory(10);
});