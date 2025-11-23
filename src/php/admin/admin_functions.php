<?php

/**
 * THIS FILE CONTAINS THE FUNCTIONS FOR ADMIN ACTIONS
 * 
 * - Lab Entry logs
 *  + view details
 *  + check out
 *  + filtering
 * 
 * - Pending requests
 *  + approve
 *  + reject
 *  + details
 * 
 * - Borrowers history and stats
 *  + view profile
 *  + history
 *  + warn //TODO: ano to
 *  + frequent borrowers
 *  + delinquent
 * 
 * - dashboard
 *  + total items
 *  + active borrowers
 *  + room reservations
 *  + overdue items
 */

/**
 * EXAMPLE USAGE:
 * include 'admin_functions.php';
 * $data = fetchBorrowedItems($conn);
 * header('Content-Type: application/json');
 * echo json_encode($data);
 */

require_once __DIR__ . '../config/db_connect.php';

$conn = Database::getInstance()->getConnection();

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo "Connected successfully!";
}

/**
 * Fetch all borrowed equipment with borrower details and due date info.
 * Returns: array of associative rows
 */
function fetchBorrowedItems($conn)
{
    $sql = "
        SELECT er.reservationId, er.userId, u.idNumber AS studentId,
               CONCAT(u.fname, ' ', u.lname) AS borrowerName,
               e.equipmentId, e.equipmentName, er.date AS borrowDate,
               er.dueDate, er.status
        FROM equipmentreservation er
        JOIN equipment e ON er.equipmentId = e.equipmentId
        JOIN users u ON er.userId = u.userId
        WHERE er.status = 'Approved'
        ORDER BY er.date DESC
    ";

    $result = $conn->query($sql);
    $items = [];

    while ($row = $result->fetch_assoc()) {
        $due = new DateTime($row['dueDate']);
        $today = new DateTime();
        $diff = (int)$today->diff($due)->format('%r%a'); // negative if overdue
        $row['days_left'] = $diff;
        $items[] = $row;
    }

    return $items;
}

/**
 * Fetch all active room reservations
 */
function fetchActiveRooms($conn)
{
    $sql = "
        SELECT rr.reservationId, rr.userId,
               CONCAT(u.fname, ' ', u.lname) AS reserverName,
               rr.date, rr.startTime, rr.endTime, rr.capacityUsed,
               rr.status, r.roomId, r.roomName
        FROM roomreservation rr
        JOIN room r ON rr.roomId = r.roomId
        JOIN users u ON rr.userId = u.userId
        WHERE rr.status IN ('Approved', 'Pending', 'In Use')
        ORDER BY rr.date ASC, rr.startTime ASC
    ";
    $result = $conn->query($sql);
    return $result->fetch_all(MYSQLI_ASSOC);
}

/**
 * Fetch borrower statistics (total equipment + room reservations)
 */
function fetchBorrowerStats($conn)
{
    $sql = "
        SELECT u.userId, CONCAT(u.fname, ' ', u.lname) AS name, u.idNumber,
               (SELECT COUNT(*) FROM equipmentreservation er WHERE er.userId = u.userId) AS total_equipment,
               (SELECT COUNT(*) FROM roomreservation rr WHERE rr.userId = u.userId) AS total_room
        FROM users u
        ORDER BY total_equipment DESC
        LIMIT 50
    ";
    $result = $conn->query($sql);
    return $result->fetch_all(MYSQLI_ASSOC);
}

/**
 * Fetch all pending requests (equipment or room)
 * @param string|null $type - 'equipment' | 'room' | null for all
 */
