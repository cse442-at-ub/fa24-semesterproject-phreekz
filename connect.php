<?php

function connect($HOST, $USERNAME, $PASSWORD, $NAME) {
    $db = new mysqli($HOST, $USERNAME, $PASSWORD, $NAME);
    return $db;
}