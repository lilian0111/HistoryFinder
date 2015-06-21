<?php
/**
 * @author: wentsung
 */
session_start();
include_once('../sbir/bin/connect.php');

$userid = $_POST['userid'];
$historyItems = json_decode($_POST['historyItems'], true);


$urlArray = array();
foreach ($historyItems as $key => $value) {
    $urlArray[] = $value['url'];
}

$contextArray = async_get_url($urlArray);


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
        $ins_data["visitCount"] = $adodb->Quote($value['visitCount']);

        $sql  = " Insert Into historyFinder ( ";
        $sql .= implode(", ", array_keys($ins_data));
        $sql .= ") Values ( ";
        $sql .= implode(", ", array_values($ins_data))." )";
        $rs = $adodb->Execute($sql);
    }
}
// echo '</pre>';

include_once('../sbir/bin/disconnect.php');

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
