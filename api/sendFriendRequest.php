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

// Checks CSRF Token to see if the token is modified
$csrfToken = $_COOKIE['csrf_token'] ?? '';
if ($csrfToken !== $_SESSION['csrf_token']) {
    http_response_code(406); // Forbidden
    echo json_encode(["error" => "Invalid CSRF token"]);
    exit();
}

// Get body of request
$data = json_decode(file_get_contents("php://input"));

// Extract follower and following usernames from request data
$follower_username = $data->follower ?? null;
$following_username = $data->following ?? null;

if (!$follower_username || !$following_username) {
    http_response_code(400);
    $response = [
        'status' => 'Error',
        'message' => 'Missing following username',
    ];
    echo json_encode($response);
    exit();
}

// Connect to the database
$mysqli = mysqli_connect('localhost', 'yichuanp', '50403467', 'yichuanp_db');
if (!($mysqli instanceof mysqli)) {
    http_response_code(500);
    $response = [
        'status' => 'Connection to database failed',
        'message' => 'Could not connect to the database',
    ];
    echo json_encode($response);
    exit();
}

// Check if both the follower and following users exist in the database
$check_user_stmt = $mysqli->prepare('SELECT username FROM users WHERE username = ?');
$check_user_stmt->bind_param('s', $follower_username);
$check_user_stmt->execute();
$check_user_stmt->store_result();
$follower_exists = $check_user_stmt->num_rows > 0;
$check_user_stmt->close();

$check_user_stmt = $mysqli->prepare('SELECT username FROM users WHERE username = ?');
$check_user_stmt->bind_param('s', $following_username);
$check_user_stmt->execute();
$check_user_stmt->store_result();
$following_exists = $check_user_stmt->num_rows > 0;
$check_user_stmt->close();

if (!$follower_exists || !$following_exists) {
    http_response_code(400);
    $response = [
        'status' => 'Error',
        'message' => 'One or both of the users do not exist',
    ];
    echo json_encode($response);
    exit();
}

// Check if the current user has already sent a pending friend request
$status_pending = 'pending';
$check_follower_to_following_stmt = $mysqli->prepare('SELECT * FROM followerPairing WHERE follower = ? AND following = ? AND status = ?');
$check_follower_to_following_stmt->bind_param('sss', $follower_username, $following_username, $status_pending);
$check_follower_to_following_stmt->execute();
$check_follower_to_following_stmt->store_result();
$is_pending_follower_to_following = $check_follower_to_following_stmt->num_rows > 0;

if ($is_pending_follower_to_following) {
    http_response_code(400);
    $response = [
        'status' => 'Error',
        'message' => 'You have already sent a pending friend request to this user',
    ];
    echo json_encode($response);
    exit();
}

// Check if the person you want to follow has already sent a pending friend request to the current user
$check_following_to_follower_stmt = $mysqli->prepare('SELECT * FROM followerPairing WHERE follower = ? AND following = ? AND status = ?');
$check_following_to_follower_stmt->bind_param('sss', $following_username, $follower_username, $status_pending);
$check_following_to_follower_stmt->execute();
$check_following_to_follower_stmt->store_result();
$is_pending_following_to_follower = $check_following_to_follower_stmt->num_rows > 0;

if ($is_pending_following_to_follower) {
    http_response_code(400);
    $response = [
        'status' => 'Error',
        'message' => 'This user has already sent you a pending friend request',
    ];
    echo json_encode($response);
    exit();
}

// Check if the current user is already following the person they want to follow
$status_accepted = 'accepted';
$check_follower_to_following_stmt = $mysqli->prepare('SELECT * FROM followerPairing WHERE follower = ? AND following = ? AND status = ?');
$check_follower_to_following_stmt->bind_param('sss', $follower_username, $following_username, $status_accepted);
$check_follower_to_following_stmt->execute();
$check_follower_to_following_stmt->store_result();
$is_already_following = $check_follower_to_following_stmt->num_rows > 0;

if ($is_already_following) {
    http_response_code(400);
    $response = [
        'status' => 'Error',
        'message' => 'You are already following this user',
    ];
    echo json_encode($response);
    exit();
}

// Check if the person you want to follow is already following the current user
$check_following_to_follower_stmt = $mysqli->prepare('SELECT * FROM followerPairing WHERE follower = ? AND following = ? AND status = ?');
$check_following_to_follower_stmt->bind_param('sss', $following_username, $follower_username, $status_accepted);
$check_following_to_follower_stmt->execute();
$check_following_to_follower_stmt->store_result();
$is_already_being_followed = $check_following_to_follower_stmt->num_rows > 0;

if ($is_already_being_followed) {
    http_response_code(400);
    $response = [
        'status' => 'Error',
        'message' => 'This user is already following you',
    ];
    echo json_encode($response);
    exit();
}

// Insert a new friend request with status 'pending'
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
