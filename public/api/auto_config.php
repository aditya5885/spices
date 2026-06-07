<?php
header("Content-Type: text/plain");

$configFile = __DIR__ . '/config.php';

if (!is_writable($configFile)) {
    die("Error: config.php is not writable. Please change its permissions to 666 or 777 in cPanel.");
}

$db_host = 'localhost';
$db_user = null;
$db_pass = null;
$db_name = null;

// 1. Try to extract from wp-config.php first
$paths = [
    __DIR__ . '/../wp-config.php',
    __DIR__ . '/../../wp-config.php'
];

foreach ($paths as $path) {
    if (file_exists($path)) {
        echo "Found wp-config.php at $path\n";
        $content = file_get_contents($path);
        
        preg_match("/define\s*\(\s*['\"]DB_NAME['\"]\s*,\s*['\"](.*)['\"]\s*\)/i", $content, $m1);
        preg_match("/define\s*\(\s*['\"]DB_USER['\"]\s*,\s*['\"](.*)['\"]\s*\)/i", $content, $m2);
        preg_match("/define\s*\(\s*['\"]DB_PASSWORD['\"]\s*,\s*['\"](.*)['\"]\s*\)/i", $content, $m3);
        preg_match("/define\s*\(\s*['\"]DB_HOST['\"]\s*,\s*['\"](.*)['\"]\s*\)/i", $content, $m4);
        
        $db_name = $m1[1] ?? null;
        $db_user = $m2[1] ?? null;
        $db_pass = $m3[1] ?? null;
        $db_host = $m4[1] ?? 'localhost';
        break;
    }
}

// 2. Override with URL parameters if provided
if (isset($_GET['db_user'])) $db_user = $_GET['db_user'];
if (isset($_GET['db_pass'])) $db_pass = $_GET['db_pass'];
if (isset($_GET['db_name'])) $db_name = $_GET['db_name'];
if (isset($_GET['db_host'])) $db_host = $_GET['db_host'];

if (!$db_user || !$db_name) {
    echo "Usage via browser to set manually:\n";
    echo "http://vintageglobaltrading.com/api/auto_config.php?db_user=YOUR_USER&db_pass=YOUR_PASS&db_name=YOUR_DB\n\n";
    die("Error: No database credentials detected or provided.");
}

echo "Configuring with:\n";
echo "Host: $db_host\n";
echo "User: $db_user\n";
echo "Database: $db_name\n\n";

// Rewrite config.php
$configContent = file_get_contents($configFile);

$configContent = preg_replace(
    "/define\(\s*['\"]DB_HOST['\"]\s*,\s*['\"].*['\"]\s*\);/",
    "define('DB_HOST', '" . addslashes($db_host) . "');",
    $configContent
);

$configContent = preg_replace(
    "/define\(\s*['\"]DB_USER['\"]\s*,\s*['\"].*['\"]\s*\);/",
    "define('DB_USER', '" . addslashes($db_user) . "');",
    $configContent
);

$configContent = preg_replace(
    "/define\(\s*['\"]DB_PASS['\"]\s*,\s*['\"].*['\"]\s*\);/",
    "define('DB_PASS', '" . addslashes($db_pass) . "');",
    $configContent
);

$configContent = preg_replace(
    "/define\(\s*['\"]DB_NAME['\"]\s*,\s*['\"].*['\"]\s*\);/",
    "define('DB_NAME', '" . addslashes($db_name) . "');",
    $configContent
);

if (file_put_contents($configFile, $configContent)) {
    echo "Successfully updated config.php!\n\n";
} else {
    die("Error: Failed to write to config.php");
}

// Test connection
echo "Testing connection...\n";
$conn = @new mysqli($db_host, $db_user, $db_pass);
if ($conn->connect_error) {
    die("Database connection failed with new credentials: " . $conn->connect_error);
}

echo "Connection successful!\n";

if ($conn->select_db($db_name)) {
    echo "Selected database '$db_name' successfully!\n";
} else {
    echo "Database '$db_name' does not exist. Creating database...\n";
    if ($conn->query("CREATE DATABASE `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")) {
        echo "Database created successfully!\n";
    } else {
        echo "Failed to create database: " . $conn->error . "\n";
    }
}

$conn->close();
echo "\nAuto-configuration completed successfully! Now please run setup.php to create the tables.";
?>
