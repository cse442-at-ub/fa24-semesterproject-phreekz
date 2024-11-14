<?php
// Start session for cookies
session_start();
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header("Content-Security-Policy: default-src 'self'; script-src 'self'");

// Verify that the request method is POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'Method not allowed', 'message' => 'POST required']);
    exit();
}

// Retrieve CSRF token from headers or cookies
$csrfToken = $_SERVER['HTTP_CSRF_TOKEN'] ?? $_COOKIE['csrf_token'] ?? '';

// Check the CSRF token against the session
if ($csrfToken !== $_SESSION['csrf_token']) {
    http_response_code(403); // Forbidden
    echo json_encode(["error" => "Invalid or missing CSRF token"]);
    exit();
}

// Connect to the database using the updated credentials
$mysqli = mysqli_connect('localhost', 'yichuanp', '50403467', 'yichuanp_db');

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
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($data) {
    // Sanitize and validate the input fields
    $sanitizedEmail = htmlspecialchars(trim($data['email']), ENT_QUOTES, 'UTF-8');
    $sanitizedPassword = htmlspecialchars(trim($data['password']), ENT_QUOTES, 'UTF-8');
    $rememberMe = isset($data['rememberMe']) ? $data['rememberMe'] : false; // Get Remember Me field

    if ($data['email'] != $sanitizedEmail) {
        echo json_encode(["error" => "Malicious Email Detected"]);
        http_response_code(406); // Malicious Email
        exit();
    }

    if ($data['password'] != $sanitizedPassword) {
        echo json_encode(["error" => "Malicious Password Detected"]);
        http_response_code(407); // Malicious Password
        exit();
    }
} else {
    echo json_encode(["error" => "Invalid input"]);
    http_response_code(400); // Bad request
    exit();
}

$email = $data['email'];
$password = $data['password'];

// Prepare and execute the SQL query to find the user by email
$sqlEmail = "SELECT * FROM users WHERE LOWER(email) = LOWER(?)";
$stmt = $mysqli->prepare($sqlEmail);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    // Verify the entered password with the stored hashed password
    if (password_verify($password, $user['password'])) {
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

        // Store data in separate cookies
        setcookie("accepted_friends", json_encode($acceptedFriendsList), time() + 86400 * 30, "/");
        setcookie("pending_sent_friends", json_encode($pendingFriendsSentList), time() + 86400 * 30, "/");
        setcookie("pending_received_friends", json_encode($pendingFriendsReceivedList), time() + 86400 * 30, "/");
        setcookie("username", $user['username'], time() + 86400 * 30, "/");

        // Set the "remember_me" cookie if Remember Me is checked
        if ($rememberMe) {
            setcookie("remember_me", "true", time() + 86400 * 30, "/"); // Expires in 30 days
        }

        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Login successful"]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid password"]);
        exit();
    }
} else {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "User not found"]);
}

$stmt->close();
$mysqli->close();
?>
