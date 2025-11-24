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
    case 'return_equipment':
        returnEquipmentRequest($conn, $data);
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

    // 1. Get equipmentId from this reservation
    $stmt = $conn->prepare("SELECT equipmentId FROM equipmentreservation WHERE reservationId = ?");
    $stmt->bind_param("i", $reservationId);
    $stmt->execute();
    $equipmentRow = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$equipmentRow) {
        echo json_encode(["status" => "error", "message" => "Reservation not found"]);
        return;
    }

    $equipmentId = $equipmentRow['equipmentId'];
    // 2. Read current equipment availability and total quantity
    $stmt = $conn->prepare("SELECT available, quantity FROM equipment WHERE equipmentId = ?");
    $stmt->bind_param("i", $equipmentId);
    $stmt->execute();
    $equipRow = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$equipRow) {
        echo json_encode(["status" => "error", "message" => "Equipment not found"]);
        return;
    }

    $currentAvailable = (int)$equipRow['available'];
    $totalQuantity = (int)$equipRow['quantity'];

    // Normalize if available somehow exceeded quantity
    if ($currentAvailable > $totalQuantity) {
        $stmt = $conn->prepare("UPDATE equipment SET available = ? WHERE equipmentId = ?");
        $norm = $totalQuantity;
        $stmt->bind_param("ii", $norm, $equipmentId);
        $stmt->execute();
        $stmt->close();
        $currentAvailable = $totalQuantity;
    }

    if ($currentAvailable <= 0) {
        echo json_encode(["status" => "error", "message" => "No available items to approve"]);
        return;
    }

    // 3. Approve request in request table
    $sync = $conn->prepare("UPDATE request SET status = 'Approved' WHERE reservationId = ? AND requestType = 'equipment'");
    $sync->bind_param("i", $reservationId);
    $sync->execute();
    $sync->close();

    // 4. Approve equipment reservation
    $stmt = $conn->prepare("UPDATE equipmentreservation SET status = 'Approved' WHERE reservationId = ?");
    $stmt->bind_param("i", $reservationId);
    $stmt->execute();
    $stmt->close();

    // 5. Decrement available safely (ensure it does not go below 0)
    $newAvailable = $currentAvailable - 1;
    if ($newAvailable < 0) $newAvailable = 0;

    $stmt = $conn->prepare("UPDATE equipment SET available = ? WHERE equipmentId = ?");
    $stmt->bind_param("ii", $newAvailable, $equipmentId);
    $stmt->execute();
    $stmt->close();

    // 6. If quantity becomes 0 → mark as Borrowed/Unavailable
    if ($newAvailable === 0) {
        $stmt = $conn->prepare("UPDATE equipment SET status = 'Borrowed' WHERE equipmentId = ?");
        $stmt->bind_param("i", $equipmentId);
        $stmt->execute();
        $stmt->close();
    }

    echo json_encode([
        "status" => "success",
        "message" => "Equipment request approved & quantity updated"
    ]);
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

function returnEquipmentRequest($conn, $data)
{
    $reservationId = $data['reservationId'] ?? 0;

    if (!$reservationId) {
        echo json_encode(["status" => "error", "message" => "Reservation ID required"]);
        return;
    }
    // 1. Get equipmentId from this reservation
    $stmt = $conn->prepare("SELECT equipmentId FROM equipmentreservation WHERE reservationId = ?");
    $stmt->bind_param("i", $reservationId);
    $stmt->execute();
    $equipmentRow = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$equipmentRow) {
        echo json_encode(["status" => "error", "message" => "Reservation not found"]);
        return;
    }

    $equipmentId = $equipmentRow['equipmentId'];

    // 1b. Read current equipment availability and total quantity
    $stmt = $conn->prepare("SELECT available, quantity FROM equipment WHERE equipmentId = ?");
    $stmt->bind_param("i", $equipmentId);
    $stmt->execute();
    $equip = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$equip) {
        echo json_encode(["status" => "error", "message" => "Equipment not found"]);
        return;
    }

    $currentAvailable = (int)$equip['available'];
    $totalQuantity = (int)$equip['quantity'];

    // Calculate new available but ensure it does not exceed total quantity
    $newAvailable = $currentAvailable + 1;
    if ($newAvailable > $totalQuantity) {
        $newAvailable = $totalQuantity;
    }

    // Use transaction to ensure consistency
    $conn->begin_transaction();

    // 2. Mark reservation as Returned
    $stmt = $conn->prepare("UPDATE equipmentreservation SET status = 'Returned' WHERE reservationId = ?");
    $stmt->bind_param("i", $reservationId);
    $ok1 = $stmt->execute();
    $stmt->close();

    // 3. Update request row to Completed (if exists)
    $sync = $conn->prepare("UPDATE request SET status = 'Completed' WHERE reservationId = ? AND requestType = 'equipment'");
    $sync->bind_param("i", $reservationId);
    $ok2 = $sync->execute();
    $sync->close();

    // 4. Set equipment available to the capped value
    $stmt = $conn->prepare("UPDATE equipment SET available = ? WHERE equipmentId = ?");
    $stmt->bind_param("ii", $newAvailable, $equipmentId);
    $ok3 = $stmt->execute();
    $stmt->close();

    // 5. If available > 0, set equipment status to 'Available'
    $stmt = $conn->prepare("UPDATE equipment SET status = 'Available' WHERE equipmentId = ? AND available > 0");
    $stmt->bind_param("i", $equipmentId);
    $ok4 = $stmt->execute();
    $stmt->close();

    if ($ok1 && $ok2 && $ok3 && $ok4) {
        $conn->commit();
        echo json_encode([
            "status" => "success",
            "message" => "Equipment marked as returned and availability updated"
        ]);
    } else {
        $conn->rollback();
        echo json_encode([
            "status" => "error",
            "message" => "Failed to complete return."
        ]);
    }
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
