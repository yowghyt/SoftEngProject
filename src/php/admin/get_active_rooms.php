<?php
// src/php/admin/get_active_rooms.php

// Turn off error display
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Try different paths for the config file
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
        'success' => false,
        'message' => 'Database config file not found'
    ]);
    exit;
}

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();

    // Auto-complete room reservations that have ended:
    // If a reservation is still 'Approved' but its date is before today,
    // or it is today and endTime <= now, mark it as 'Completed'.
    $autoUpdateSql = "UPDATE roomreservation SET status = 'Completed' 
        WHERE status = 'Approved' AND (date < CURDATE() OR (date = CURDATE() AND endTime <= CURTIME()))";
    $conn->query($autoUpdateSql);

    // Also sync the corresponding request rows to 'Completed' for room requests
    $syncRequestsSql = "UPDATE request rq 
        JOIN roomreservation rr ON rq.reservationId = rr.reservationId 
        SET rq.status = 'Completed' 
        WHERE rr.status = 'Completed' AND rq.requestType = 'room' AND rq.status != 'Completed'";
    $conn->query($syncRequestsSql);

    $query = "
        SELECT 
            rr.reservationId,
            r.roomName,
            CONCAT(u.fname, ' ', u.lname) as userName,
            u.idNumber,
            rr.startTime,
            rr.endTime,
            rr.date,
            rr.status,
            rr.capacityUsed,
            r.capacity,
            CASE 
                WHEN rr.date = CURDATE() 
                    AND CURTIME() BETWEEN rr.startTime AND rr.endTime 
                    THEN 'Active'
                WHEN rr.date = CURDATE() 
                    AND CURTIME() < rr.startTime 
                    THEN 'Upcoming'
                WHEN rr.date > CURDATE() 
                    THEN 'Upcoming'
                ELSE rr.status
            END as actualStatus
        FROM roomreservation rr
        JOIN room r ON rr.roomId = r.roomId
        JOIN users u ON rr.userId = u.userId
        WHERE rr.status = 'Approved'
        AND rr.date >= CURDATE()
        ORDER BY rr.date ASC, rr.startTime ASC
    ";

    $result = $conn->query($query);
    $rooms = [];

    while ($row = $result->fetch_assoc()) {
        $rooms[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $rooms
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching active rooms: ' . $e->getMessage()
    ]);
}
