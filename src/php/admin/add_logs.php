<?php
header("Content-Type: application/json");
require_once "../config/db_connect.php";

try {
    $conn = Database::getInstance()->getConnection();

    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // 1. Inputs from form
    $studentId = $_POST["student_id"] ?? null;
    $fullName  = $_POST["full_name"] ?? null;
    $room      = $_POST["room"] ?? null;

    if (!$studentId || !$room) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    // 2. Find user in DB
    $stmt = $conn->prepare("SELECT userId FROM users WHERE idNumber = ?");
    $stmt->bind_param("s", $studentId);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if (!$user) {
        echo json_encode(["success" => false, "message" => "Student not found in database"]);
        exit;
    }

    $userId = $user["userId"];

    // 3. Determine which table to insert into
    if ($room == "426") {
        $table = "byodlog";
    } elseif ($room == "424") {
        $table = "knowledgecenterlog";
    } else {
        echo json_encode(["success" => false, "message" => "Invalid room selected"]);
        exit;
    }

    // 4. Insert log
    $sql = "INSERT INTO $table (userId, date, timeIn, roomName)
            VALUES (?, CURDATE(), CURTIME(), ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $userId, $room);

   if (!$stmt->execute()) {
        // If execute fails, it MUST be a database error (like FK violation)
        throw new Exception("Log insertion failed. MySQL Error: " . $conn->error);
    }
    
    $stmt->close(); // Close the second statement

    echo json_encode(["success" => true, "message" => "Time In logged successfully for user ID {$userId}"]);
    exit;

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
    exit;
}
?>
