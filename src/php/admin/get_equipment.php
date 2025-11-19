<?php
header('Content-Type: application/json');
require_once 'client_functions.php';

$items = fetchAvailableItems($conn);

echo json_encode($items);
?>
