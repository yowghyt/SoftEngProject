<?php

/**
 * pending_requests.php
 * 
 * Handles fetching and managing pending equipment and room reservations
 */

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../config/db_connect.php';

$conn = Database::getInstance()->getConnection();
$data = json_decode(file_get_contents("php://input"), true);

$action = $data['action'] ?? $_GET['action'] ?? '';

switch ($action) {
    case 'get_equipment_requests':
        getEquipmentRequests($conn);
        break;
    case 'get_room_requests':
        getRoomRequests($conn);
        break;
    case 'approve_equipment':
        approveEquipmentRequest($conn, $data);
        break;
    case 'reject_equipment':
        rejectEquipmentRequest($conn, $data);
        break;
    case 'approve_room':
        approveRoomRequest($conn, $data);
        break;
    case 'reject_room':
        rejectRoomRequest($conn, $data);
        break;
    case 'get_request_details':
        getRequestDetails($conn, $data);
        break;
    default:
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
        break;
}

// ==================== EQUIPMENT REQUESTS ====================

function getEquipmentRequests($conn)
{
    $sql = "SELECT 
                er.reservationId,
                er.userId,
                u.idNumber,
                CONCAT(u.fname, ' ', u.lname) as studentName,
                e.equipmentName,
                er.date as requestedDate,
                er.startTime,
                er.endTime,
                er.dueDate,
                er.purpose,
                er.status
            FROM equipmentreservation er
            INNER JOIN users u ON er.userId = u.userId
            INNER JOIN equipment e ON er.equipmentId = e.equipmentId
            WHERE er.status = 'Pending'
            ORDER BY er.date DESC";

    $result = $conn->query($sql);

    if ($result) {
        $requests = [];
        while ($row = $result->fetch_assoc()) {
            $requests[] = $row;
        }
        echo json_encode([
            "status" => "success",
            "data" => $requests,
            "count" => count($requests)
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to fetch equipment requests: " . $conn->error
        ]);
    }
}

function approveEquipmentRequest($conn, $data)
{
    $reservationId = $data['reservationId'] ?? 0;

    if (!$reservationId) {
        echo json_encode(["status" => "error", "message" => "Reservation ID required"]);
        return;
    }

    $stmt = $conn->prepare("UPDATE equipmentreservation SET status = 'Approved' WHERE reservationId = ?");
    $stmt->bind_param("i", $reservationId);

    if ($stmt->execute()) {
        // Keep the request table in sync (if a request row exists for this reservation)
        $sync = $conn->prepare("UPDATE request SET status = 'Approved' WHERE reservationId = ? AND requestType = 'equipment'");
        $sync->bind_param("i", $reservationId);
        $sync->execute();
        $sync->close();
        echo json_encode([
            "status" => "success",
            "message" => "Equipment request approved successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to approve request: " . $stmt->error
        ]);
    }

    $stmt->close();
}

function rejectEquipmentRequest($conn, $data)
{
    $reservationId = $data['reservationId'] ?? 0;

    if (!$reservationId) {
        echo json_encode(["status" => "error", "message" => "Reservation ID required"]);
        return;
    }

    $stmt = $conn->prepare("UPDATE equipmentreservation SET status = 'Rejected' WHERE reservationId = ?");
    $stmt->bind_param("i", $reservationId);

    if ($stmt->execute()) {
        // Keep the request table in sync (if a request row exists for this reservation)
        $sync = $conn->prepare("UPDATE request SET status = 'Rejected' WHERE reservationId = ? AND requestType = 'equipment'");
        $sync->bind_param("i", $reservationId);
        $sync->execute();
        $sync->close();
        echo json_encode([
            "status" => "success",
            "message" => "Equipment request rejected"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to reject request: " . $stmt->error
        ]);
    }

    $stmt->close();
}

// ==================== ROOM REQUESTS ====================

