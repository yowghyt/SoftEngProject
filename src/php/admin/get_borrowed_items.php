<?php
// src/php/admin/get_borrowed_items.php

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

    $query = "
        SELECT 
            er.reservationId,
            er.equipmentId,
            e.equipmentName,
            CONCAT(u.fname, ' ', u.lname) as borrowerName,
            u.idNumber,
            er.dueDate,
            er.status,
            er.date as borrowDate,
            CASE 
                WHEN er.dueDate < CURDATE() AND er.status = 'Approved' THEN 'Overdue'
                ELSE er.status
            END as actualStatus
        FROM equipmentreservation er
        JOIN equipment e ON er.equipmentId = e.equipmentId
        JOIN users u ON er.userId = u.userId
        WHERE er.status = 'Approved'
        ORDER BY er.dueDate ASC
    ";

    $result = $conn->query($query);
    $items = [];

    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $items
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching borrowed items: ' . $e->getMessage()
    ]);
}
