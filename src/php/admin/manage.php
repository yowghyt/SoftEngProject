<?php

/**
 * manage.php
 * 
 * Handles CRUD operations for equipment and rooms
 */

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../config/db_connect.php';

$conn = Database::getInstance()->getConnection();
$data = json_decode(file_get_contents("php://input"), true);

$action = $data['action'] ?? $_GET['action'] ?? '';

switch ($action) {
    // Equipment Actions
    case 'get_equipment':
        getEquipment($conn);
        break;
    case 'get_equipment_details':
        getEquipmentDetails($conn);
        break;
    case 'add_equipment':
        addEquipment($conn, $data);
        break;
    case 'update_equipment':
        updateEquipment($conn, $data);
        break;
    case 'delete_equipment':
        deleteEquipment($conn, $data);
        break;
    
    // Room Actions
    case 'get_rooms':
        getRooms($conn);
        break;
    case 'get_room_details':
        getRoomDetails($conn);
        break;
    case 'add_room':
        addRoom($conn, $data);
        break;
    case 'update_room':
        updateRoom($conn, $data);
        break;
    case 'delete_room':
        deleteRoom($conn, $data);
        break;
    
    default:
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
        break;
}

// ==================== EQUIPMENT FUNCTIONS ====================

function getEquipment($conn) {
    $sql = "SELECT * FROM equipment ORDER BY equipmentId DESC";
    
    $result = $conn->query($sql);
    
    if ($result) {
        $equipment = [];
        while ($row = $result->fetch_assoc()) {
            $equipment[] = $row;
        }
        echo json_encode([
            "status" => "success",
            "data" => $equipment,
            "count" => count($equipment)
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to fetch equipment: " . $conn->error
        ]);
    }
}

function getEquipmentDetails($conn) {
    $equipmentId = $_GET['id'] ?? 0;
    
    if (!$equipmentId) {
        echo json_encode(["status" => "error", "message" => "Equipment ID required"]);
        return;
    }
    
    $stmt = $conn->prepare("SELECT * FROM equipment WHERE equipmentId = ?");
    $stmt->bind_param("i", $equipmentId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $equipment = $result->fetch_assoc();
        echo json_encode([
            "status" => "success",
            "data" => $equipment
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Equipment not found"
        ]);
    }
    
    $stmt->close();
}

function addEquipment($conn, $data) {
    $equipmentName = $data['equipmentName'] ?? '';
    $quantity = $data['quantity'] ?? 0;
    $available = $quantity;
    $status = $data['status'] ?? 'Available';
    
    // Optional fields
    $category = $data['category'] ?? null;
    $brand = $data['brand'] ?? null;
    $condition = $data['condition'] ?? null;
    $description = $data['description'] ?? null;
    
    if (!$equipmentName || !$quantity) {
        echo json_encode(["status" => "error", "message" => "Equipment name and quantity required"]);
        return;
    }
    
    // Check if equipment table has additional columns
    $columnsQuery = "SHOW COLUMNS FROM equipment";
    $columnsResult = $conn->query($columnsQuery);
    $columns = [];
    while ($col = $columnsResult->fetch_assoc()) {
        $columns[] = $col['Field'];
    }
    
    // Build SQL based on available columns
    if (in_array('category', $columns) && in_array('brand', $columns)) {
        $stmt = $conn->prepare("INSERT INTO equipment (equipmentName, quantity, available, status, category, brand, `condition`, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        // FIX: Changed "sissss" to "sisssss" (7 parameters need 7 type chars)
        $stmt->bind_param("siisssss", $equipmentName, $quantity, $available, $status, $category, $brand, $condition, $description);
    } else {
        // Use basic columns only
        $stmt = $conn->prepare("INSERT INTO equipment (equipmentName, quantity, available, status) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sis", $equipmentName, $quantity, $available, $status);
    }
    
    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Equipment added successfully",
            "equipmentId" => $conn->insert_id
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to add equipment: " . $stmt->error
        ]);
    }
    
    $stmt->close();
}