function getRoomRequests($conn)
{
    $sql = "SELECT 
                rr.reservationId,
                rr.userId,
                u.idNumber,
                CONCAT(u.fname, ' ', u.lname) as studentName,
                r.roomName,
                rr.date,
                rr.startTime,
                rr.endTime,
                rr.capacityUsed as attendees,
                rr.purpose,
                rr.status
            FROM roomreservation rr
            INNER JOIN users u ON rr.userId = u.userId
            INNER JOIN room r ON rr.roomId = r.roomId
            WHERE rr.status = 'Pending'
            ORDER BY rr.date DESC";

    $result = $conn->query($sql);

    if ($result) {
        $requests = [];
        while ($row = $result->fetch_assoc()) {
            $requests[] = $row;
        }
        echo json_encode([
            "status" => "success",
            "data" => $requests,
            "count" => count($requests)
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to fetch room requests: " . $conn->error
        ]);
    }
}

function approveRoomRequest($conn, $data)
{
    $reservationId = $data['reservationId'] ?? 0;

    if (!$reservationId) {
        echo json_encode(["status" => "error", "message" => "Reservation ID required"]);
        return;
    }

    $stmt = $conn->prepare("UPDATE roomreservation SET status = 'Approved' WHERE reservationId = ?");
    $stmt->bind_param("i", $reservationId);

    if ($stmt->execute()) {
        // Keep the request table in sync (if a request row exists for this reservation)
        $sync = $conn->prepare("UPDATE request SET status = 'Approved' WHERE reservationId = ? AND requestType = 'room'");
        $sync->bind_param("i", $reservationId);
        $sync->execute();
        $sync->close();
        echo json_encode([
            "status" => "success",
            "message" => "Room request approved successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to approve request: " . $stmt->error
        ]);
    }

    $stmt->close();
}

function rejectRoomRequest($conn, $data)
{
    $reservationId = $data['reservationId'] ?? 0;

    if (!$reservationId) {
        echo json_encode(["status" => "error", "message" => "Reservation ID required"]);
        return;
    }

    $stmt = $conn->prepare("UPDATE roomreservation SET status = 'Rejected' WHERE reservationId = ?");
    $stmt->bind_param("i", $reservationId);

    if ($stmt->execute()) {
        // Keep the request table in sync (if a request row exists for this reservation)
        $sync = $conn->prepare("UPDATE request SET status = 'Rejected' WHERE reservationId = ? AND requestType = 'room'");
        $sync->bind_param("i", $reservationId);
        $sync->execute();
        $sync->close();
        echo json_encode([
            "status" => "success",
            "message" => "Room request rejected"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to reject request: " . $stmt->error
        ]);
    }

    $stmt->close();
}

// ==================== GET DETAILS ====================

function getRequestDetails($conn, $data)
{
    $reservationId = $data['reservationId'] ?? 0;
    $type = $data['type'] ?? 'equipment'; // 'equipment' or 'room'

    if (!$reservationId) {
        echo json_encode(["status" => "error", "message" => "Reservation ID required"]);
        return;
    }

    if ($type === 'equipment') {
        $sql = "SELECT 
                    er.*,
                    u.idNumber,
                    CONCAT(u.fname, ' ', u.lname) as studentName,
                    e.equipmentName,
                    e.quantity as availableQuantity
                FROM equipmentreservation er
                INNER JOIN users u ON er.userId = u.userId
                INNER JOIN equipment e ON er.equipmentId = e.equipmentId
                WHERE er.reservationId = ?";
    } else {
        $sql = "SELECT 
                    rr.*,
                    u.idNumber,
                    CONCAT(u.fname, ' ', u.lname) as studentName,
                    r.roomName,
                    r.capacity
                FROM roomreservation rr
                INNER JOIN users u ON rr.userId = u.userId
                INNER JOIN room r ON rr.roomId = r.roomId
                WHERE rr.reservationId = ?";
    }

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $reservationId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $details = $result->fetch_assoc();
        echo json_encode([
            "status" => "success",
            "data" => $details
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Request not found"
        ]);
    }

    $stmt->close();
}
