<?php

function connect($HOST, $USERNAME, $PASSWORD, $NAME) {
    $db = new mysqli($HOST, $USERNAME, $PASSWORD, $NAME); 
    //host = localhost; username & password = ubit name & person number; name = database
    return $db;
}