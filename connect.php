<?php
function connect($dbHost, $dbName, $dbUsername, $dbPassword) {
    $db = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
    if($db->connect_error) {
        die("Cannot connect to database: \n" . $db->connect_error . "\n" . $db->connect_errno);
    }
    return $db;
}
