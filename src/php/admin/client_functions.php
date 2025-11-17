<?php
/**
 * THIS FILE CONTAINS THE FUNCTIONS FOR CLIENT/STUDENT ACTIONS
 * 
 * - browse items
 *  + display available items
 *  + request borrow
 * 
 * - reserve rooms
 *  + reserve now
 * 
 * - display borrowed items
 * - display room reservations
 */


/**
 * EXAMPLE USAGE:
 * include 'client_functions.php';
 * $userId = 1; // Example logged-in student
 * $data = fetchUserBorrows($conn, $userId);
 * header('Content-Type: application/json');
 * echo json_encode($data);
 */
require_once __DIR__ . '../config/db_connect.php';

$conn = Database::getInstance()->getConnection();
/**
 * Fetch all available items for borrowing
 * Returns: array of associative rows
 */
function fetchAvailableItems($conn) {
    $sql = "
        SELECT equipmentId, equipmentName, category, status
        FROM equipment
        WHERE status = 'available'
        ORDER BY equipmentName ASC
    ";
    $result = $conn->query($sql);
    return $result->fetch_all(MYSQLI_ASSOC);
}

/**
 * Fetch all available rooms for reservation
 */
function fetchAvailableRooms($conn) {
    $sql = "
        SELECT roomId, roomName, roomCode, capacity, status
        FROM room
        WHERE status = 'available'
        ORDER BY roomName ASC
    ";
    $result = $conn->query($sql);
    return $result->fetch_all(MYSQLI_ASSOC);
}

/**
 * Submit a borrow request for an equipment item
 * @param int $userId - student's userId
 * @param int $equipmentId - equipmentId from the table
 * @param int $duration - number of days requested
 * @param string $purpose - text reason
 */
function submitBorrowRequest($conn, $userId, $equipmentId, $duration, $purpose) {
    $conn->begin_transaction();
    try {
        // Create an equipment reservation record
        $stmt = $conn->prepare("
            INSERT INTO equipmentreservation (userId, equipmentId, date, dueDate, status)
            VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 'Pending')
        ");
        $stmt->bind_param('iii', $userId, $equipmentId, $duration);
        $stmt->execute();
        $reservationId = $conn->insert_id;

        // Add corresponding request entry
        $stmt2 = $conn->prepare("
            INSERT INTO request (userId, reservationId, requestType, purpose, status)
            VALUES (?, ?, 'equipment', ?, 'Pending')
        ");
        $stmt2->bind_param('iis', $userId, $reservationId, $purpose);
        $stmt2->execute();

        $conn->commit();
        return true;
    } catch (Exception $e) {
        $conn->rollback();
        return false;
    }
}

/**
 * Get all borrow records for a given user (active and past)
 */
function fetchUserBorrows($conn, $userId) {
    $stmt = $conn->prepare("
        SELECT er.reservationId, e.equipmentName, e.equipmentId,
               er.date AS borrowDate, er.dueDate, er.status
        FROM equipmentreservation er
        JOIN equipment e ON er.equipmentId = e.equipmentId
        WHERE er.userId = ?
        ORDER BY er.date DESC
    ");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $rows = [];

    while ($row = $result->fetch_assoc()) {
        $due = new DateTime($row['dueDate']);
        $today = new DateTime();
        $diff = (int)$today->diff($due)->format('%r%a');
        $row['days_left'] = $diff;
        $rows[] = $row;
    }

    return $rows;
}

/**
 * Submit a room reservation
 * @param int $userId
 * @param int $roomId
 * @param string $date (YYYY-MM-DD)
 * @param string $start (HH:MM)
 * @param string $end (HH:MM)
 * @param int $people - number of attendees
 * @param string $purpose - text reason
 */
function submitRoomReservation($conn, $userId, $roomId, $date, $start, $end, $people, $purpose) {
    $conn->begin_transaction();
    try {
        // Create room reservation
        $stmt = $conn->prepare("
            INSERT INTO roomreservation (userId, roomId, date, startTime, endTime, capacityUsed, status)
            VALUES (?, ?, ?, ?, ?, ?, 'Pending')
        ");
        $stmt->bind_param('iisssi', $userId, $roomId, $date, $start, $end, $people);
        $stmt->execute();
        $reservationId = $conn->insert_id;

        // Add corresponding request
        $stmt2 = $conn->prepare("
            INSERT INTO request (userId, reservationId, requestType, purpose, status)
            VALUES (?, ?, 'room', ?, 'Pending')
        ");
        $stmt2->bind_param('iis', $userId, $reservationId, $purpose);
        $stmt2->execute();

        $conn->commit();
        return true;
    } catch (Exception $e) {
        $conn->rollback();
        return false;
    }
}

/**
 * Get all room reservations for a user
 */
function fetchUserReservations($conn, $userId) {
    $stmt = $conn->prepare("
        SELECT rr.reservationId, r.roomName, r.roomCode,
               rr.date, rr.startTime, rr.endTime, rr.status
        FROM roomreservation rr
        JOIN room r ON rr.roomId = r.roomId
        WHERE rr.userId = ?
        ORDER BY rr.date DESC, rr.startTime DESC
    ");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_all(MYSQLI_ASSOC);
}

/**
 * Cancel a pending room reservation (before approval)
 */
function cancelReservation($conn, $reservationId) {
    $stmt = $conn->prepare("
        UPDATE roomreservation
        SET status = 'Cancelled'
        WHERE reservationId = ? AND status = 'Pending'
    ");
    $stmt->bind_param('i', $reservationId);
    return $stmt->execute();
}

/**
 * Fetch pending requests for the current user (both equipment + room)
 */
function fetchMyPendingRequests($conn, $userId) {
    $stmt = $conn->prepare("
        SELECT requestId, requestType, purpose, status, dateRequested
        FROM request
        WHERE userId = ? AND status = 'Pending'
        ORDER BY requestId DESC
    ");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_all(MYSQLI_ASSOC);
}
?>