<?php
    // TODO: verify that the request was sent using HTTPS
    if(!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] != 'on') {
        // TODO: handle case where HTTPS isn't being used
        // send bad response with details
    }

    // TODO: verify that the request method is POST
    if($_SERVER['REQUEST_METHOD'] != 'POST') {
        // TODO: handle case where the request is not a POST request
        // send bad response with details
    }

    // TODO: get data from request
    $data = json_decode(file_get_contents("php://input"));

    // TODO: check that all data is valid

    // TODO: query the database to check that the username is not already being used
    
    // TODO: query the database to check that the email is not already being used