function updateEquipment($conn, $data) {
    $equipmentId = $data['equipmentId'] ?? 0;
    $equipmentName = $data['equipmentName'] ?? '';
    $quantity = $data['quantity'] ?? 0;
    
    if (!$equipmentId || !$equipmentName || !$quantity) {
        echo json_encode(["status" => "error", "message" => "Equipment ID, name and quantity required"]);
        return;
    }
    
    // Fetch current equipment details to validate
    $getStmt = $conn->prepare("SELECT quantity, available FROM equipment WHERE equipmentId = ?");
    $getStmt->bind_param("i", $equipmentId);
    $getStmt->execute();
    $getResult = $getStmt->get_result();
    
    if ($getResult->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "Equipment not found"]);
        $getStmt->close();
        return;
    }
    
    $currentEquipment = $getResult->fetch_assoc();
    $currentQuantity = $currentEquipment['quantity'];
    $currentAvailable = $currentEquipment['available'];
    $getStmt->close();
    
    // Calculate borrowed items
    $borrowedCount = $currentQuantity - $currentAvailable;
    
    // Validation: Check if quantity and available are equal
    if ($currentQuantity !== $currentAvailable) {
        // Items are borrowed - validate that new quantity >= borrowed count
        if ($quantity < $borrowedCount) {
            echo json_encode([
                "status" => "error",
                "message" => "Cannot reduce quantity below borrowed items. Currently borrowed: $borrowedCount item(s). You cannot set quantity lower than $borrowedCount.",
                "borrowedCount" => $borrowedCount,
                "currentQuantity" => $currentQuantity,
                "currentAvailable" => $currentAvailable
            ]);
            return;
        }
        
        // Calculate new available based on borrowed items
        $newAvailable = $quantity - $borrowedCount;
    } else {
        // All items are available, so new available = new quantity
        $newAvailable = $quantity;
    }
    
    // Check available columns
    $columnsQuery = "SHOW COLUMNS FROM equipment";
    $columnsResult = $conn->query($columnsQuery);
    $columns = [];
    while ($col = $columnsResult->fetch_assoc()) {
        $columns[] = $col['Field'];
    }
    
    // Build update query based on available columns
    if (in_array('category', $columns) && in_array('brand', $columns)) {
        $category = $data['category'] ?? null;
        $brand = $data['brand'] ?? null;
        $condition = $data['condition'] ?? null;
        $description = $data['description'] ?? null;
        
        $stmt = $conn->prepare("UPDATE equipment SET equipmentName = ?, quantity = ?, available = ?, category = ?, brand = ?, `condition` = ?, description = ? WHERE equipmentId = ?");
        $stmt->bind_param("siissssi", $equipmentName, $quantity, $newAvailable, $category, $brand, $condition, $description, $equipmentId);
    } else {
        $stmt = $conn->prepare("UPDATE equipment SET equipmentName = ?, quantity = ?, available = ? WHERE equipmentId = ?");
        $stmt->bind_param("siii", $equipmentName, $quantity, $newAvailable, $equipmentId);
    }
    
    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Equipment updated successfully",
            "newQuantity" => $quantity,
            "newAvailable" => $newAvailable,
            "borrowedCount" => $borrowedCount
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to update equipment: " . $stmt->error
        ]);
    }
    
    $stmt->close();
}

function deleteEquipment($conn, $data) {
    $equipmentId = $data['equipmentId'] ?? 0;
    
    if (!$equipmentId) {
        echo json_encode(["status" => "error", "message" => "Equipment ID required"]);
        return;
    }
    
    // Check if equipment is currently borrowed
    $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM equipmentreservation WHERE equipmentId = ? AND status IN ('Pending', 'Approved')");
    $checkStmt->bind_param("i", $equipmentId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    $check = $checkResult->fetch_assoc();
    $checkStmt->close();
    
    if ($check['count'] > 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Cannot delete equipment with active reservations"
        ]);
        return;
    }
    
    $stmt = $conn->prepare("DELETE FROM equipment WHERE equipmentId = ?");
    $stmt->bind_param("i", $equipmentId);
    
    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Equipment deleted successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to delete equipment: " . $stmt->error
        ]);
    }
    
    $stmt->close();
}

// ==================== ROOM FUNCTIONS ====================

function getRooms($conn) {
    $sql = "SELECT * FROM room ORDER BY roomId DESC";
    
    $result = $conn->query($sql);
    
    if ($result) {
        $rooms = [];
        while ($row = $result->fetch_assoc()) {
            $rooms[] = $row;
        }
        echo json_encode([
            "status" => "success",
            "data" => $rooms,
            "count" => count($rooms)
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to fetch rooms: " . $conn->error
        ]);
    }
}

