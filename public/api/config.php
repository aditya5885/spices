<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set default headers for API responses
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle CORS Preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Credentials (configured for local setup, client modifies on cPanel)
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'spices_db');

// Razorpay Credentials (test credentials, client modifies on cPanel)
define('RAZORPAY_KEY_ID', 'rzp_test_lE1QvWvDylfC5P'); 
define('RAZORPAY_KEY_SECRET', 'zVqF4h11s7YVp5uC7Y36Zf5E');

// PayU Credentials (test credentials, client modifies on cPanel)
define('PAYU_KEY', 'gmjiH9');
define('PAYU_SALT', 'VLC5JLnZa4qJ5SzFBAtUe269Oztl1uPp');
define('PAYU_MERCHANT_ID', 'your_merchant_id');
define('PAYU_BASE_URL', 'https://test.payu.in');
define('SITE_URL', 'http://vintageglobaltrading.com');

// Admin Configuration (for product editing dashboard)
define('ADMIN_PASSWORD', 'spices2026');

// Helper function to return database connection
function getDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
    
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
        exit();
    }

    // Try to select database, if it doesn't exist, setup.php will create it
    if (!$conn->select_db(DB_NAME)) {
        // We will let setup.php handle DB creation. For now, establish connection without DB selected
    }
    
    $conn->set_charset("utf8mb4");
    return $conn;
}
?>
