<?php
session_start();
require_once 'config.php';

// Auth check
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$conn = getDB();
$conn->select_db(DB_NAME);

$method = $_SERVER['REQUEST_METHOD'];

// Parse incoming request data
$input = [];
if ($method === 'POST') {
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    if (stripos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
    } else {
        $input = $_POST;
    }
}

if ($method === 'GET') {
    // Return all key-value settings from the database
    $res = $conn->query("SELECT key_name, value_text FROM settings");
    $settings = [];
    while ($row = $res->fetch_assoc()) {
        $settings[$row['key_name']] = $row['value_text'];
    }
    echo json_encode($settings);
} elseif ($method === 'POST') {
    // Bulk update settings (accepts key-value pairs)
    if (empty($input)) {
        http_response_code(400);
        echo json_encode(["error" => "No settings data provided"]);
        exit();
    }
    
    $stmt = $conn->prepare("INSERT INTO settings (key_name, value_text) VALUES (?, ?) ON DUPLICATE KEY UPDATE value_text = VALUES(value_text)");
    
    $successCount = 0;
    foreach ($input as $key => $val) {
        // Strip out actions or extra keys if any
        if ($key === 'action') continue;
        
        $keyStr = trim($key);
        $valStr = is_array($val) ? json_encode($val) : strval($val);
        
        $stmt->bind_param("ss", $keyStr, $valStr);
        if ($stmt->execute()) {
            $successCount++;
        }
    }
    $stmt->close();
    
    echo json_encode(["success" => true, "message" => "Successfully updated $successCount settings"]);
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

$conn->close();
?>
