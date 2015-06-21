<?php
/**
 * @author: wentsung
 */
session_start();
include_once('../sbir/bin/connect.php');

$userid = $_POST['userid'];

$sql = "Select username from historyUser where userid = " . $adodb->Quote($userid);
$username = $adodb->GetOne($sql);

if (!empty($username)) {
    echo $username;
} else {
    echo "error";
}

include_once('../sbir/bin/disconnect.php');