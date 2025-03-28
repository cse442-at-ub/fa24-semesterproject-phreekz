<?php
// start session for cookies
session_start();

// set necessary headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header("Content-Security-Policy: default-src 'self'; script-src 'self'");

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

// Checks CSRF Token to see if the token is modified
$csrfToken = $_COOKIE['csrf_token'] ?? '';
if ($csrfToken !== $_SESSION['csrf_token']) {
    http_response_code(406); // Forbidden
    echo json_encode(["error" => "Invalid CSRF token"]);
    exit();
}

// get body of request
$data = json_decode(file_get_contents("php://input"));
// verify that all fields are there
if(!($data->firstName && $data->lastName && $data->username && $data->email && $data->password && $data->gender)
|| !(ctype_alpha($data->firstName) // first_name
    && preg_match('/^[a-zA-Z][a-zA-Z0-9._-]*$/', $data->username) // username
    && ctype_alpha($data->lastName) // last_name
    && in_array($data->gender, ['male', 'female', 'nonbinary']) // gender
    && preg_match('/^[a-zA-Z0-9]+@buffalo\.edu$/', $data->email) // email
    ) 
) {
    http_response_code(400);
    $response = [
        'status' => 'Error',
        'message' => 'Incomplete or malformed request body',
    ];
    echo json_encode($response);
    exit();
}

// connect to database
$mysqli = mysqli_connect('localhost', 'slogin', '50474939', 'slogin_db');

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

// query the database to check that the email is not already being used
$select_email_stmt = $mysqli->prepare('SELECT email FROM users WHERE email = ?');
$select_email_stmt->bind_param('s', $data->email);
$select_email_stmt->execute();
$select_email_stmt->store_result(); 
$invalid_email = $select_email_stmt->num_rows > 0; 

// query the database to check that the username is not already being used
$select_username_stmt = $mysqli->prepare('SELECT username FROM users WHERE username = ?');
$select_username_stmt->bind_param('s', $data->username);
$select_username_stmt->execute();
$select_username_stmt->store_result(); 
$invalid_username = $select_username_stmt->num_rows > 0; 

if($invalid_email || $invalid_username) {
    http_response_code(400);
    $response = [
        'status' => 'Username or email taken',
        'message' => 'Username or email taken',
    ];
    echo json_encode($response);
    exit();
}

// Sanitize and validate input fields
$data->firstName = htmlspecialchars(trim($data->firstName), ENT_QUOTES, 'UTF-8');
$data->lastName = htmlspecialchars(trim($data->lastName), ENT_QUOTES, 'UTF-8');
$data->username = htmlspecialchars(trim($data->username), ENT_QUOTES, 'UTF-8');
$data->email = htmlspecialchars(trim($data->email), ENT_QUOTES, 'UTF-8');
$data->password = htmlspecialchars(trim($data->password), ENT_QUOTES, 'UTF-8');

// Hash the user's password before storing it in the database
$hashed_password = password_hash($data->password, PASSWORD_DEFAULT);

// add new user to database
$add_user_stmt = $mysqli->prepare('INSERT INTO users (username, email, password, first_name, last_name, gender) VALUES (?, ?, ?, ?, ?, ?)');
$add_user_stmt->bind_param('ssssss', $data->username, $data->email, $hashed_password, $data->firstName, $data->lastName, $data->gender);

if($add_user_stmt->execute()) {
    // After successful signup, insert data into accountinfo table
    $fullName = $data->firstName . ' ' . $data->lastName;
    $gender = $data->gender;
    $email = $data->email;
    $language = ''; // Not provided in signup
    $country = '';  // Not provided in signup
    $timeZone = ''; // Not provided in signup

    // Insert profile data into accountinfo table
    $insert_accountinfo_stmt = $mysqli->prepare('INSERT INTO accountinfo (username, fullName, gender, language, country, timeZone, email) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $insert_accountinfo_stmt->bind_param('sssssss', $data->username, $fullName, $gender, $language, $country, $timeZone, $email);

    if ($insert_accountinfo_stmt->execute()) {
        http_response_code(200);
        $_SESSION['username'] = $data->username; // Save username in session
        setcookie('username', $data->username, time() + (86400 * 30), '/'); // Set cookie for 30 days
        $response = [
            'status' => 'User and profile added',
            'message' => 'New user and profile added to database',
        ];
        echo json_encode($response);
    } else {
        http_response_code(500);
        $response = [
            'status' => 'Profile insertion failed',
            'message' => 'User added, but profile insertion failed',
            'error' => $mysqli->error,
        ];
        echo json_encode($response);
    }
} else {
    http_response_code(400);
    $response = [
        'status' => 'User not added',
        'message' => 'Error adding user to database',
    ];
    echo json_encode($response);
}

mysqli_close($mysqli);
?>
