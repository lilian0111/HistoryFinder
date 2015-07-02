// parse DOM structure to string
function DOMtoString(document_root) {
    var html = '';
    var node = document_root.firstChild;
    while (node) {
        if(node.nodeType == Node.ELEMENT_NODE){
            html += html2text(node.outerHTML);
        }
        node = node.nextSibling;
    }
    return html;
}

// send message back to Chrome extension
chrome.runtime.sendMessage(
    null, 
    {
        tabId: tabId, 
        text: DOMtoString(document)
    }, 
    null, 
    function(){}
);
