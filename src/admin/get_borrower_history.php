<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db_connect.php';

$conn = Database::getInstance()->getConnection();

date_default_timezone_set('Asia/Manila');
$today = date('Y-m-d');

$sql = "
    SELECT 
        u.userId,
        u.idNumber AS studentId,
        CONCAT(u.fname, ' ', u.lname) AS borrowerName,
        COUNT(er.reservationId) AS totalBorrows,
        e.equipmentName,
        er.status,
        er.dueDate
    FROM equipmentreservation er
    JOIN users u ON er.userId = u.userId
    JOIN equipment e ON er.equipmentId = e.equipmentId
    GROUP BY u.userId, e.equipmentName, er.status, er.dueDate
    ORDER BY u.userId ASC;
";

$result = $conn->query($sql);
$borrowers = [];

while ($row = $result->fetch_assoc()) {
    $status = $row['status'];

    // If due date is before today and not returned, mark delinquent
    if ($row['dueDate'] < $today && strtolower($status) !== 'returned') {
        $status = 'Delinquent';
    }

    $borrowers[] = [
        'borrowerId' => sprintf('#BOR-%03d', $row['userId']),
        'studentId' => $row['studentId'],
        'name' => $row['borrowerName'],
        'totalBorrows' => $row['totalBorrows'],
        'itemBorrowed' => $row['equipmentName'],
        'status' => $status,
        'dueDate' => $row['dueDate']
    ];
}

echo json_encode($borrowers);
?>
