<?php
/**
 * server.php
 * 
 * This script handles LOGIN, SIGNUP and Logout requests for users.
 * 
 * Required fields:
 *  - SIGNUP: email, first_name, last_name, id_number, password
 *  - LOGIN:  id_number, password
 */

include 'db_connect.php'; // connect to database

// Decode JSON request (from frontend)
$data = json_decode(file_get_contents("php://input"), true);

$action = $data['action'] ?? '';

if ($action === 'login') {
    loginUser($conn, $data);
} elseif ($action === 'signup') {
    signupUser($conn, $data);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid action"]);
}

/**
 * LOGIN USER
 */
function loginUser($conn, $data) {
    $id_number = $data['id_number'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($id_number) || empty($password)) {
        echo json_encode(["status" => "error", "message" => "Missing ID number or password"]);
        return;
    }

    $stmt = $conn->prepare("SELECT * FROM users WHERE id_number = ?");
    $stmt->bind_param("s", $id_number);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        if (password_verify($password, $user['password'])) {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            // Store minimal session data
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['id_number'] = $user['id_number'];
            echo json_encode([
                "status" => "success",
                "message" => "Login successful",
                "user" => [
                    "id_number" => $user['id_number'],
                    "first_name" => $user['first_name'],
                    "last_name" => $user['last_name'],
                    "email" => $user['email']
                ]
                
            ]);
            $_SESSION['user_id'] = $user['id'];
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid password"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "User not found"]);
    }

    $stmt->close();
}

/**
 * SIGN UP USER
 */
function signupUser($conn, $data) {
    $email = $data['email'] ?? '';
    $first_name = $data['first_name'] ?? '';
    $last_name = $data['last_name'] ?? '';
    $id_number = $data['id_number'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($first_name) || empty($last_name) || empty($id_number) || empty($password)) {
        echo json_encode(["status" => "error", "message" => "All fields are required"]);
        return;
    }

    $stmt = $conn->prepare("SELECT * FROM users WHERE id_number = ? OR email = ?");
    $stmt->bind_param("ss", $id_number, $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "ID number or email already registered"]);
        return;
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("
        INSERT INTO users (email, first_name, last_name, id_number, password)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("sssss", $email, $first_name, $last_name, $id_number, $hashed_password);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Signup successful"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error during signup"]);
    }

    $stmt->close();
}

function logoutUser() {
    // Start the session only if not already active
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Check if a user is logged in
    if (isset($_SESSION['user_id'])) {
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

?>
