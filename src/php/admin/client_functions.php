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
require_once __DIR__ . '/../config/db_connect.php';

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
        ORDER BY equipmentName DESC
    ";
    $result = $conn->query($sql);
     $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
    return $items;
}

/**
 * Fetch all available rooms for reservation
 */
function fetchAvailableRooms($conn) {
    $sql = "
        SELECT roomId, roomName, status, capacity, building, floor, equipment, description
        FROM room
        WHERE status = 'Available'
        ORDER BY roomName ASC
    ";
    $result = $conn->query($sql);
    if (!$result) return [];

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
        $stmt = $conn->prepare("
            INSERT INTO equipmentreservation 
    (reservationId, userId, equipmentId, date, startTime, endTime, dueDate, status, purpose)
VALUES 
    (NULL, ?, ?, CURDATE(), CURTIME(), CURTIME(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 'Pending', ?)
        ");
        if (!$stmt) {
            throw new Exception('Prepare failed (reservation): ' . $conn->error);
        }
        $stmt->bind_param('iiis', $userId, $equipmentId, $duration, $purpose);
        if (!$stmt->execute()) {
            throw new Exception('Execute failed (reservation): ' . $stmt->error);
        }
        $reservationId = $conn->insert_id;
        $stmt2 = $conn->prepare("
            INSERT INTO request (userId, reservationId, requestType, status)
            VALUES (?, ?, 'equipment', 'Pending')
        ");
        if (!$stmt2) {
            throw new Exception('Prepare failed (request): ' . $conn->error);
        }
        $stmt2->bind_param('ii', $userId, $reservationId);
        if (!$stmt2->execute()) {
            throw new Exception('Execute failed (request): ' . $stmt2->error);
        }
        $conn->commit();
        return true;

    } catch (Exception $e) {
        $conn->rollback();

        echo json_encode([
            "success" => false,
            "error" => $e->getMessage()
        ]);
        exit;
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
        $stmt = $conn->prepare("
            INSERT INTO roomreservation
                (userId, roomId, date, startTime, endTime, capacityUsed, status, purpose)
            VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?)
        ");
        if (!$stmt) {
            throw new Exception('Prepare failed (roomreservation): ' . $conn->error);
        }
        $stmt->bind_param('iisssis', $userId, $roomId, $date, $start, $end, $people, $purpose);

        if (!$stmt->execute()) {
            throw new Exception('Execute failed (roomreservation): ' . $stmt->error);
        }

        $reservationId = $conn->insert_id;

        $stmt2 = $conn->prepare("
            INSERT INTO request (userId, reservationId, requestType, status)
            VALUES (?, ?, 'room', 'Pending')
        ");
        if (!$stmt2) {
            throw new Exception('Prepare failed (request): ' . $conn->error);
        }

        $stmt2->bind_param('ii', $userId, $reservationId);

        if (!$stmt2->execute()) {
            throw new Exception('Execute failed (request): ' . $stmt2->error);
        }

        $conn->commit();
        return true;

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode([
            "success" => false,
            "error" => $e->getMessage()
        ]);
        exit;
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


/**
 * Look for student details by ID number or name
 */
function lookupStudent($conn, $query) {
    $sql = "
        SELECT userId, idNumber, fname, lname
        FROM users
        WHERE idNumber = ?
           OR fname LIKE ?
           OR lname LIKE ?
        LIMIT 1
    ";

    $stmt = $conn->prepare($sql);
    $like = "%$query%";
    $stmt->bind_param("sss", $query, $like, $like);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        return [
            "userId" => $row["userId"],
             "idNumber" => $row["idNumber"],
            "fullname" => $row["fname"] . " " . $row["lname"]
        ];
    }

    return null;
}
?>