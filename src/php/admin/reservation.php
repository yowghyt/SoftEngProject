<?php
// src/php/admin/reservation.php

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// Load DB config with fallback paths
$config_paths = [
    __DIR__ . '/../config/db_connect.php',
    __DIR__ . '/../../config/db_connect.php',
    '../config/db_connect.php'
];

$config_loaded = false;
foreach ($config_paths as $path) {
    if (file_exists($path)) {
        require_once $path;
        $config_loaded = true;
        break;
    }
}

if (!$config_loaded) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database config not found'
    ]);
    exit;
}

$action = $_GET['action'] ?? null;

if ($action === "get_all_done_reservations") {
    getAllDoneReservations();
    exit;
}

echo json_encode([
    'status' => 'error',
    'message' => 'Invalid action'
]);


function getAllDoneReservations() {
    try {
        $db = Database::getInstance();
        $conn = $db->getConnection();

        // HISTORY = already ended reservations
  $query = "
    SELECT 
        rr.reservationId AS reservation_id,
        r.roomName AS room,
        CONCAT(u.fname, ' ', u.lname, ' (', u.idNumber, ')') AS name,
        rr.status AS status,
        rr.date AS date,
        rr.startTime AS start_time,
        rr.endTime AS end_time

    FROM roomreservation rr
    JOIN room r ON rr.roomId = r.roomId
    JOIN users u ON rr.userId = u.userId

    WHERE 
        (
            rr.status = 'Completed'
            OR (
                rr.status = 'Approved'
                AND (
                    rr.date < CURDATE() 
                    OR (rr.date = CURDATE() AND rr.endTime < CURTIME())
                )
            )
        )

    ORDER BY rr.date DESC, rr.endTime DESC
";


        $result = $conn->query($query);

        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        echo json_encode([
            'status' => 'success',
            'data' => $data
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Error fetching history: ' . $e->getMessage()
        ]);
    }
}
