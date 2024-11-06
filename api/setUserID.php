<?php
// Start session if needed
session_start();

// Set necessary headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

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

// Verify that the username is present
if (!($data->username && $data->spotify_id)) {
    http_response_code(400);
    $response = [
        'status' => 'Error',
        'message' => 'Incomplete request body, username and spotify ID required',
    ];
    echo json_encode($response);
    exit();
}

// Connect to the database
$mysqli = mysqli_connect('localhost', 'sadeedra', '50515928', 'sadeedra_db');

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
// Check if the Spotify display name already exists for the user
$check_stmt = $mysqli->prepare('SELECT spotify_name FROM users WHERE username = ?');
$check_stmt->bind_param('s', $data->username);
$check_stmt->execute();
$check_stmt->store_result();
$check_stmt->bind_result($existing_spotify_name);
$check_stmt->fetch();

if ($existing_spotify_name !== NULL) {
    http_response_code(200);
    $response = [
        'status' => 'Success',
        'message' => 'Spotify display name already exists',
    ];
    echo json_encode($response);
    exit();
}

// Insert the new Spotify display name
$insert_stmt = $mysqli->prepare('UPDATE users SET spotify_name = ? WHERE username = ?');
$insert_stmt->bind_param('ss', $data->spotify_id, $data->username);

if ($insert_stmt->execute()) {
    http_response_code(200);
    $response = [
        'status' => 'Success',
        'message' => 'Spotify display name set successfully',
    ];
} else {
    http_response_code(500);
    $response = [
        'status' => 'Error',
        'message' => 'Failed to set Spotify display name',
    ];
}

echo json_encode($response);
$mysqli->close();
exit();
?>