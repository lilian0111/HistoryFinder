/**
 * History Finder
 * IR final project
 * @author: wentsung
 */

// http://stackoverflow.com/questions/8567114/how-to-make-an-ajax-call-without-jquery
var ajax = {};
ajax.x = function() {
    if (typeof XMLHttpRequest !== 'undefined') {
        return new XMLHttpRequest();
    }
    var versions = [
        "MSXML2.XmlHttp.5.0",
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0",
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"
    ];

    var xhr;
    for(var i = 0; i < versions.length; i++) {
        try {
            xhr = new ActiveXObject(versions[i]);
            break;
        } catch (e) {
        }
    }
    return xhr;
};

ajax.send = function(url, callback, method, data, sync) {
    var x = ajax.x();
    x.open(method, url, sync);
    x.onreadystatechange = function() {
        if (x.readyState == 4) {
            callback(x.responseText)
        }
    };
    if (method == 'POST') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.send(data)
};

ajax.get = function(url, data, callback, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url + '?' + query.join('&'), callback, 'GET', null, sync)
};

ajax.post = function(url, data, callback, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, callback, 'POST', query.join('&'), sync)
};

// http://cwestblog.com/2011/07/25/javascript-string-prototype-replaceall/
String.prototype.replaceAll = function(target, replacement) {
  return this.split(target).join(replacement);
};

// This is the main function for chrome extension
document.addEventListener('DOMContentLoaded', function() {
    var userid = "";
    var username = "";
    //http://www.bennadel.com/blog/1940-my-safari-browser-sqlite-database-hello-world-example.htm
    var databaseOptions = {
        fileName: "sqliteHistoryFinder",
        version: "1.0",
        displayName: "History Finder using SQLite",
        maxSize: 1024
    };

    var database = openDatabase(
        databaseOptions.fileName,
        databaseOptions.version,
        databaseOptions.displayName,
        databaseOptions.maxSize
    );

    database.transaction (
        function (transaction) {
            transaction.executeSql(
                "CREATE TABLE IF NOT EXISTS historyUser (" +
                    "userid INTEGER NOT NULL PRIMARY KEY," +
                    "username TEXT NOT NULL" +
                ");"
            );
        }
    );

    // check userid
    database.transaction(
        function (transaction) {
            transaction.executeSql(
                ("SELECT * FROM historyUser"),
                [],
                function (transaction, results) {
                    if (results.rows.length) {
                        for (var key in results.rows) {
                            userid = results.rows.item(key).userid;
                            username = results.rows.item(key).username;
                        }
                        document.getElementById('indexArea').innerHTML = "Hello, " + username;
                    }
                }
            );
        }
    );

    // save userid
    var saveUserid = function(username) {
        database.transaction(
            function(transaction) {
                // Insert a new historyUser with the given values.
                transaction.executeSql(
                    ("INSERT INTO historyUser (userid, username) VALUES (?, ?);"),
                    [userid, username],
                    function (transaction, results) {
                        document.getElementById('indexArea').innerHTML = "Hello, " + username;
                    }
                );
            }
        );
    };

    // delete userid
    var deleteUserid = function() {
        database.transaction(
            function(transaction) {
                // Delete all the historyUser.
                transaction.executeSql(
                    ("DELETE FROM historyUser"),
                    [],
                    function() {
                    }
                );
            }
        );
    };


    // show the result list
    var showResultFunction = function () {
        // for ajax search result
        var searchText = document.getElementById('searchText').value;
        ajax.post('http://cml18.csie.ntu.edu.tw/~wentsung/webMining/historyFinder.php', {"searchText":searchText, "userid":userid}, function(response) {
            document.getElementById('ajaxResult').innerHTML = response;
        });

        // for chrome API result
        var resultURL = '';
        var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
        var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;

        chrome.history.search(
            {
                'text':document.getElementById('searchText').value,
                'startTime': oneWeekAgo
            },
            function (historyItems) {
                resultURL += '<ul>';
                // For each history item, get details on all visits.
                for (var i = 0; i < historyItems.length; ++i) {
                    var id = historyItems[i].id;
                    var url = historyItems[i].url;
                    var title = historyItems[i].title;
                    var visitCount = historyItems[i].visitCount;

                    resultURL += '<li>';
                    resultURL += '<a href="' + url + '" target="_blank">' + title + '</a>';
                    resultURL += '</li>';
                }
                resultURL += '</ul>';
                var showHTML = "Chrome extension API for ";
                showHTML += document.getElementById('searchText').value;
                showHTML += resultURL;
                document.getElementById('showResult').innerHTML = showHTML;
            }
        );
    }


    // for indexing button
    document.getElementById('indexButton').addEventListener('click', function() {
        deleteUserid();
        userid = document.getElementById('userid').value;
        console.log(userid);
        document.getElementById('indexArea').innerHTML = '<img src="progress_bar.gif">';
        ajax.post('http://cml18.csie.ntu.edu.tw/~wentsung/webMining/historyUserChecker.php', {"userid":userid}, function(response) {
            console.log(response);
            if ('error' != response) {
                username = response;
                var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
                var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;
                console.log(oneWeekAgo);
                chrome.history.search(
                    {
                        'text':'',
                        'startTime': oneWeekAgo,
                        'maxResults':500
                    },
                    function (historyItems) {
                        var jsonHistoryItems = '[';
                        // For each history item, get details on all visits.
                        for (var i = 0; i < historyItems.length; ++i) {
                            var id = historyItems[i].id;
                            var url = historyItems[i].url;
                            var title = historyItems[i].title;
                            var visitCount = historyItems[i].visitCount;
                            if (i != 0) {
                                jsonHistoryItems += ',';
                            }
                            jsonHistoryItems += '{"id":"' + id + '",';
                            jsonHistoryItems += '"url":"' + url + '",';
                            jsonHistoryItems += '"title":"' + title.replaceAll("\'", "").replaceAll("\"", "").replaceAll("\\", "") + '",';
                            jsonHistoryItems += '"visitCount":"' + visitCount + '"}';
                        }
                        jsonHistoryItems += ']';
                        console.log(jsonHistoryItems);
                        // ajax part
                        ajax.post('http://cml18.csie.ntu.edu.tw/~wentsung/webMining/historyIndexing.php', {"historyItems":jsonHistoryItems, "userid":userid}, function(response) {
                            saveUserid(username);
                        });
                    }
                );
            } else {
                document.getElementById('indexArea').innerHTML = "This is wrong userid, " + userid;
            }
        });
    });

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
    // reset all
    document.getElementById('refreshImage').addEventListener('click', function() {
        deleteUserid();
        database.transaction (
            function (transaction) {
                transaction.executeSql("DROP TABLE IF EXISTS historyUser");
            }
        );
    });
});
