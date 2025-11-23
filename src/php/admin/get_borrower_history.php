<?php
// src/php/admin/get_borrower_history.php

// Turn off error display for security
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

    // Count all reservations for totalBorrows and use the latest reservation date for lastBorrowed
    $query = "
        SELECT 
            u.userId,
            u.idNumber,
            CONCAT(u.fname, ' ', u.lname) AS fullName,
            COUNT(er.reservationId) AS totalBorrows,
            COUNT(CASE WHEN er.status = 'Approved' AND er.dueDate >= CURDATE() THEN 1 END) AS currentBorrows,
            MAX(er.date) AS lastBorrowed
        FROM users u
        LEFT JOIN equipmentreservation er ON u.userId = er.userId
        GROUP BY u.userId, u.idNumber, u.fname, u.lname
        ORDER BY totalBorrows DESC
    ";

    $result = $conn->query($query);
    $borrowers = [];

    while ($row = $result->fetch_assoc()) {
        // Get currently borrowed items (only Approved and not overdue)
        $itemQuery = "
            SELECT e.equipmentName 
            FROM equipmentreservation er
            JOIN equipment e ON er.equipmentId = e.equipmentId
            WHERE er.userId = ? 
              AND er.status = 'Approved' 
              AND er.dueDate >= CURDATE()
        ";

        $stmt = $conn->prepare($itemQuery);
        $stmt->bind_param('i', $row['userId']);
        $stmt->execute();
        $itemResult = $stmt->get_result();

        $items = [];
        while ($item = $itemResult->fetch_assoc()) {
            $items[] = $item['equipmentName'];
        }
        $stmt->close();

        $row['currentItems'] = implode(', ', $items);

        $borrowers[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $borrowers
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching borrower history: ' . $e->getMessage()
    ]);
}
