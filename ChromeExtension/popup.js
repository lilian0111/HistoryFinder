/**
 * History Finder
 * IR final project
 * @author: wentsung
 */

// todo: ajax to using wget for craw webpage

// This is the main function for chrome extension
document.addEventListener('DOMContentLoaded', function() {
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
            // "CREATE TABLE IF NOT EXISTS girls (" +
            // VIRTUAL TABLE pages USING fts4
            // Create our girls table if it doesn't exist.
            transaction.executeSql(
                "CREATE VIRTUAL TABLE IF NOT EXISTS girls USING fts4(" +
                    "id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
                    "name TEXT NOT NULL" +
                ");"
            );
        }
    );

    // I save a girl.
    var saveGirl = function( name, callback ){
        // Insert a new girl.
        database.transaction(
            function( transaction ){
                // Insert a new girl with the given values.
                transaction.executeSql(
                    (
                        "INSERT INTO girls (" +
                            "name " +
                        " ) VALUES ( " +
                            "? " +
                        ");"
                    ),
                    [
                        name
                    ],
                    function( transaction, results ){
                        // Execute the success callback,
                        // passing back the newly created ID.
                        callback( results );
                    }
                );
            }
        );
    };

    // I get all the girls.
    var getGirls = function( callback ){
        // Get all the girls.
        database.transaction(
            function( transaction ){
                // Get all the girls in the table.
                transaction.executeSql(
                    (
                        "SELECT " +
                            "* " +
                        "FROM " +
                            "girls " +
                        "ORDER BY " +
                            "name ASC"
                    ),
                    [],
                    function( transaction, results ){
                        // Return the girls results set.
                        callback( results );
                    }
                );
            }
        );
    };

    // I refresh the girls list.
    var refreshGirls = function( results ){
        console.log(results);
        // Clear out the list of girls.
        // list.empty();

        // Check to see if we have any results.
        if (!results){
            return;
        }

        var totalList = '';
        // Loop over the current list of girls and add them
        // to the visual list.
        for (var key in results.rows) {
            totalList += "<li>" + results.rows.item(key).name + "</li>";
        }
        document.getElementById('sqliteResult').innerHTML = totalList;
        // $.each(
        //     results.rows,
        //     function( rowIndex ){
        //         var row = results.rows.item( rowIndex );

        //         // Append the list item.
        //         list.append( "<li>" + row.name + "</li>" );
        //     }
        // );
    };

    // I delete all the girls.
    var deleteGirls = function( callback ){
        // Get all the girls.
        database.transaction(
            function( transaction ){
                // Delete all the girls.
                transaction.executeSql(
                    (
                        "DELETE FROM " +
                            "girls "
                    ),
                    [],
                    function(){
                        // Execute the success callback.
                        callback();
                    }
                );
            }
        );
    };


    // show the result list
    var showResultFunction = function () {
        var resultURL = '';
        var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
        var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;
        saveGirl(
            document.getElementById('searchText').value,
            function () {
                getGirls(refreshGirls);
            }
        );
        chrome.history.search(
            {
                'text':document.getElementById('searchText').value,
                'startTime': oneWeekAgo
            },
            function (historyItems) {
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
        deleteGirls(refreshGirls);
    });
});
