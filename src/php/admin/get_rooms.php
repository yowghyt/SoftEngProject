<?php
header("Content-Type: application/json");
require_once "client_functions.php";

$rooms = fetchAvailableRooms($conn);

echo json_encode($rooms);
