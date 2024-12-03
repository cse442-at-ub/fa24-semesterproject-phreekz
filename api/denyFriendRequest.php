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
$mysqli = mysqli_connect('localhost', 'slogin', '50474939', 'slogin_db');

if (!($mysqli instanceof mysqli)) {
    http_response_code(500);
    $response = [
        'status' => 'Connection to database failed',
        'message' => 'Could not connect to the database',
    ];
    echo json_encode($response);
    exit();
}

// Check if the follow request exists with a 'pending' status
$check_pending_stmt = $mysqli->prepare('SELECT * FROM followerPairing WHERE follower = ? AND following = ? AND status = ?');
$status_pending = 'pending';
$check_pending_stmt->bind_param('sss', $follower_username, $following_username, $status_pending);
$check_pending_stmt->execute();
$check_pending_stmt->store_result();
$is_pending_request = $check_pending_stmt->num_rows > 0;

if (!$is_pending_request) {
    http_response_code(404);
    $response = [
        'status' => 'Request not found',
        'message' => 'No pending friend request found to deny',
    ];
    echo json_encode($response);
    exit();
}

// Delete the pending friend request from the database
$delete_request_stmt = $mysqli->prepare('DELETE FROM followerPairing WHERE follower = ? AND following = ? AND status = ?');
$delete_request_stmt->bind_param('sss', $follower_username, $following_username, $status_pending);

if ($delete_request_stmt->execute()) {
    // If the deletion was successful, return a success response
    http_response_code(200);
    $response = [
        'status' => 'Success',
        'message' => 'Friend request denied and deleted',
    ];
    echo json_encode($response);
} else {
    // If there was an error in deleting the request
    http_response_code(500);
    $response = [
        'status' => 'Error',
        'message' => 'Error denying the friend request',
    ];
    echo json_encode($response);
}

// Close the statements and the database connection
$check_pending_stmt->close();
$delete_request_stmt->close();
$mysqli->close();
?>
