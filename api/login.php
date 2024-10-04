<?php
    include_once 'connect.php';
    include_once 'config.php';

    // Send responses in JSON
    header("Content-Type: application/json");

    // Verify that the request was sent using HTTPS
    if(!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] != 'on')
    {
        // Error code for forbidden protocol
        $http_response_code(403);
        $errorResponse = [
            'status' = 'Forbidden',
            'message' = 'HTTP used for request, use HTTPS instead',
        ];
        echo json_encode($errorResponse);
        exit();
    }

    // Verify that the request method is GET
    if($_SERVER['REQUEST_METHOD'] != 'GET') {
        // Error code for incorrect method
        $http_response_code(405);
        $errorResponse = [
            'status' = 'Method not allowed',
            'message' = 'Method other than GET used, use GET instead',
        ];
        echo json_encode($errorResponse);
        exit();
    }

    // Get data from request    
    $data = json_decode(file_get_contents("php://input"),true);

    //[email: longtendo@buffalo.edu, password: test123]

    // Try to connect to database using configuration in config.php
    $db = connect(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
    // Return error response if database connection was unsuccessful
    if($db->connect_error or !($db instanceof mysqli))
    {
        die("Cannot connect to database: \n" . $db->connect_error . "\n" . $db->connect_errno);
        // Error code for internal server error
        $http_response_code(500);
        $errorResponse = [
            'status' = 'Connection to database failed',
            'message' = 'Invalid configuration for database server',
        ];
        echo json_encode($errorResponse);
        exit();
    }

    $email = $data['email']; // Grab the email the user input
    $password = $data['password']; // Grab the password the user input

    if (empty($email) || empty($password))
    {
        echo json_encode(["success" => false, "message" => "Email and password are required."]);
        exit();
    }

    // Prepare and execute the SQL query to find the user by email
    $sql = "SELECT * FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql); // For security
    $stmt->bind_param("s", $email); // Bind the email to the query // For security
    $stmt->execute(); // For security
    $result = $stmt->get_result();

    // Check if a user with that email was found
    if ($result->num_rows > 0)
    {
        $user = $result->fetch_assoc();  // Fetch user data from the result
        
        // Verify the provided password with the hashed password in the database
        if (password_verify($password, $user['password']) && $user)
        {
            // Login successful, you can generate a token or start a session here
            echo json_encode(["success" => true, "message" => "Login successful"]);
        }
        else
        {
            // Password does not match
            echo json_encode(["success" => false, "message" => "Invalid password"]);
        }
    }
    else
    {
        // No user found with the provided email
        echo json_encode(["success" => false, "message" => "User not found"]);
    }

    // Close the database connection
    $conn->close();
    

    // TODO: check for cookies for "Remember me"...