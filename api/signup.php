<?php
    include_once 'connect.php';
    include_once 'config.php';
    include_once 'countries.php';

    // send responses in JSON
    header("Content-Type: application/json");

    // verify that the request was sent using HTTPS
    if(!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] != 'on') {
        // error code for forbidden protocol
        $http_response_code(403);
        $errorResponse = [
            'status' = 'Forbidden',
            'message' = 'HTTP used for request, use HTTPS instead',
        ];
        echo json_encode($errorResponse);
        exit();
    }

    // verify that the request method is POST
    if($_SERVER['REQUEST_METHOD'] != 'POST') {
        // error code for incorrect method
        $http_response_code(405);
        $errorResponse = [
            'status' = 'Method not allowed',
            'message' = 'Method other than POST used, use POST instead',
        ];
        echo json_encode($errorResponse);
        exit();
    }

    # verify information sent from client

    /* Users Table Information
     *
     * Table Name: users
     * Column names: datatype
     *      userID: int autoincrement
     *      username: varchar(20)
     *      firstName: varchar(50)
     *      lastName: varchar(50)
     *      email: varchar(320)
     *      password: varchar(20)
     *      gender: varchar(6)
     *      country: varchar(60)
     *      language: varchar(60)
     *      timezone: varchar(10)
     */

    /* JSON from frontend
     * 
     * const [formData, setFormData] = useState({
     * firstName: '',
     * lastName: '',
     * username: '',
     * email: '',
     * confirmEmail: '',
     * password: '',
     * gender: '',
     *  [firstName: Johnny,
     *   username: Johnny_Appleseed.bot-442,
     *   lastName: Appleseed,
     *   email: phreeks.signup1@gmail.com,
     *   password: phreekyjohnny442
     *   gender: Male,
     *   country: United States,
     *   language: English (US),
     *   timezone: UTC-5]
     */
    
    // get data from request
    $data = json_decode(file_get_contents("php://input"));

    /* verify that each field is included and in the right format
     *  firstName: only includes alphabetical characters, and is <= 50 characters
     *  username: only includes alphanumeric characters or the following special characters: ".", "_", "-"
     *  lastName: only includes alphabetical characters, and is <= 50 characters
     *  email: starts with alphanumeric characters, the "@buffalo.edu"
     *  gender: verify by checking if it is one of ["Male", "Female", "Other"]
     *  country: keep a constant list of all supported countries and check against that
     *  language: keep a constant list of all supported languages and check against that
     *  timezone: check that the first three characters are "UTC", then the fourth is "+" or "-", and the rest are 
     *  a number[1-12] potentially followed by the character ":" and two numbers[00-59]
     */
    if(!($data->firstName && $data->username && $data->lastName && $data->email && $data->gender && $data->country && $data->language && $data->timezone) 
        || !(ctype_alpha($data->firstName) // firstName
        && preg_match('/^[a-zA-Z][a-zA-Z0-9._-]*$/', $data->username) // username
        && ctype_alpha($data->lastName) // lastName
        && in_array($data->gender, ["Male", "Female", "Other"]) // gender
        && in_array($data->country, )
        && in_array($data->language, )
        && preg_match("/^UTC[+-](1[0-2]|[1-9])(:(0[0-9]|[1-5][0-9]))?$/", $data->timezone) // timezone
        && preg_match("/^[a-zA-Z0-9.]+@buffalo\.edu$/", $data->email)) // email
    ) {
        // reject request if any of the above conditions fail
        // error code for internal server error
        $http_response_code(500);
        $errorResponse = [
            'status' = 'Invalid data',
            'message' = 'Invalid data from client',
        ];
        echo json_encode($errorResponse);
        exit();
    }
    
    // Try to connect to database using configuration in config.php
    $db = connect(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
    // return error response if database connection was unsuccessful
    if($db->connect_error or !($db instanceof mysqli)) {
        die("Cannot connect to database: \n" . $db->connect_error . "\n" . $db->connect_errno);
        // error code for internal server error
        $http_response_code(500);
        $errorResponse = [
            'status' = 'Connection to database failed',
            'message' = 'Invalid configuration for database server',
        ];
        echo json_encode($errorResponse);
        exit();
    }

    // query the database to check that the email is not already being used
    // query the database to check that the username is not already being used
    $email_result = db->query("SELECT email FROM users WHERE email = $data->email LIMIT 1");
    $username_result = db->query("SELECT username FROM users WHERE username = $data->username LIMIT 1");
    // if the query produced a result set, an account using the email or username being used to sign up already exists, so terminate account creation
    $invalid_email = $email_result instanceof mysqli_result;
    $invalid_username = $username_result instanceof mysqli_result;
    if($invalid_email || $invalid_username) {
        // error code for internal server error
        $http_response_code(500);
        $message = 'This is a bug';
        if($invalid_email && !$invalid_username) {
            $message = 'Account already exists with that email';
        }else if($invalid_username && !$invalid_email) {
            $message = 'Account already exists with that username';
        }else if($invalid_email && $invalid_username) {
            $message = 'Account already exists with that email and username';
        }
        $errorResponse = [
            'status' = 'Account creation failed',
            'message' = $message,
        ];
        echo json_encode($errorResponse);
        exit();
    }

    // add new user to database
    $insert_statement = "INSERT INTO users (username, firstName, lastName, email, gender, country, language, timezone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    mysqli_stmt_bind_param($insert_statement, "ssssssss", $data->username, $data->firstName, $data->lastName, $data->email, $data->gender, $data->country, $data->language, $data->timezone);
    $http_response_code(200);
    $successfulResponse = [
        'status' = 'OK',
        'message' = 'User account successfully created',
    ];
    echo json_encode($successfulResponse);
    exit();
    // TODO: check for cookies