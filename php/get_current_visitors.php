<?php
header('Content-Type: application/json');
include __DIR__ . '/db_connect.php';

date_default_timezone_set('Asia/Manila');
$today = date('Y-m-d');

// Fetch today's entries from openlablog
$sql = "
    SELECT 
        o.idLog,
        u.idNumber AS studentId,
        CONCAT(u.fname, ' ', u.lname) AS name,
        o.timeIn,
        o.purpose
    FROM openlablog o
    JOIN users u ON o.userId = u.userId
    WHERE o.date = ?
    ORDER BY o.timeIn ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $today);
$stmt->execute();
$result = $stmt->get_result();

$visitors = [];
while ($row = $result->fetch_assoc()) {
    $visitors[] = [
        'logId' => $row['idLog'],
        'studentId' => $row['studentId'],
        'name' => $row['name'],
        'timeIn' => $row['timeIn'],
        'purpose' => $row['purpose'],
        'status' => 'Inside' // no timeOut column yet
    ];
}

echo json_encode($visitors);
