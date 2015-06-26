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
                        return;
                    }
                    else if(url.match(/http:/)||url.match(/https:/)){
                    //url = "http://www.google.com.tw"
                        $.ajax({
                            url:url,
                            type: 'GET',
                            success:function(msg){
                                console.log('done '+url);
                                msg = msg.replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '');
                                msg = msg.replace(/<style[^>]+?\/>|<style(.|\s)*?\/style>/gi, '');
                                msg = msg.replace(/<(.|\s)*?>/g, '');
                                console.log(msg);
                            }
                        });
                    }

                }
            }
        );
    };
    getRecentHistory(10);
});