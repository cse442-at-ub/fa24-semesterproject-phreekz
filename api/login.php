<?php
// start session for cookies
session_start();

// set necessary headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// verify that the request method is POST
if($_SERVER['REQUEST_METHOD'] != 'POST') {
    // error code for incorrect method
    http_response_code(405);
    $response = [
        'status' => 'Method not allowed',
        'message' => 'Method other than POST used, use POST instead',
    ];
    echo json_encode($response);
    exit();
}

// Connect to database
$mysqli = mysqli_connect('localhost', 'sadeedra', '50515928', 'sadeedra_db');

if(!($mysqli instanceof mysqli)) {
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
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($data) {
    $email = $data['email'];
    $password = $data['password'];
} else {
    // Handle the case where JSON decoding fails
    echo json_encode(["error" => "Invalid input"]);
    http_response_code(400); // Bad request
    exit();
}

$email = $data['email']; // Sanitize the email input
$password = $data['password']; // Get the plain-text password

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

        http_response_code(200);
    } else {
        // Invalid password
        http_response_code(401); // Unauthorized
        echo json_encode(["success" => false, "message" => "Invalid password"]);
    }

    if ($user) {
            // Prepare SQL query to get accepted friends
            $sqlAcceptedFriends = "SELECT following FROM followerPairing WHERE LOWER(follower) = LOWER(?) AND status = 'accepted'";
            $stmtAcceptedFriends = $mysqli->prepare($sqlAcceptedFriends);
            $follower_username = $user['username'];
            $stmtAcceptedFriends->bind_param("s", $follower_username);
            $stmtAcceptedFriends->execute();
            $resultAcceptedFriends = $stmtAcceptedFriends->get_result();
            $acceptedFriendsList = $resultAcceptedFriends->fetch_all(MYSQLI_ASSOC);

            // Prepare SQL query to get pending friends
            $sqlPendingFriends = "SELECT following FROM followerPairing WHERE LOWER(follower) = LOWER(?) AND status = 'pending'";
            $stmtPendingFriends = $mysqli->prepare($sqlPendingFriends);
            $stmtPendingFriends->bind_param("s", $follower_username);
            $stmtPendingFriends->execute();
            $resultPendingFriends = $stmtPendingFriends->get_result();
            $pendingFriendsList = $resultPendingFriends->fetch_all(MYSQLI_ASSOC);

            // Store the accepted and pending friend lists in cookies
            setcookie("accepted_friends", json_encode($acceptedFriendsList), time() + (86400 * 30), "/"); // Set cookie for 30 days
            setcookie("pending_friends", json_encode($pendingFriendsList), time() + (86400 * 30), "/"); // Set cookie for 30 days

            // Store the username in the session and a cookie
            $_SESSION['username'] = $user['username'];
            setcookie("username", $user['username'], time() + (86400 * 30), "/"); // Set cookie for 30 days

            // Respond with success
            http_response_code(200); // OK
            echo json_encode(["success" => true, "message" => "Login successful"]);
            exit();
        } 
} else {
    // No user found with the provided email in the first query
    http_response_code(404); // Not Found
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit();
}


// Close the statement and database connection
$stmt->close();
$mysqli->close();
?>
