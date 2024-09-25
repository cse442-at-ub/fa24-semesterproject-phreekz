<?php
const DB_HOST = 'localhost';
const DB_NAME = 'slogin_db';
const DB_USERNAME = 'slogin';
const DB_PASSWORD = ''; // person number

$db = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);

if($db->connect_error) {
    die("Cannot connect to database: \n" . $db->connect_error . "\n" . $db->connect_errno);
}
    
if($db instanceof mysqli) {
    echo "Client info: " . $db->client_info . "\n";
    echo "Client version: " . $db->client_version;
}