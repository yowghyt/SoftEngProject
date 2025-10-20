<?php
/*
Database connection
*/
$servername = "localhost";
$username = "root"; 
$password = "";
$dbname = "custodian_db"; 

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
