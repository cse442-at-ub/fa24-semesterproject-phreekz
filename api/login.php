<?php
// Start session for cookies
session_start();
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Verify that the request method is POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'Method not allowed', 'message' => 'POST required']);
    exit();
}

// Connect to database
$mysqli = mysqli_connect('localhost', 'sadeedra', '50515928', 'sadeedra_db');
if (!$mysqli) {
    http_response_code(500);
    echo json_encode(['status' => 'Connection to database failed']);
    exit();
}

// Get request data
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
        $follower_username = $user['username'];

        // Fetch accepted friends
        $sqlAcceptedFriends = "SELECT following FROM followerPairing WHERE LOWER(follower) = LOWER(?) AND status = 'accepted'";
        $stmtAccepted = $mysqli->prepare($sqlAcceptedFriends);
        $stmtAccepted->bind_param("s", $follower_username);
        $stmtAccepted->execute();
        $acceptedFriendsList = $stmtAccepted->get_result()->fetch_all(MYSQLI_ASSOC);

        // Fetch sent pending friend requests
        $sqlPendingSent = "SELECT following FROM followerPairing WHERE LOWER(follower) = LOWER(?) AND status = 'pending'";
        $stmtPendingSent = $mysqli->prepare($sqlPendingSent);
        $stmtPendingSent->bind_param("s", $follower_username);
        $stmtPendingSent->execute();
        $pendingFriendsSentList = $stmtPendingSent->get_result()->fetch_all(MYSQLI_ASSOC);

        // Fetch received pending friend requests
        $sqlPendingReceived = "SELECT follower FROM followerPairing WHERE LOWER(following) = LOWER(?) AND status = 'pending'";
        $stmtPendingReceived = $mysqli->prepare($sqlPendingReceived);
        $stmtPendingReceived->bind_param("s", $follower_username);
        $stmtPendingReceived->execute();
        $pendingFriendsReceivedList = $stmtPendingReceived->get_result()->fetch_all(MYSQLI_ASSOC);

        // Merge sent and received pending requests into a single list
        $pendingFriendsList = array_merge($pendingFriendsSentList, $pendingFriendsReceivedList);

        // Store data in cookies
        setcookie("accepted_friends", json_encode($acceptedFriendsList), time() + 86400 * 30, "/");
        setcookie("pending_friends", json_encode($pendingFriendsList), time() + 86400 * 30, "/");
        setcookie("username", $user['username'], time() + 86400 * 30, "/");

        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Login successful"]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid password"]);
    }
} else {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "User not found"]);
}

$stmt->close();
$mysqli->close();
?>
