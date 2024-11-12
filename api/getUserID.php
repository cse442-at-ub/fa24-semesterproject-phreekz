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
if (!($data->username)) {
    http_response_code(400);
    $response = [
        'status' => 'Error',
        'message' => 'Incomplete request body, username required',
    ];
    echo json_encode($response);
    exit();
}

// Connect to the database
$mysqli = mysqli_connect('localhost', 'yichuanp', '50403467', 'yichuanp_db');

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

// Get Spotify display name from users
// Prepare query
$select_display_name_stmt = $mysqli->prepare('SELECT spotify_name FROM users WHERE username = ?');
$select_display_name_stmt->bind_param('s', $data->username);
$select_display_name_stmt->execute();
$select_display_name_stmt->store_result();
$select_display_name_stmt->bind_result($spotify_name);
$select_display_name_stmt->fetch();

// Check if the Spotify display name exists
if($spotify_name === NULL) {
    // Spotify display name does not exist
    http_response_code(200);
    $response = [
        'status' => 'Success',
        'display_name_exists' => false,
    ];
    echo json_encode($response);
    exit();
}

http_response_code(400);
$response = [
    'status' => 'Error',
    'message' => 'Spotify display name already exists',
];
echo json_encode($response);
mysqli_close($mysqli);
exit();
?>