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
    
    // TODO: check that all data is valid
    // Note: should be done in frontend before request is sent, so ignore for now

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

    # TODO: verify information sent from client

    /* Users Table Information
     * Table Name: users
     * Column names: datatype
     *      userID: int
     *      username: varchar(20)
     *      first_name: varchar(50)
     *      last_name: varchar(50)
     *      email: varchar(320)
     *      gender: varchar(6)
     *      country: varchar(60)
     *      language: varchar(60)
     *      timezone: varchar(10)
     */


     /* 
     *  [first_name: Johnny,
     *   username: Johnny_Appleseed.bot-442,
     *   last_name: Appleseed,
     *   email: phreeks.signup1@gmail.com,
     *   gender: Male,
     *   country: United States,
     *   language: English (US),
     *   timezone: UTC-5]
     */
    
    // get data from request
    $data = json_decode(file_get_contents("php://input"));

    /* verify that each field is included and in the right format
     *  first_name: only includes alphabetical characters, and is <= 50 characters
     *  username: only includes alphanumeric characters or the following special characters: ".", "_", "-"
     *  last_name: only includes alphabetical characters, and is <= 50 characters
     *  email: starts with alphanumeric characters, the "@buffalo.edu"
     *  gender: verify by checking if it is one of ["Male", "Female", "Other"]
     *  country: keep a constant list of all supported countries and check against that
     *  language: keep a constant list of all supported languages and check against that
     *  timezone: check that the first three characters are "UTC", then the fourth is "+" or "-", and the last is 
     *      a number[1-12] potentially followed by the character ":" and a number[00-59]
     */
    if(!($data->first_name && $data->username && $data->last_name && $data->email && $data->gender && $data->country && $data->language && $data->timezone) 
        || !ctype_alpha($data->first_name) // first_name
        || !preg_match('/^[a-zA-Z][a-zA-Z0-9._-]*$/', $data->username) // username
        || !ctype_alpha($data->last_name) // last_name
        || !in_array($data->gender, ["Male", "Female", "Other"]) // gender
        || !in_array($data->country, [ // country
            "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", 
            "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", 
            "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", 
            "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", 
            "Congo (Democratic Republic of the)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", 
            "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. \"Swaziland\")", "Ethiopia", "Fiji", "Finland", "France", 
            "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", 
            "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", 
            "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", 
            "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", 
            "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", 
            "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", 
            "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", 
            "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", 
            "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", 
            "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", 
            "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", 
            "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", 
            "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City (Holy See)", "Venezuela", 
            "Vietnam", "Yemen", "Zambia", "Zimbabwe"
        ])
        || !in_array($data->language, ["English", "Chinese", "Spanish", "Arabic", "Indonesian", "Portuguese", "French", "Japanese", "Russian", "German"])
        || !preg_match("/^UTC[+-](1[0-2]|[1-9])(:(0[0-9]|[1-5][0-9]))?$/", $data->timezone) // timezone
        || !preg_match("/^[a-zA-Z0-9]+@buffalo\.edu$/", $data->email) // email
    ) {
        // reject request
        $http_response_code(500);
        $errorResponse = [
            'status' = 'Invalid data',
            'message' = 'Invalid data from client',
        ];
        echo json_encode($errorResponse);
        exit();
    }

    // query the database to check that the email is not already being used
    // query the database to check that the username is not already being used
    $email_result = db->query("SELECT email FROM users WHERE email = $data->email LIMIT 1");
    $username_result = db->query("SELECT username FROM users WHERE username = $data->username LIMIT 1");
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

    // TODO: add new user to database

    // TODO: check for cookies