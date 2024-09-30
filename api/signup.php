<?php
    include_once 'connect.php';
    include_once 'config.php';

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

    // get data from request
    $data = json_decode(file_get_contents("php://input"));

    /*
     *  [first_name: Johnny,
     *   username: Johnny_Appleseed.bot-442,
     *   last_name: Appleseed,
     *   email: phreeks.signup1@gmail.com,
     *   gender: Male,
     *   country: United States,
     *   language: English (US),
     *   timezone: EST]
     */
    
    // TODO: check that all data is valid
    // Note: should be done in frontend before request is sent, so ignore for now

    // TODO: query the database to check that the username is not already being used
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

    // TODO: query the database to check that the email is not already being used
    // TODO: query the database to check that the username is not already being used
    $email_result = db->query("SELECT EMAIL FROM slogin_db WHERE EMAIL = $data->email LIMIT 1");
    $username_result = db->query("SELECT USERNAME FROM slogin_db WHERE USERNAME = $data->username LIMIT 1");
    // if the query produced a result set, an account using the email being used to sign up already exists, so terminate account creation
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

    // TODO: check for cookies