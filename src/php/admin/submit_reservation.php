<?php
header('Content-Type: application/json');
require_once 'client_functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "error" => "Invalid request method"]);
    exit;
}

$userId  = $_POST['userId']  ?? null;
$roomId  = $_POST['roomId']  ?? null;
$date    = $_POST['date']    ?? null;
$start   = $_POST['start']   ?? null;
$end     = $_POST['end']     ?? null;
$people  = $_POST['people']  ?? null;
$purpose = $_POST['purpose'] ?? null;

if (!$userId || !$roomId || !$date || !$start || !$end || !$people) {
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

// call the function; on failure it will already echo an error JSON and exit
$success = submitRoomReservation($conn, (int)$userId, (int)$roomId, $date, $start, $end, (int)$people, $purpose);

if ($success === true) {
    echo json_encode(["success" => true]);
}
