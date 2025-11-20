<?php
header("Content-Type: application/json");
require_once "../config/db_connect.php";

try {
    // 1. Inputs from form
    $studentId = $_POST["student_id"] ?? null;
    $fullName  = $_POST["full_name"] ?? null;
    $room      = $_POST["room"] ?? null;

    if (!$studentId || !$room) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    // 2. Find user in DB
    $stmt = $pdo->prepare("SELECT userId FROM users WHERE idNumber = ?");
    $stmt->execute([$studentId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

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

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId, $room]);

    echo json_encode(["success" => true, "message" => "Time In logged successfully"]);
    exit;

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
    exit;
}
?>
