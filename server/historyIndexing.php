<?php
/**
 * @author: wentsung
 */
session_start();
include_once('../sbir/bin/connect.php');
// require_once(__DIR__ . "/Html2Text.php");
// require_once(__DIR__ . "/Html2TextException.php");

$userid = $_POST['userid'];
$historyItems = json_decode($_POST['historyItems'], true);


$urlArray = array();
foreach ($historyItems as $key => $value) {
    $urlArray[] = $value['url'];
}

$sourceContextArray = async_get_url($urlArray);

$contextArray = array();
// prune html tag
foreach ($sourceContextArray as $value) {
    // $patterns = array();
    // $patterns[0] = '/<style(.|\n)*?<\/style>/';
    // $patterns[1] = '/<script(.|\n)*?<\/script>/';
    // $patterns[2] = '/<(.|\n)*>/';
    // $patterns[3] = '/\n/';
    // $replacements = array();
    // $replacements[0] = '';
    // $replacements[1] = '';
    // $replacements[2] = '';
    // $replacements[3] = '';
    // $contextArray[] = preg_replace($patterns, $replacements, $value);
    $contextArray[] = html2text($value);
    // $contextArray[] = convert_html_to_text($value);
}

foreach ($historyItems as $key => $value) {
    $sql = "Select urlid from historyFinder ";
    $sql .= " where urlid = " . $adodb->Quote($value['id']);
    $sql .= " and userid = " . $adodb->Quote($userid);
    if (!$adodb->GetOne($sql)) {
        $ins_data = array();
        $ins_data["userid"] = $adodb->Quote($userid);
        $ins_data["urlid"] = $adodb->Quote($value['id']);
        $ins_data["url"] = $adodb->Quote($value['url']);
        $ins_data["title"] = $adodb->Quote($value['title']);
        $ins_data["text"] = $adodb->Quote($contextArray[$key]);
        $ins_data["lastVisitTime"] = $adodb->Quote($value['lastVisitTime']);
        $ins_data["visitCount"] = $adodb->Quote($value['visitCount']);

        $sql  = " Insert Into historyFinder ( ";
        $sql .= implode(", ", array_keys($ins_data));
        $sql .= ") Values ( ";
        $sql .= implode(", ", array_values($ins_data))." )";
        $rs = $adodb->Execute($sql);
    } else {
        $up_data = array();

        $up_data["text"] = $adodb->Quote($contextArray[$key]);
        $up_data["lastVisitTime"] = $adodb->Quote($value['lastVisitTime']);
        $up_data["visitCount"] = $adodb->Quote($value['visitCount']);

        $comma = "";
        $sql = " Update historyFinder set ";
        foreach ($up_data as $up_key=>$up_val) {
            $sql .= $comma.$up_key." = ".$up_val;
            $comma =", ";
        }
        $sql .= " where urlid = " . $adodb->Quote($value['id']);
        $sql .= " and userid = " . $adodb->Quote($userid);
        $rs = $adodb->Execute($sql);
    }
}
// echo '</pre>';

include_once('../sbir/bin/disconnect.php');

// http://stackoverflow.com/questions/1884550/converting-html-to-plain-text-in-php-for-e-mail
function html2text($Document) {
    $Rules = array (
        '@<script[^>]*?>.*?</script>@si',
        '@<style[^>]*?>.*?</style>@si',
        '@<[\/\!]*?[^<>]*?>@si',
        '@([\r\n])[\s]+@',
        '@&(quot|#34);@i',
        '@&(amp|#38);@i',
        '@&(lt|#60);@i',
        '@&(gt|#62);@i',
        '@&(nbsp|#160);@i',
        '@&(iexcl|#161);@i',
        '@&(cent|#162);@i',
        '@&(pound|#163);@i',
        '@&(copy|#169);@i',
        '@&(reg|#174);@i',
        '@&#(d+);@e'
    );
    $Replace = array (
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
    );
    return preg_replace($Rules, $Replace, $Document);
}

// function convert_html_to_text($html) {
//     return Html2Text\Html2Text::convert($html);
// }

function async_get_url($url_array) {
    // http://blog.longwin.com.tw/2009/10/php-multi-thread-curl-2009/
    if (!is_array($url_array)) {
        return false;
    }

    $data    = array();
    $handle  = array();
    $running = 0;

    $mh = curl_multi_init(); // multi curl handler

    $i = 0;
    foreach ($url_array as $url) {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        curl_multi_add_handle($mh, $ch);

        $handle[$i++] = $ch;
    }


    do {
        curl_multi_exec($mh, $running);
        curl_multi_select($mh);
    } while ($running > 0);

    foreach ($handle as $i => $ch) {
        $content  = curl_multi_getcontent($ch);
        $data[$i] = (curl_errno($ch) == 0) ? $content : false;
    }

    foreach ($handle as $ch) {
        curl_multi_remove_handle($mh, $ch);
    }

    curl_multi_close($mh);

    return $data;
}
