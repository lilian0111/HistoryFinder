// convert html to text
function html2text(html) {
    html = html.replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/ig, '');
    html = html.replace(/<noscript[^>]+?\/>|<noscript(.|\s)*?\/noscript>/ig, '');
    html = html.replace(/<style[^>]+?\/>|<style(.|\s)*?\/style>/ig, '');
    html = html.replace(/<(\?)label>/ig, '');
    html = html.replace(/<\!--(.|\s)*?-->/ig, '');
    html = html.replace(/<(.|\s)*?>/ig, '');
    html = html.replace(/['"\\]/ig, '');
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
    html = html.replace(/\s+/ig, ' ');
    
    return html.toLowerCase();
}
