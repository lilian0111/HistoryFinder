<?php
/**
 * @author: wentsung
 */
session_start();
include_once('../sbir/bin/connect.php');

$userid = $_POST['userid'];
$searchText = $_POST['searchText'];

$html = "";
$html .= "MySQL result for " . $searchText . '<br>';

$sql = "select url, title from historyFinder ";
$sql .= " where userid = " . $adodb->Quote($userid);
$sql .= " and (title like " . $adodb->Quote('%' . $searchText . '%');
$sql .= " or text like " . $adodb->Quote('%' . $searchText . '%');
$sql .= " ) order by visitCount desc, lastVisitTime desc";

// $html .= $sql . '<br>';
$rs = $adodb->Execute($sql);
if ($rs && !$rs->EOF) {
    $html .= '<ul>';
    while ($rs && !$rs->EOF) {
        $tmp_url = trim($rs->fields[0]);
        $tmp_title = trim($rs->fields[1]);
        if (!empty($tmp_title)) {
            $html .= '<li>';
            $html .= '<a href="'.$tmp_url.'">' . $tmp_title . '</a>';
            $html .= '</li>';
        }
        $rs->MoveNext();
    }
    $html .= '</ul>';
}

$html .= '<br>';

print $html;
include_once('../sbir/bin/disconnect.php');
