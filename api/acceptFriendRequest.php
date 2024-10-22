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
$mysqli = mysqli_connect('localhost', 'gffajard', '50462949', 'gffajard_db');
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

    if ($check_reverse_stmt->num_rows === 0) {
        // Reverse relationship does not exist, insert it
        $insert_reverse_stmt = $mysqli->prepare('INSERT INTO followerPairing (follower, following, status) VALUES (?, ?, ?)');
        $insert_reverse_stmt->bind_param('sss', $following_username, $follower_username, $status_accepted);

        if ($insert_reverse_stmt->execute()) {
            http_response_code(200);
            echo json_encode([
                'status' => 'Success',
                'message' => 'Mutual friendship created',
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'Error',
                'message' => 'Error creating mutual friendship',
            ]);
        }
        $insert_reverse_stmt->close();
    } else {
        // Reverse relationship exists, no need to insert
        http_response_code(200);
        echo json_encode([
            'status' => 'Success',
            'message' => 'Mutual friendship already existed',
        ]);
    }

    $check_reverse_stmt->close();

} else {
    http_response_code(500);
    echo json_encode([
        'status' => 'Error',
        'message' => 'Error updating the friend request status',
    ]);
}

// Close the statements and the database connection
$check_pending_stmt->close();
$update_status_stmt->close();
$mysqli->close();