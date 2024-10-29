<?php
// Start session for cookies
session_start();

// Set necessary headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Verify that the request method is POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'Method not allowed',
        'message' => 'Method other than POST used, use POST instead',
    ]);
    exit();
}

// Get body of request
$data = json_decode(file_get_contents("php://input"));

// Extract follower and following usernames from request data
$follower_username = $data->follower ?? null;
$following_username = $data->following ?? null;

if (!$follower_username || !$following_username) {
    http_response_code(400);
    echo json_encode([
        'status' => 'Error',
        'message' => 'Missing follower or following username',
    ]);
    exit();
}

// Connect to the database
$mysqli = mysqli_connect('localhost', 'sadeedra', '50515928', 'sadeedra_db');
if (!$mysqli) {
    http_response_code(500);
    echo json_encode([
        'status' => 'Connection to database failed',
        'message' => 'Could not connect to the database',
    ]);
    exit();
}

// Update the friend request status to 'accepted'
$status_accepted = 'accepted';
$update_status_stmt = $mysqli->prepare('UPDATE followerPairing SET status = ? WHERE follower = ? AND following = ? AND status = ?');
$update_status_stmt->bind_param('ssss', $status_accepted, $follower_username, $following_username, $status_pending);

$status_pending = 'pending';  // Define the pending status

if ($update_status_stmt->execute()) {
    http_response_code(200);
    echo json_encode([
        'status' => 'Success',
        'message' => 'Friend request accepted',
    ]);

    // Check if the reverse relationship exists
    $check_reverse_stmt = $mysqli->prepare('SELECT * FROM followerPairing WHERE follower = ? AND following = ?');
    $check_reverse_stmt->bind_param('ss', $following_username, $follower_username);
    $check_reverse_stmt->execute();
    $check_reverse_stmt->store_result();

    if ($check_reverse_stmt->num_rows > 0) {
        // If reverse request exists, update it to 'accepted' as well
        $update_reverse_status_stmt = $mysqli->prepare('UPDATE followerPairing SET status = ? WHERE follower = ? AND following = ?');
        $update_reverse_status_stmt->bind_param('sss', $status_accepted, $following_username, $follower_username);
        $update_reverse_status_stmt->execute();
        $update_reverse_status_stmt->close();
    } else {
        // Insert the reverse relationship as accepted if it does not exist
        $insert_reverse_stmt = $mysqli->prepare('INSERT INTO followerPairing (follower, following, status) VALUES (?, ?, ?)');
        $insert_reverse_stmt->bind_param('sss', $following_username, $follower_username, $status_accepted);
        $insert_reverse_stmt->execute();
        $insert_reverse_stmt->close();
    }

    // Remove the request from pending after accepting
    $delete_pending_stmt = $mysqli->prepare('DELETE FROM followerPairing WHERE follower = ? AND following = ? AND status = ?');
    $delete_pending_stmt->bind_param('sss', $follower_username, $following_username, $status_pending);
    $delete_pending_stmt->execute();
    $delete_pending_stmt->close();

} else {
    http_response_code(500);
    echo json_encode([
        'status' => 'Error',
        'message' => 'Error updating the friend request status',
    ]);
}

// Close the statements and the database connection
$update_status_stmt->close();
$check_reverse_stmt->close();
$mysqli->close();
?>
