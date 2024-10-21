<?php
// Start session for cookies
session_start();

// Set necessary headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Verify that the request method is POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    $response = [
        'status' => 'Method not allowed',
        'message' => 'Method other than POST used, use POST instead',
    ];
    echo json_encode($response);
    exit();
}

// Get body of request
$data = json_decode(file_get_contents("php://input"));

// Extract follower and following usernames from request data
$follower_username = $data->follower ?? null;  // Assuming follower's username is sent in the request
$following_username = $data->following ?? null;  // Assuming following person's username is sent

if (!$follower_username || !$following_username) {
    http_response_code(400);
    $response = [
        'status' => 'Error',
        'message' => 'Missing follower or following username',
    ];
    echo json_encode($response);
    exit();
}

// Connect to the database
$mysqli = mysqli_connect('localhost', 'gffajard', '50462949', 'gffajard_db');
if (!($mysqli instanceof mysqli)) {
    http_response_code(500);
    $response = [
        'status' => 'Connection to database failed',
        'message' => 'Could not connect to the database',
    ];
    echo json_encode($response);
    exit();
}

// Check if a pending friend request already exists in either direction
$check_existing_stmt = $mysqli->prepare('SELECT * FROM followerPairing WHERE (follower = ? AND following = ? OR follower = ? AND following = ?) AND status = ?');
$check_existing_stmt->bind_param('sssss', $follower_username, $following_username, $following_username, $follower_username, $status_pending);
$check_existing_stmt->execute();
$check_existing_stmt->store_result();
$is_pending_request = $check_existing_stmt->num_rows > 0;

if ($is_pending_request) {
    http_response_code(400);
    $response = [
        'status' => 'Error',
        'message' => 'A pending friend request already exists',
    ];
    echo json_encode($response);
    exit();
}

// Insert a new friend request with status 'pending'
$status_pending = 'pending';
$insert_stmt = $mysqli->prepare('INSERT INTO followerPairing (follower, following, status) VALUES (?, ?, ?)');
$insert_stmt->bind_param('sss', $follower_username, $following_username, $status_pending);

if ($insert_stmt->execute()) {
    // If the insertion was successful, return a success response
    http_response_code(201);
    $response = [
        'status' => 'Success',
        'message' => 'Friend request sent',
    ];
    echo json_encode($response);
} else {
    // If there was an error in inserting the data
    http_response_code(500);
    $response = [
        'status' => 'Error',
        'message' => 'Error sending the friend request',
    ];
    echo json_encode($response);
}

// Close the statements and the database connection
$check_existing_stmt->close();
$insert_stmt->close();
$mysqli->close();