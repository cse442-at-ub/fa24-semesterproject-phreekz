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

// Check if the user they want to follow exists in the users table
$check_user_stmt = $mysqli->prepare('SELECT * FROM users WHERE username = ?');
$check_user_stmt->bind_param('s', $following_username);
$check_user_stmt->execute();
$check_user_stmt->store_result();
$user_exists = $check_user_stmt->num_rows > 0;

if (!$user_exists) {
    http_response_code(404);
    $response = [
        'status' => 'User not found',
        'message' => 'The user you are trying to follow does not exist',
    ];
    echo json_encode($response);
    exit();
}

// Check if the user is already following the other user
$check_following_stmt = $mysqli->prepare('SELECT * FROM followerPairing WHERE follower = ? AND following = ?');
$check_following_stmt->bind_param('ss', $follower_username, $following_username);
$check_following_stmt->execute();
$check_following_stmt->store_result();
$is_already_following = $check_following_stmt->num_rows > 0;

if ($is_already_following) {
    http_response_code(400);
    $response = [
        'status' => 'Already following',
        'message' => 'The user is already following this person',
    ];
    echo json_encode($response);
    exit();
}

// Add the new follow relationship to the database
$add_user_stmt = $mysqli->prepare('INSERT INTO followerPairing (follower, following) VALUES (?, ?)');
$add_user_stmt->bind_param('ss', $follower_username, $following_username);

if ($add_user_stmt->execute()) {
    // If the insertion was successful, return a success response
    http_response_code(201);
    $response = [
        'status' => 'Success',
        'message' => 'User successfully added as a friend (followed)',
    ];
    echo json_encode($response);
} else {
    // If there was an error in inserting the data
    http_response_code(500);
    $response = [
        'status' => 'User not added',
        'message' => 'Error adding user to the database',
    ];
    echo json_encode($response);
}

// Close the statements and the database connection
$check_following_stmt->close();
$add_user_stmt->close();
$mysqli->close();

