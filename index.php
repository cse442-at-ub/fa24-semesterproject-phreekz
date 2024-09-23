<?php
require_once 'config.php';
require_once 'connect.php';

$db = connect(DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD);

if($db instanceof mysqli) {
    echo "Client info: " . $db->client_info . "\n";
    echo "Client version: " . $db->client_version;
}