<?php
header('Content-Type: application/json');
require_once '../admin/client_functions.php'; 

if (!isset($_GET['query'])) {
    echo json_encode(["error" => "Missing query"]);
    exit;
}

$query = $_GET['query'];
$result = lookupStudent($conn, $query);

if ($result) {
    echo json_encode($result);
} else {
    echo json_encode(["error" => "No student found"]);
}
?>
