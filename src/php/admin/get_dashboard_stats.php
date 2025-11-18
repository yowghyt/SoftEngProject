<?php

/**
 * get_dashboard_stats.php
 * Fetch dashboard statistics from database
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/../config/db_connect.php';

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();

    $stats = [];

    // Total Items and Available Items
    $result = $conn->query("
        SELECT 
            SUM(quantity) as total, 
            SUM(available) as available 
        FROM equipment
    ");
    $row = $result->fetch_assoc();
    $stats['totalItems'] = (int)($row['total'] ?? 0);
    $stats['availableItems'] = (int)($row['available'] ?? 0);
    $stats['borrowedItems'] = $stats['totalItems'] - $stats['availableItems'];

    // Active Borrowers (users with approved equipment reservations)
    $result = $conn->query("
        SELECT COUNT(DISTINCT er.userId) as active
        FROM equipmentreservation er
        WHERE er.status = 'Approved' 
    ");
    $row = $result->fetch_assoc();
    $stats['activeBorrowers'] = (int)($row['active'] ?? 0);

    // Total registered users
    $result = $conn->query("SELECT COUNT(*) as total FROM users");
    $row = $result->fetch_assoc();
    $stats['totalUsers'] = (int)($row['total'] ?? 0);

    // Room Reservations Today
    $result = $conn->query("
        SELECT COUNT(*) as count 
        FROM roomreservation 
        WHERE date = CURDATE() 
        AND status IN ('Approved', 'In Use')
    ");
    $row = $result->fetch_assoc();
    $stats['roomReservationsToday'] = (int)($row['count'] ?? 0);

    // Overdue Items
    $result = $conn->query("
        SELECT COUNT(*) as overdue 
        FROM equipmentreservation 
        WHERE status = 'Approved' 
        AND dueDate < CURDATE()
    ");
    $row = $result->fetch_assoc();
    $stats['overdueItems'] = (int)($row['overdue'] ?? 0);

    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching dashboard stats: ' . $e->getMessage()
    ]);
}
