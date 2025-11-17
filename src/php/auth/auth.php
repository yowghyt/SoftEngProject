<?php

/**
 * auth.php
 * 
 * This script handles LOGIN, SIGNUP and Logout requests for users.
 * 
 * Required fields:
 *  - SIGNUP: fname, lname, email, password
 *  - LOGIN:  email, password
 */

header("Content-Type: application/json");

// Fixed: Added missing slash
require_once __DIR__ . '/../config/db_connect.php';

$conn = Database::getInstance()->getConnection();
$data = json_decode(file_get_contents("php://input"), true);

// Removed the "Connected successfully" echo that interferes with JSON response

$action = $data['action'] ?? '';

if ($action === "signup") {
    signup($conn, $data);
} elseif ($action === "login") {
    login($conn, $data);
} elseif ($action === "logout") {
    logoutUser();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid action"]);
}

// --------------------------- SIGN UP ----------------------------
function signup($conn, $data)
{
    $fname = $data["fname"] ?? '';
    $lname = $data["lname"] ?? '';
    $email = $data["email"] ?? '';
    $password = $data["password"] ?? '';

    if (!$fname || !$lname || !$email || !$password) {
        echo json_encode(["status" => "error", "message" => "All fields are required."]);
        return;
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Invalid email format."]);
        return;
    }

    // Check if email exists
    $stmt = $conn->prepare("SELECT email FROM admin WHERE email=?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Email already registered"]);
        return;
    }

    $passwordHash = hash("sha256", $password);

    $stmt = $conn->prepare("INSERT INTO admin (email, fname, lname, passwordHash) VALUES (?,?,?,?)");
    $stmt->bind_param("ssss", $email, $fname, $lname, $passwordHash);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Account created successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Signup failed: " . $stmt->error]);
    }

    $stmt->close();
}

// --------------------------- LOGIN ----------------------------
function login($conn, $data)
{
    $email = $data["email"] ?? '';
    $password = $data["password"] ?? '';

    if (!$email || !$password) {
        echo json_encode(["status" => "error", "message" => "Email and password are required."]);
        return;
    }

    $stmt = $conn->prepare("SELECT * FROM admin WHERE email=? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 0) {
        echo json_encode(["status" => "error", "message" => "User not found"]);
        return;
    }

    $user = $result->fetch_assoc();
    $hash = hash("sha256", $password);

    if ($hash !== $user["passwordHash"]) {
        echo json_encode(["status" => "error", "message" => "Invalid password"]);
        return;
    }

    session_start();
    $_SESSION["adminId"] = $user["adminId"];
    $_SESSION["email"]   = $user["email"];

    echo json_encode([
        "status" => "success",
        "message" => "Login successful",
        "user" => [
            "adminId" => $user["adminId"],
            "email" => $user["email"],
            "fname" => $user["fname"],
            "lname" => $user["lname"]
        ]
    ]);

    $stmt->close();
}

// --------------------------- LOGOUT ----------------------------
function logoutUser()
{
    // Start the session only if not already active
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Fixed: Changed user_id to adminId to match login function
    if (isset($_SESSION['adminId'])) {
        // Clear all session variables
        $_SESSION = [];

        // Destroy the session file on the server
        session_destroy();

        echo json_encode([
            "status" => "success",
            "message" => "Logout successful"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "No user is currently logged in"
        ]);
    }
}
