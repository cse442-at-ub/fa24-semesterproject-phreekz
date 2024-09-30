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
     *  First Name: Johnny
     *  Username: Johnny_Appleseed.bot-442
     *  Last Name: Appleseed
     *  Email: phreeks.signup1@gmail.com
     *  Gender: Male
     *  Country: United States
     *  Language: English (US)
     *  Timezone: EST
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

    // TODO: check for cookies