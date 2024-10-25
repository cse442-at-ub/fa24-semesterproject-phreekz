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
$mysqli = mysqli_connect('localhost', 'yichuanp', '50403467', 'yichuanp_db');

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

// Bind the email parameter to the query
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

// Check if a user with that email was found
if ($result->num_rows > 0) {
    // Fetch user data from the result
    $user = $result->fetch_assoc();

    // Debugging: Output the entered password and hashed password from the database
    echo json_encode(["debug_plain_password" => $password, "debug_hashed_password" => $user['password']]);

        // Verify the entered password with the stored hashed password
    if (password_verify($password, $user['password'])) {
        // Password is correct, proceed with login
        echo json_encode(["success" => true, "message" => "Login successful"]);

        // Store the username in the session
        $_SESSION['username'] = $user['username'];
        setcookie("username", $user['username'], time() + (86400 * 30), "/"); // Set cookie for 30 days

        http_response_code(200);

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
    } else {
        // Invalid password
        http_response_code(401); // Unauthorized
        echo json_encode(["success" => false, "message" => "Invalid password"]);
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