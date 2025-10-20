<?php
include 'db_connect.php';

$sql = "SELECT 
        e.equipmentId,
        e.equipmentName,
        u.idNumber AS studentId,
        CONCAT(u.fname, ' ', u.lname) AS borrowerName,
        er.date AS borrowedDate,
        er.dueDate,
        er.status
    FROM equipmentreservation er
    JOIN users u ON er.userId = u.userId
    JOIN equipment e ON er.equipmentId = e.equipmentId";

$result = $conn->query($sql);

$data = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}
echo json_encode($data);
$conn->close();
?>
