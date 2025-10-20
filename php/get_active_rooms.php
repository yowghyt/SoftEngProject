<?php
header('Content-Type: application/json');
include 'db_connect.php'; // adjust path if needed

$sql = "SELECT 
            r.roomId,
            r.roomName,
            u.idNumber AS studentId,
            CONCAT(u.fname, ' ', u.lname) AS reserverName,
            rr.date,
            rr.startTime,
            rr.endTime,
            rr.capacityUsed,
            rr.status
        FROM roomreservation rr
        JOIN users u ON rr.userId = u.userId
        JOIN room r ON rr.roomId = r.roomId";

$result = $conn->query($sql);

$activeRooms = [];
while ($row = $result->fetch_assoc()) {
    $activeRooms[] = $row;
}

echo json_encode($activeRooms);
?>
