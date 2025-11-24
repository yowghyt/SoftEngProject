<?php
header('Content-Type: application/json');
require_once 'client_functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "error" => "Invalid request method"]);
    exit;
}

// Accept either application/x-www-form-urlencoded or JSON body
// For this app we expect form-encoded.
$userId     = $_POST['userId'] ?? null;
$equipmentId= $_POST['equipmentId'] ?? null;
$duration   = $_POST['duration'] ?? null;
$purpose    = $_POST['purpose'] ?? null;

// basic validation
if (!$userId || !$equipmentId || !$duration || !$purpose) {
    echo json_encode(["success" => false, "error" => "Missing fields"]);
    exit;
}

// call the function; it will echo error JSON and exit on failure
$reservationId = submitBorrowRequest($conn, (int)$userId, (int)$equipmentId, (int)$duration, $purpose);

if ($reservationId) {
    echo json_encode(["success" => true, "reservationId" => $reservationId]);
}
?>
