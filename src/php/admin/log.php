<?php

/**
 * log.php
 * 
 * Handles lab entry logs for BYOD and Knowledge Center
 */

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../config/db_connect.php';

$conn = Database::getInstance()->getConnection();
$data = json_decode(file_get_contents("php://input"), true);

$action = $data['action'] ?? $_GET['action'] ?? '';

switch ($action) {
    case 'get_all_logs':
        getAllLogs($conn);
        break;
    case 'get_byod_logs':
        getBYODLogs($conn);
        break;
    case 'get_kc_logs':
        getKnowledgeCenterLogs($conn);
        break;
    case 'get_active_users':
        getActiveUsers($conn);
        break;
    case 'get_statistics':
        getStatistics($conn);
        break;
    case 'export_excel':
        exportToExcel($conn);
        break;
    default:
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
        break;
}

// ==================== GET ALL LOGS ====================
function getAllLogs($conn)
{
    $sql = "
        SELECT 
            b.idLog,
            b.userId,
            u.idNumber,
            CONCAT(u.fname, ' ', u.lname) as studentName,
            b.date,
            b.timeIn,
            b.roomName,
            'BYOD Lab' as labType
        FROM BYODlog b
        INNER JOIN users u ON b.userId = u.userId
        
        UNION ALL
        
        SELECT 
            k.idLog,
            k.userId,
            u.idNumber,
            CONCAT(u.fname, ' ', u.lname) as studentName,
            k.date,
            k.timeIn,
            k.roomName,
            'Knowledge Center' as labType
        FROM KnowledgeCenterlog k
        INNER JOIN users u ON k.userId = u.userId
        
        ORDER BY date DESC, timeIn DESC
        LIMIT 100
    ";

    $result = $conn->query($sql);

    if ($result) {
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        echo json_encode([
            "status" => "success",
            "data" => $logs,
            "count" => count($logs)
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to fetch logs: " . $conn->error
        ]);
    }
}

// ==================== GET BYOD LOGS ====================
function getBYODLogs($conn)
{
    $sql = "
        SELECT 
            b.idLog,
            b.userId,
            u.idNumber,
            CONCAT(u.fname, ' ', u.lname) as studentName,
            b.date,
            b.timeIn,
            b.roomName
        FROM BYODlog b
        INNER JOIN users u ON b.userId = u.userId
        ORDER BY b.date DESC, b.timeIn DESC
        LIMIT 50
    ";

    $result = $conn->query($sql);

    if ($result) {
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        echo json_encode([
            "status" => "success",
            "data" => $logs,
            "count" => count($logs)
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to fetch BYOD logs: " . $conn->error
        ]);
    }
}

// ==================== GET KNOWLEDGE CENTER LOGS ====================
function getKnowledgeCenterLogs($conn)
{
    $sql = "
        SELECT 
            k.idLog,
            k.userId,
            u.idNumber,
            CONCAT(u.fname, ' ', u.lname) as studentName,
            k.date,
            k.timeIn,
            k.roomName
        FROM KnowledgeCenterlog k
        INNER JOIN users u ON k.userId = u.userId
        ORDER BY k.date DESC, k.timeIn DESC
        LIMIT 50
    ";

    $result = $conn->query($sql);

    if ($result) {
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        echo json_encode([
            "status" => "success",
            "data" => $logs,
            "count" => count($logs)
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to fetch Knowledge Center logs: " . $conn->error
        ]);
    }
}

// ==================== GET ACTIVE USERS ====================
function getActiveUsers($conn)
{

    $today = date('Y-m-d');

    $sql = "
        SELECT 
            b.idLog,
            b.userId,
            u.idNumber,
            CONCAT(u.fname, ' ', u.lname) as studentName,
            b.date,
            b.timeIn,
            b.roomName,
            'BYOD Lab' as labType
        FROM BYODlog b
        INNER JOIN users u ON b.userId = u.userId
        WHERE b.date = '$today' /* ONLY TODAY'S BYOD LOGS */
        
        UNION ALL
        
        SELECT 
            k.idLog,
            k.userId,
            u.idNumber,
            CONCAT(u.fname, ' ', u.lname) as studentName,
            k.date,
            k.timeIn,
            k.roomName,
            'Knowledge Center' as labType
        FROM KnowledgeCenterlog k
        INNER JOIN users u ON k.userId = u.userId
        WHERE k.date = '$today' /* ONLY TODAY'S KC LOGS */
        
        ORDER BY date DESC, timeIn DESC
    ";

    $result = $conn->query($sql);

    if ($result) {
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        echo json_encode([
            "status" => "success",
            "data" => $logs,
            "count" => count($logs)
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to fetch active users: " . $conn->error
        ]);
    }
}

// ==================== GET STATISTICS ====================
// ==================== GET STATISTICS ====================
function getStatistics($conn)
{
    $today = date('Y-m-d');
    
    // Count BYOD entries today
    $byodInsideQuery = "SELECT COUNT(*) as count FROM BYODlog WHERE date = '$today'";
    $byodInsideResult = $conn->query($byodInsideQuery);
    $byodInside = $byodInsideResult ? $byodInsideResult->fetch_assoc()['count'] : 0;

    // Count Knowledge Center entries today
    $kcInsideQuery = "SELECT COUNT(*) as count FROM KnowledgeCenterlog WHERE date = '$today'";
    $kcInsideResult = $conn->query($kcInsideQuery);
    $kcInside = $kcInsideResult ? $kcInsideResult->fetch_assoc()['count'] : 0;

    // Count total entries today (both labs combined)
    $totalToday = $byodInside + $kcInside;

    echo json_encode([
        "status" => "success",
        "data" => [
            "byod_inside" => (int)$byodInside,
            "kc_inside" => (int)$kcInside,
            "total_today" => (int)$totalToday
        ]
    ]);
}

// ==================== EXPORT TO EXCEL ====================
function exportToExcel($conn)
{
    // Set headers for CSV download
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=lab_logs_' . date('Y-m-d') . '.csv');

    // Create output stream
    $output = fopen('php://output', 'w');

    // Add CSV headers
    fputcsv($output, ['Log ID', 'Student ID', 'Student Name', 'Lab Type', 'Room', 'Date', 'Time In']);

    // Get all logs
    $sql = "
        SELECT 
            b.idLog,
            u.idNumber,
            CONCAT(u.fname, ' ', u.lname) as studentName,
            'BYOD Lab' as labType,
            b.roomName,
            b.date,
            b.timeIn
        FROM BYODlog b
        INNER JOIN users u ON b.userId = u.userId
        
        UNION ALL
        
        SELECT 
            k.idLog,
            u.idNumber,
            CONCAT(u.fname, ' ', u.lname) as studentName,
            'Knowledge Center' as labType,
            k.roomName,
            k.date,
            k.timeIn
        FROM KnowledgeCenterlog k
        INNER JOIN users u ON k.userId = u.userId
        
        ORDER BY date DESC, timeIn DESC
    ";

    $result = $conn->query($sql);

    if ($result) {
        while ($row = $result->fetch_assoc()) {

            $logPrefix = ($row['labType'] == 'BYOD Lab') ? 'BYOD' : 'KC';

            fputcsv($output, [
                $logPrefix . '-' . str_pad($row['idLog'], 3, '0', STR_PAD_LEFT),
                $row['idNumber'],
                $row['studentName'],
                $row['labType'],
                $row['roomName'],
                $row['date'],
                $row['timeIn'],
            ]);
        }
    }

    fclose($output);
    exit;
}