function getRoomDetails($conn) {
    $roomId = $_GET['id'] ?? 0;
    
    if (!$roomId) {
        echo json_encode(["status" => "error", "message" => "Room ID required"]);
        return;
    }
    
    $stmt = $conn->prepare("SELECT * FROM room WHERE roomId = ?");
    $stmt->bind_param("i", $roomId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $room = $result->fetch_assoc();
        echo json_encode([
            "status" => "success",
            "data" => $room
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Room not found"
        ]);
    }
    
    $stmt->close();
}

function addRoom($conn, $data) {
    $roomName = $data['roomName'] ?? '';
    $capacity = $data['capacity'] ?? 0;
    $status = $data['status'] ?? 'Available';
    
    // Optional fields
    $building = $data['building'] ?? null;
    $floor = $data['floor'] ?? null;
    $equipment = $data['equipment'] ?? null;
    $description = $data['description'] ?? null;
    
    if (!$roomName || !$capacity) {
        echo json_encode(["status" => "error", "message" => "Room name and capacity required"]);
        return;
    }
    
    // Check available columns
    $columnsQuery = "SHOW COLUMNS FROM room";
    $columnsResult = $conn->query($columnsQuery);
    $columns = [];
    while ($col = $columnsResult->fetch_assoc()) {
        $columns[] = $col['Field'];
    }
    
    // Build SQL based on available columns
    if (in_array('building', $columns) && in_array('floor', $columns)) {
        $stmt = $conn->prepare("INSERT INTO room (roomName, status, capacity, building, floor, equipment, description) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssissss", $roomName, $status, $capacity, $building, $floor, $equipment, $description);
    } else {
        // Use basic columns only
        $stmt = $conn->prepare("INSERT INTO room (roomName, status, capacity) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $roomName, $status, $capacity);
    }
    
    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Room added successfully",
            "roomId" => $conn->insert_id
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to add room: " . $stmt->error
        ]);
    }
    
    $stmt->close();
}

function updateRoom($conn, $data) {
    $roomId = $data['roomId'] ?? 0;
    $roomName = $data['roomName'] ?? '';
    $capacity = $data['capacity'] ?? 0;
    $status = $data['status'] ?? 'Available';
    
    if (!$roomId || !$roomName || !$capacity) {
        echo json_encode(["status" => "error", "message" => "Room ID, name and capacity required"]);
        return;
    }
    
    // Check available columns
    $columnsQuery = "SHOW COLUMNS FROM room";
    $columnsResult = $conn->query($columnsQuery);
    $columns = [];
    while ($col = $columnsResult->fetch_assoc()) {
        $columns[] = $col['Field'];
    }
    
    // Build update query based on available columns
    if (in_array('building', $columns) && in_array('floor', $columns)) {
        $building = $data['building'] ?? null;
        $floor = $data['floor'] ?? null;
        $equipment = $data['equipment'] ?? null;
        $description = $data['description'] ?? null;
        
        $stmt = $conn->prepare("UPDATE room SET roomName = ?, status = ?, capacity = ?, building = ?, floor = ?, equipment = ?, description = ? WHERE roomId = ?");
        $stmt->bind_param("ssissssi", $roomName, $status, $capacity, $building, $floor, $equipment, $description, $roomId);
    } else {
        $stmt = $conn->prepare("UPDATE room SET roomName = ?, status = ?, capacity = ? WHERE roomId = ?");
        $stmt->bind_param("ssii", $roomName, $status, $capacity, $roomId);
    }
    
    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Room updated successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to update room: " . $stmt->error
        ]);
    }
    
    $stmt->close();
}

function deleteRoom($conn, $data) {
    $roomId = $data['roomId'] ?? 0;
    
    if (!$roomId) {
        echo json_encode(["status" => "error", "message" => "Room ID required"]);
        return;
    }
    
    // Check if room has active reservations
    $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM roomreservation WHERE roomId = ? AND status IN ('Pending', 'Approved')");
    $checkStmt->bind_param("i", $roomId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    $check = $checkResult->fetch_assoc();
    $checkStmt->close();
    
    if ($check['count'] > 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Cannot delete room with active reservations"
        ]);
        return;
    }
    
    $stmt = $conn->prepare("DELETE FROM room WHERE roomId = ?");
    $stmt->bind_param("i", $roomId);
    
    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Room deleted successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to delete room: " . $stmt->error
        ]);
    }
    
    $stmt->close();
}