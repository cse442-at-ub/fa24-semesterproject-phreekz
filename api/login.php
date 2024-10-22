<?php
// Set necessary headers
session_start();
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

// Connect to the database
$mysqli = mysqli_connect('localhost', 'sadeedra', '50515928', 'sadeedra_db');
if (!($mysqli instanceof mysqli)) {
    die("Cannot connect to database");
    http_response_code(400);
    $response = [
        'status' => 'Connection to database failed',
        'message' => 'Invalid configuration for database',
    ];
    echo json_encode($response);
    exit();
}

// Set a success status for a good connection
http_response_code(200);

// Get the data from the request
$data = json_decode(file_get_contents("php://input"));
$email = $data->email;
$password = $data->password;

// Prepare and execute the SQL query to find the user by email
$sqlEmail = "SELECT * FROM users WHERE LOWER(email) = LOWER(?)";
$stmt = $mysqli->prepare($sqlEmail);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    // Verify the password
    if ($password == $user['password']) {
        // Successful login
        http_response_code(200);

        // Get accepted friends
        $sqlAcceptedFriends = "SELECT following FROM followerPairing WHERE LOWER(follower) = LOWER(?) AND status = 'accepted'";
        $stmtAcceptedFriends = $mysqli->prepare($sqlAcceptedFriends);
        $follower_username = $user['username'];
        $stmtAcceptedFriends->bind_param("s", $follower_username);
        $stmtAcceptedFriends->execute();
        $resultAcceptedFriends = $stmtAcceptedFriends->get_result();
        $acceptedFriendsList = $resultAcceptedFriends->fetch_all(MYSQLI_ASSOC);

        // Get pending friends sent by the current user
        $sqlPendingFriendsSent = "SELECT following FROM followerPairing WHERE LOWER(follower) = LOWER(?) AND status = 'pending'";
        $stmtPendingFriendsSent = $mysqli->prepare($sqlPendingFriendsSent);
        $stmtPendingFriendsSent->bind_param("s", $follower_username);
        $stmtPendingFriendsSent->execute();
        $resultPendingFriendsSent = $stmtPendingFriendsSent->get_result();
        $pendingFriendsSentList = $resultPendingFriendsSent->fetch_all(MYSQLI_ASSOC);

        // Get pending friend requests received by the current user
        $sqlPendingFriendsReceived = "SELECT follower FROM followerPairing WHERE LOWER(following) = LOWER(?) AND status = 'pending'";
        $stmtPendingFriendsReceived = $mysqli->prepare($sqlPendingFriendsReceived);
        $stmtPendingFriendsReceived->bind_param("s", $follower_username);
        $stmtPendingFriendsReceived->execute();
        $resultPendingFriendsReceived = $stmtPendingFriendsReceived->get_result();
        $pendingFriendsReceivedList = $resultPendingFriendsReceived->fetch_all(MYSQLI_ASSOC);

        // Combine sent and received pending friend requests
        $pendingFriendsList = array_merge($pendingFriendsSentList, $pendingFriendsReceivedList);

        // Store the accepted and pending friend lists in cookies
        setcookie("accepted_friends", json_encode($acceptedFriendsList), time() + (86400 * 30), "/");
        setcookie("pending_friends", json_encode($pendingFriendsList), time() + (86400 * 30), "/");

        // Store the username in the session and a cookie
        $_SESSION['username'] = $user['username'];
        setcookie("username", $user['username'], time() + (86400 * 30), "/");

        echo json_encode(["success" => true, "message" => "Login successful"]);
        exit();
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid password"]);
        exit();
    }
} else {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit();
}

// Close the statement and database connection
$stmt->close();
$mysqli->close();
?>
