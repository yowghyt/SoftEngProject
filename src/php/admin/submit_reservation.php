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
// submitRoomReservation now returns the new reservationId on success
$reservationId = submitRoomReservation($conn, (int)$userId, (int)$roomId, $date, $start, $end, (int)$people, $purpose);

if ($reservationId) {
    // Safety: ensure a corresponding request row exists (some paths may have skipped it)
    $check = $conn->prepare("SELECT requestId FROM request WHERE reservationId = ? AND requestType = 'room' LIMIT 1");
    $check->bind_param('i', $reservationId);
    $check->execute();
    $res = $check->get_result();
    $exists = $res->fetch_assoc();
    $check->close();

    if (!$exists) {
        $ins = $conn->prepare("INSERT INTO request (userId, reservationId, requestType, status) VALUES (?, ?, 'room', 'Pending')");
        // we need the userId again; use the passed POST value
        $ins->bind_param('ii', $userId, $reservationId);
        $ins->execute();
        $ins->close();
    }

    echo json_encode(["success" => true, "reservationId" => $reservationId]);
}
