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

// Verify that the friends list is present
if (!($data->friends)) {
    http_response_code(400);
    $response = [
        'status' => 'Error',
        'message' => 'Incomplete request body, friends list required',
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

// Get Spotify display name from users
$spotify_names = [];
foreach($data->friends as $friend) {
    // Prepare query
    $select_display_name_stmt = $mysqli->prepare('SELECT spotify_name FROM users WHERE username = ?');
    $select_display_name_stmt->bind_param('s', $friend);
    
    // Execute query and bind result
    $select_display_name_stmt->execute();
    $select_display_name_stmt->store_result();
    $select_display_name_stmt->bind_result($spotify_name);
    $select_display_name_stmt->fetch();
    
    if($spotify_name !== NULL) {
        $spotify_names[] = $spotify_name;
    }
}

http_response_code(200);
$response = [
    'status' => 'Success',
    'display_name_exists' => $spotify_names,
];
echo json_encode($response);
mysqli_close($mysqli);
exit();
?>