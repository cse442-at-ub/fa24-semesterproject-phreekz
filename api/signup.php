<?php
    // send responses in JSON
    header("Content-Type: application/json");

    // verify that the request was sent using HTTPS
    if(!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] != 'on') {        
        $http_response_code(403);
        $errorResponse = [
            'status' = 'Forbidden',
            'message' = 'HTTP used for request, use HTTPS instead',
        ];
        echo json_encode($errorResponse);
    }

    // verify that the request method is POST
    if($_SERVER['REQUEST_METHOD'] != 'POST') {
        $http_response_code(405);
        $errorResponse = [
            'status' = 'Method not allowed',
            'message' = 'Method other than POST used, use POST instead',
        ];
        echo json_encode($errorResponse);
    }

    // get data from request
    $data = json_decode(file_get_contents("php://input"));

    // TODO: check that all data is valid
    // Note: should be done in frontend before request is sent, so ignore for now

    // TODO: query the database to check that the username is not already being used

    // TODO: query the database to check that the email is not already being used

    // TODO: check for cookies