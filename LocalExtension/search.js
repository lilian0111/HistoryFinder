// arguments
var OKAPI_K = 1.5;
var OKAPI_B = 0.8;

var WEIGHT_TITLE = 1;
var WEIGHT_TEXT  = 1;
var WEIGHT_URL   = 1;

// functions
function countSubString(string, substring){
    var len = substring.length, count = 0, pos = 0;
    while(true){
        pos = string.indexOf(substring, pos);
        if(pos >= 0){
            count++;
            pos += len;
        }
        else
            break;
    }
    return count;
}

function calTermFreq(tfValue, docLength, reciAvgDocLength){
    return ((OKAPI_K + 1) * tfValue) / (tfValue + OKAPI_K * (1 - OKAPI_B + OKAPI_B * docLength * reciAvgDocLength));
}

function calInverseDocFreq(dfValue, docNum){
    return (dfValue == 0)? (0) : (Math.log(docNum / dfValue));
}

function extensionSearch(msg, searchText){
    var resultURL = '<ul>';
    var historyRank = [];
    var docTermCount = {};
    var docNum = 0;
    var reciAvgDocLength = {
        titleLen: 0,
        textLen:  0,
        urlLen:   0
    };
    var docFreq = {
        title: new Array(searchText.length),
        text:  new Array(searchText.length),
        url:   new Array(searchText.length)
    };
    for(var i = 0; i < searchText.length; i++){
        docFreq.title[i] = 0;
        docFreq.text[i]  = 0;
        docFreq.url[i]   = 0;
    }
    
    for(var i in msg){
        // calculate document number
        docNum++;
        
        // calculate document length
        reciAvgDocLength.titleLen += msg[i].title.length;
        reciAvgDocLength.textLen  += msg[i].text.length;
        reciAvgDocLength.urlLen   += msg[i].url.length;
        
        for(var j = 0; j < searchText.length; j++){
            // calculate term frequency
            var titleCount = countSubString(msg[i].title, searchText[j]);
            var textCount  = countSubString(msg[i].text, searchText[j]);
            var urlCount   = countSubString(msg[i].url, searchText[j]);
            docTermCount[msg[i].id] = [];
            docTermCount[msg[i].id].push({
                titleCount: titleCount,
                textCount:  textCount,
                urlCount:   urlCount
            });
            
            // calculate document frequency
            if(titleCount > 0)
                docFreq.title[j]++;
            if(textCount > 0)
                docFreq.text[j]++;
            if(urlCount > 0)
                docFreq.url[j]++;
        }
    }
    
    // calculate document frequency
    for(var i = 0; i < searchText.length; i++){
        docFreq.title[i] = calInverseDocFreq(docFreq.title[i], docNum);
        docFreq.text[i]  = calInverseDocFreq(docFreq.text[i], docNum);
        docFreq.url[i]   = calInverseDocFreq(docFreq.url[i], docNum);
    }
    
    // calculate reciprocal average document length
    for(var i in reciAvgDocLength){
        if(reciAvgDocLength[i] == 0)
            reciAvgDocLength[i] = 1;
    }
    reciAvgDocLength.titleLen = docNum / reciAvgDocLength.titleLen;
    reciAvgDocLength.textLen  = docNum / reciAvgDocLength.textLen;
    reciAvgDocLength.urlLen   = docNum / reciAvgDocLength.urlLen;
    
    // calculate rank
    for(var i in msg){
        var rank = 0;
        for(var j = 0; j < docTermCount[msg[i].id].length; j++){
            rank += calTermFreq(docTermCount[msg[i].id][j].titleCount, msg[i].title.length, reciAvgDocLength.titleLen) * docFreq.title[j] * WEIGHT_TITLE + 
                    calTermFreq(docTermCount[msg[i].id][j].textCount,  msg[i].text.length,  reciAvgDocLength.textLen)  * docFreq.text[j]  * WEIGHT_TEXT + 
                    calTermFreq(docTermCount[msg[i].id][j].urlCount,   msg[i].url.length,   reciAvgDocLength.urlLen)   * docFreq.url[j]   * WEIGHT_URL;
        }
        historyRank.push({
            id: msg[i].id, 
            rank: rank
        });
    }
    historyRank.sort(function(a, b){
        return (b.rank - a.rank);
    });
    
    // show result
    for(var i = 0; i < historyRank.length; i++){
        if(historyRank[i].rank <= 0)
            break;
        resultURL += '<li>';
        resultURL += '<a href="' + msg[historyRank[i].id].url + '" target="_blank">' + msg[historyRank[i].id].title + '</a>' + ' ' + historyRank[i].rank;
        resultURL += '</li>';
    }
    resultURL += '</ul>';
    
    return resultURL;
}


function searchHistory(msg){
    var searchText = document.getElementById('searchText').value.split(/\s+/);
    for(var i = searchText.length - 1; i >= 0; i--){
        if(searchText[i].length == 0)
            searchText.splice(i, 1);
    }
    
    var resultURL = '';
    if(searchText.length > 0){
        resultURL = extensionSearch(msg, searchText);
    }
    
    var showHTML = "Chrome extension API for ";
    showHTML += document.getElementById('searchText').value;
    showHTML += resultURL;
    document.getElementById('showResult').innerHTML = showHTML;
}
