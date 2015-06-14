/**
 * History Finder
 * IR final project
 * @author: wentsung
 */

// show the result list
function showResultFunction() {
    var resultURL = '';
    chrome.history.search(
        {'text':document.getElementById('searchText').value},
        function(historyItems) {
            resultURL += '<ul>';
            // For each history item, get details on all visits.
            for (var i = 0; i < historyItems.length; ++i) {
                var url = historyItems[i].url;
                var title = historyItems[i].title;
                // console.log(title);
                // console.log(url);
                resultURL += '<li>';
                resultURL += '<a href="' + url + '" target="_blank">' + title + '</a>';
                resultURL += '</li>';
            }
            resultURL += '</ul>';
            document.getElementById('showResult').innerHTML = document.getElementById('searchText').value + resultURL;
        }
    );
}

// This is the main function for chrome extension
document.addEventListener('DOMContentLoaded', function() {
    // on the text input, add an enter key to submit query keyword
    document.getElementById('searchText').addEventListener('keydown', function(e){
        code = (e.keyCode ? e.keyCode : e.which);
        // for Enter key
        if (code == 13) {
            showResultFunction();
        }
    });
    // send query kerword and show the result
    document.getElementById('searchImage').addEventListener('click', function() {
        showResultFunction();
    });
});
