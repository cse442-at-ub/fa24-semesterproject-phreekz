<?php
// Start session if needed
session_start();

// Set necessary headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header("Content-Security-Policy: default-src 'self'; script-src 'self'");

// Checks CSRF Token to see if the token is modified
$csrfToken = $_COOKIE['csrf_token'] ?? '';
if ($csrfToken !== $_SESSION['csrf_token']) {
    http_response_code(406); // Forbidden
    echo json_encode(["error" => "Invalid CSRF token"]);
    exit();
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    $response = [
        'status' => 'Method not allowed',
        'message' => 'Method other than POST used, use POST instead',
    ];
    echo json_encode($response);
    exit();
}

// Get the body of the request
$data = json_decode(file_get_contents("php://input"));

// Verify that the username and email are present
if (!($data->username && $data->email)) {
    http_response_code(400);
    $response = [
        'status' => 'Error',
        'message' => 'Incomplete request body, username and email are required',
    ];
    echo json_encode($response);
    exit();
}

// Check if the session username matches the username in the request
if ($_SESSION['username'] !== $data->username) {
    http_response_code(403); // Forbidden
    $response = [
        'status' => 'Forbidden',
        'message' => 'Session username does not match the provided username',
    ];
    echo json_encode($response);
    exit();
}

// Connect to the database
$mysqli = mysqli_connect('localhost', 'slogin', '50474939', 'slogin_db');

if (!$mysqli) {
    die("Connection failed: " . mysqli_connect_error());
    http_response_code(500);
    $response = [
        'status' => 'Error',
        'message' => 'Database connection failed',
    ];
    echo json_encode($response);
    exit();
}

// Prepare and execute the UPDATE query to update profile data in the accountinfo table
$fullName = $data->fullName ?? '';
$gender = $data->gender ?? '';
$language = $data->language ?? '';
$country = $data->country ?? '';
$timeZone = $data->timeZone ?? '';
$email = $data->email; // Always provided

// Sanitize and validate input fields
$data->fullName = htmlspecialchars(trim($data->fullName), ENT_QUOTES, 'UTF-8');
$data->gender = htmlspecialchars(trim($data->gender), ENT_QUOTES, 'UTF-8');
$data->language = htmlspecialchars(trim($data->language), ENT_QUOTES, 'UTF-8');
$data->country = htmlspecialchars(trim($data->country), ENT_QUOTES, 'UTF-8');
$data->timeZone = htmlspecialchars(trim($data->timeZone), ENT_QUOTES, 'UTF-8');
$data->email = htmlspecialchars(trim($data->email), ENT_QUOTES, 'UTF-8');

// Update the profile in the accountinfo table
$updateSql = "UPDATE accountinfo 
              SET fullName = ?, gender = ?, language = ?, country = ?, timeZone = ?, email = ? 
              WHERE username = ?";

// Prepare the statement and bind all parameters as strings ('s')
$stmt = $mysqli->prepare($updateSql);

if ($stmt === false) {
    http_response_code(500);
    $response = [
        'status' => 'SQL Error',
        'message' => 'Failed to prepare SQL statement',
        'error' => $mysqli->error,
    ];
    echo json_encode($response);
    exit();
}

// Bind all parameters as strings (since they are all VARCHAR or TEXT)
$stmt->bind_param('sssssss', $fullName, $gender, $language, $country, $timeZone, $email, $data->username);

if ($stmt->execute()) {
    // Check if any rows were actually affected
    if ($stmt->affected_rows > 0) {
        http_response_code(200);
        $response = [
            'status' => 'Profile updated',
            'message' => 'User profile successfully updated',
        ];
        echo json_encode($response);
    } else {
        http_response_code(400);
        $response = [
            'status' => 'No changes',
            'message' => 'No profile information was changed or no matching username found',
        ];
        echo json_encode($response);
    }
} else {
    http_response_code(500);
    $response = [
        'status' => 'SQL Execution Failed',
        'message' => 'Failed to execute the SQL query',
        'error' => $stmt->error, // Capture the error
    ];
    echo json_encode($response);
}

$stmt->close();
mysqli_close($mysqli);
?>