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
     *  email: verify by first checking if it exists in the database, and then sending a verification email
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
            "Afghanistan",
            "Albania",
            "Algeria",
            "Andorra",
            "Angola",
            "Antigua and Barbuda",
            "Argentina",
            "Armenia",
            "Australia",
            "Austria",
            "Austrian Empire",
            "Azerbaijan",
            "Baden*",
            "Bahamas, The",
            "Bahrain",
            "Bangladesh",
            "Barbados",
            "Bavaria",
            "Belarus",
            "Belgium",
            "Belize",
            "Benin (Dahomey)",
            "Bolivia",
            "Bosnia and Herzegovina",
            "Botswana",
            "Brazil",
            "Brunei",
            "Brunswick and Lüneburg",
            "Bulgaria",
            "Burkina Faso (Upper Volta)",
            "Burma",
            "Burundi",
            "Cabo Verde",
            "Cambodia",
            "Cameroon",
            "Canada",
            "Cayman Islands, The",
            "Central African Republic",
            "Central American Federation",
            "Chad",
            "Chile",
            "China",
            "Colombia",
            "Comoros",
            "Congo Free State, The",
            "Cook Islands",
            "Costa Rica",
            "Cote d'Ivoire (Ivory Coast)",
            "Croatia",
            "Cuba",
            "Cyprus",
            "Czechia",
            "Czechoslovakia",
            "Democratic Republic of the Congo",
            "Denmark",
            "Djibouti",
            "Dominica",
            "Dominican Republic",
            "Duchy of Parma, The",
            "East Germany (German Democratic Republic)",
            "Ecuador",
            "Egypt",
            "El Salvador",
            "Equatorial Guinea",
            "Eritrea",
            "Estonia",
            "Eswatini",
            "Ethiopia",
            "Fiji",
            "Finland",
            "France",
            "Gabon",
            "Gambia, The",
            "Georgia",
            "Germany",
            "Ghana",
            "Grand Duchy of Tuscany, The",
            "Greece",
            "Grenada",
            "Guatemala",
            "Guinea",
            "Guinea-Bissau",
            "Guyana",
            "Haiti",
            "Hanover",
            "Hanseatic Republics",
            "Hawaii",
            "Hesse",
            "Holy See",
            "Honduras",
            "Hungary",
            "Iceland",
            "India",
            "Indonesia",
            "Iran",
            "Iraq",
            "Ireland",
            "Israel",
            "Italy",
            "Jamaica",
            "Japan",
            "Jordan",
            "Kazakhstan",
            "Kenya",
            "Kingdom of Serbia/Yugoslavia",
            "Kiribati",
            "Korea",
            "Kosovo",
            "Kuwait",
            "Kyrgyzstan",
            "Laos",
            "Latvia",
            "Lebanon",
            "Lesotho",
            "Lew Chew (Loochoo)",
            "Liberia",
            "Libya",
            "Liechtenstein",
            "Lithuania",
            "Luxembourg",
            "Madagascar",
            "Malawi",
            "Malaysia",
            "Maldives",
            "Mali",
            "Malta",
            "Marshall Islands",
            "Mauritania",
            "Mauritius",
            "Mecklenburg-Schwerin",
            "Mecklenburg-Strelitz",
            "Mexico",
            "Micronesia",
            "Moldova",
            "Monaco",
            "Mongolia",
            "Montenegro",
            "Morocco",
            "Mozambique",
            "Namibia",
            "Nassau",
            "Nauru",
            "Nepal",
            "Netherlands, The",
            "New Zealand",
            "Nicaragua",
            "Niger",
            "Nigeria",
            "Niue",
            "North German Confederation",
            "North German Union",
            "North Macedonia",
            "Norway",
            "Oldenburg",
            "Oman",
            "Orange Free State",
            "Pakistan",
            "Palau",
            "Panama",
            "Papal States",
            "Papua New Guinea",
            "Paraguay",
            "Peru",
            "Philippines",
            "Piedmont-Sardinia",
            "Poland",
            "Portugal",
            "Qatar",
            "Republic of Genoa",
            "Republic of Korea (South Korea)",
            "Republic of the Congo",
            "Romania",
            "Russia",
            "Rwanda",
            "Saint Kitts and Nevis",
            "Saint Lucia",
            "Saint Vincent and the Grenadines",
            "Samoa",
            "San Marino",
            "Sao Tome and Principe",
            "Saudi Arabia",
            "Schaumburg-Lippe",
            "Senegal",
            "Serbia",
            "Seychelles",
            "Sierra Leone",
            "Singapore",
            "Slovakia",
            "Slovenia",
            "Solomon Islands, The",
            "Somalia",
            "South Africa",
            "South Sudan",
            "Spain",
            "Sri Lanka",
            "Sudan",
            "Suriname",
            "Sweden",
            "Switzerland",
            "Syria",
            "Tajikistan",
            "Tanzania",
            "Texas",
            "Thailand",
            "Timor-Leste",
            "Togo",
            "Tonga",
            "Trinidad and Tobago",
            "Tunisia",
            "Turkey",
            "Turkmenistan",
            "Tuvalu",
            "Two Sicilies",
            "Uganda",
            "Ukraine",
            "Union of Soviet Socialist Republics",
            "United Arab Emirates, The",
            "United Kingdom, The",
            "Uruguay",
            "Uzbekistan",
            "Vanuatu",
            "Venezuela",
            "Vietnam",
            "Württemberg",
            "Yemen",
            "Zambia",
            "Zimbabwe"])
        || !in_array($data->language, [ // language
            "Mandarin Chinese",
            "Spanish",
            "English",
            "Hindi",
            "Bengali",
            "Portuguese",
            "Russian",
            "Japanese",
            "Yue Chinese",
            "Vietnamese",
            "Turkish",
            "Wu Chinese",
            "Marathi",
            "Telugu",
            "Western Punjabi",
            "Korean",
            "Tamil",
            "Egyptian",
            "Standard",
            "French",
            "Urdu",
            "Javanese",
            "Italian",
            "Iranian Persian",
            "Gujarati",
            "Hausa",
            "Bhojpuri",
            "Levantine Arabic",
            "Southern Min"])
        || !preg_match("/^UTC[+-](1[0-2]|[1-9])(:(0[0-9]|[1-5][0-9]))?$/", $data->timezone) // timezone
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