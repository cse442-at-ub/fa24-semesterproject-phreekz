<?php
session_start();

// Generate a new CSRF token every time this script is accessed
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

setcookie("csrf_token", $_SESSION['csrf_token'], [
    'expires' => time() + 3600, // 1-hour expiration
    'path' => '/',
    'httponly' => false, // False if accessible in JavaScript
    'samesite' => 'Lax' // Adjust as needed
]);

// Return the CSRF token to the client
echo json_encode(["csrf_token" => $_SESSION['csrf_token']]);
?>
