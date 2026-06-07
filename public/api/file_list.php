<?php
session_start();
require_once 'config.php';

// Auth check
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$uploadDir = __DIR__ . '/../uploads/';

// Handle deletion of uploaded files
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete') {
    $file = isset($_GET['file']) ? basename($_GET['file']) : '';
    if (empty($file)) {
        http_response_code(400);
        echo json_encode(["error" => "No file name provided"]);
        exit();
    }
    
    $filePath = $uploadDir . $file;
    if (file_exists($filePath)) {
        if (unlink($filePath)) {
            echo json_encode(["success" => true, "message" => "File deleted successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to delete file from disk"]);
        }
    } else {
        http_response_code(44);
        echo json_encode(["error" => "File does not exist"]);
    }
    exit();
}

// Default action: List all files in the uploads folder
header("Content-Type: application/json; charset=UTF-8");

$filesList = [];
if (file_exists($uploadDir) && is_dir($uploadDir)) {
    $scanned = scandir($uploadDir);
    foreach ($scanned as $f) {
        if ($f !== '.' && $f !== '..' && is_file($uploadDir . $f)) {
            $filesList[] = $f;
        }
    }
}

echo json_encode($filesList);
?>