function fetchPendingRequests($conn, $type = null)
{
    if ($type) {
        $stmt = $conn->prepare("
            SELECT req.*, CONCAT(u.fname, ' ', u.lname) AS name
            FROM request req
            JOIN users u ON req.userId = u.userId
            WHERE req.status = 'Pending' AND req.requestType = ?
            ORDER BY req.requestId DESC
        ");
        $stmt->bind_param('s', $type);
    } else {
        $stmt = $conn->prepare("
            SELECT req.*, CONCAT(u.fname, ' ', u.lname) AS name
            FROM request req
            JOIN users u ON req.userId = u.userId
            WHERE req.status = 'Pending'
            ORDER BY req.requestId DESC
        ");
    }
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_all(MYSQLI_ASSOC);
}

/**
 * Approve a pending request (equipment or room)
 */
function approveRequest($conn, $requestId)
{
    $stmt = $conn->prepare("SELECT * FROM request WHERE requestId = ?");
    $stmt->bind_param('i', $requestId);
    $stmt->execute();
    $req = $stmt->get_result()->fetch_assoc();
    if (!$req) return false;

    $conn->begin_transaction();
    try {
        $update = $conn->prepare("UPDATE request SET status = 'Approved' WHERE requestId = ?");
        $update->bind_param('i', $requestId);
        $update->execute();

        if ($req['requestType'] === 'equipment') {
            $updateER = $conn->prepare("UPDATE equipmentreservation SET status = 'Approved' WHERE reservationId = ?");
            $updateER->bind_param('i', $req['reservationId']);
            $updateER->execute();
            // Ensure the corresponding request row (if any) is also synced by reservationId + type
            $syncReq = $conn->prepare("UPDATE request SET status = 'Approved' WHERE reservationId = ? AND requestType = 'equipment'");
            $syncReq->bind_param('i', $req['reservationId']);
            $syncReq->execute();
        } else if ($req['requestType'] === 'room') {
            $updateRR = $conn->prepare("UPDATE roomreservation SET status = 'Approved' WHERE reservationId = ?");
            $updateRR->bind_param('i', $req['reservationId']);
            $updateRR->execute();
            // Ensure the corresponding request row (if any) is also synced by reservationId + type
            $syncReq = $conn->prepare("UPDATE request SET status = 'Approved' WHERE reservationId = ? AND requestType = 'room'");
            $syncReq->bind_param('i', $req['reservationId']);
            $syncReq->execute();
        }

        $conn->commit();
        return true;
    } catch (Exception $e) {
        $conn->rollback();
        return false;
    }
}

/**
 * Reject a request (equipment or room)
 */
function rejectRequest($conn, $requestId, $reason = '')
{
    $stmt = $conn->prepare("SELECT * FROM request WHERE requestId = ?");
    $stmt->bind_param('i', $requestId);
    $stmt->execute();
    $req = $stmt->get_result()->fetch_assoc();
    if (!$req) return false;

    $conn->begin_transaction();
    try {
        $update = $conn->prepare("UPDATE request SET status = 'Rejected' WHERE requestId = ?");
        $update->bind_param('i', $requestId);
        $update->execute();

        if ($req['requestType'] === 'equipment') {
            $updateER = $conn->prepare("UPDATE equipmentreservation SET status = 'Rejected' WHERE reservationId = ?");
            $updateER->bind_param('i', $req['reservationId']);
            $updateER->execute();
                // Ensure the corresponding request row (if any) is also synced by reservationId + type
                $syncReq = $conn->prepare("UPDATE request SET status = 'Rejected' WHERE reservationId = ? AND requestType = 'equipment'");
                $syncReq->bind_param('i', $req['reservationId']);
                $syncReq->execute();
        } else if ($req['requestType'] === 'room') {
            $updateRR = $conn->prepare("UPDATE roomreservation SET status = 'Rejected' WHERE reservationId = ?");
            $updateRR->bind_param('i', $req['reservationId']);
            $updateRR->execute();
                // Ensure the corresponding request row (if any) is also synced by reservationId + type
                $syncReq = $conn->prepare("UPDATE request SET status = 'Rejected' WHERE reservationId = ? AND requestType = 'room'");
                $syncReq->bind_param('i', $req['reservationId']);
                $syncReq->execute();
        }

        $conn->commit();
        return true;
    } catch (Exception $e) {
        $conn->rollback();
        return false;
    }
}

/**
 * Mark an equipment reservation as returned
 */
function markReturned($conn, $reservationId)
{
    $stmt = $conn->prepare("UPDATE equipmentreservation SET status = 'Returned' WHERE reservationId = ?");
    $stmt->bind_param('i', $reservationId);
    return $stmt->execute();
}

/**
 * Fetch open lab logs
 */
function fetchOpenLabLog($conn)
{
    $sql = "
        SELECT ol.*, CONCAT(u.fname, ' ', u.lname) AS name, u.idNumber
        FROM openlablog ol
        JOIN users u ON ol.userId = u.userId
        ORDER BY ol.date DESC, ol.timeIn DESC
    ";
    $result = $conn->query($sql);
    return $result->fetch_all(MYSQLI_ASSOC);
}

/**
 * Fetch print logs
 */
function fetchPrintLog($conn)
{
    $sql = "
        SELECT pl.*, CONCAT(u.fname, ' ', u.lname) AS name, u.idNumber
        FROM printlog pl
        JOIN users u ON pl.userId = u.userId
        ORDER BY pl.date DESC, pl.time DESC
    ";
    $result = $conn->query($sql);
    return $result->fetch_all(MYSQLI_ASSOC);
}

/**
 * Fetch all equipment (for inventory view)
 */
function fetchEquipment($conn)
{
    $sql = "SELECT * FROM equipment ORDER BY equipmentName ASC";
    $result = $conn->query($sql);
    return $result->fetch_all(MYSQLI_ASSOC);
}

// In admin_functions.php

/**
 * Handles the return of an equipment item transactionally.
 * Updates reservation status to 'Returned' and increments the available quantity.
 */
function handleEquipmentReturn($conn, $reservationId)
{
    // Start Transaction
    $conn->begin_transaction();

    try {
        // 1. Get the equipmentId and quantity borrowed for the approved reservation
        $stmt = $conn->prepare("SELECT equipmentId, quantity FROM equipmentreservation WHERE reservationId = ? AND status = 'Approved'");
        $stmt->bind_param("i", $reservationId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("Reservation not found, not approved, or already returned.");
        }
        
        $reservation = $result->fetch_assoc();
        $equipmentId = $reservation['equipmentId'];
        $quantity = $reservation['quantity'];
        $stmt->close();
        
        // 2. Update the reservation status to 'Returned' and set the actual return date
        $stmt = $conn->prepare("UPDATE equipmentreservation SET status = 'Returned', actualReturnDate = NOW() WHERE reservationId = ?");
        $stmt->bind_param("i", $reservationId);
        if (!$stmt->execute()) {
            throw new Exception("Failed to update reservation status: " . $conn->error);
        }
        $stmt->close();

        // 3. Increment the AVAILABLE equipment quantity (CORRECTED LINE)
        $stmt = $conn->prepare("UPDATE equipment SET available = available + ? WHERE equipmentId = ?");
        $stmt->bind_param("ii", $quantity, $equipmentId);
        if (!$stmt->execute()) {
            throw new Exception("Failed to update available quantity: " . $conn->error);
        }
        $stmt->close();

        // Commit the transaction if all steps succeeded
        $conn->commit();
        return ["status" => "success", "message" => "Item successfully marked as returned and inventory updated."];

    } catch (Exception $e) {
        // Rollback the transaction if any step failed
        $conn->rollback();
        return ["status" => "error", "message" => "Transaction failed: " . $e->getMessage()];
    }
}
