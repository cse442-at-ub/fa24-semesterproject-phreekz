<?php
session_start();

// Checks CSRF Token to see if the token is modified
$csrfToken = $_COOKIE['csrf_token'] ?? '';
if ($csrfToken !== $_SESSION['csrf_token']) {
    http_response_code(406); // Forbidden
    echo json_encode(["error" => "Invalid CSRF token"]);
    exit();
}

// If CSRF token is valid, return success
echo json_encode(["success" => true]);
?>
