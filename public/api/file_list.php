<?php
header("Content-Type: text/plain");

echo "Current dir: " . __DIR__ . "\n";
echo "Parent dir: " . realpath(__DIR__ . '/..') . "\n";

// Check files in public_html
$files = scandir(__DIR__ . '/..');
echo "\nFiles in public_html:\n";
print_r($files);

// Check if wp-config.php exists
$wpConfigPath = __DIR__ . '/../wp-config.php';
if (file_exists($wpConfigPath)) {
    echo "\nwp-config.php found!\n";
    $content = file_get_contents($wpConfigPath);
    // Extract constants using regex
    preg_match("/define\s*\(\s*['\"]DB_NAME['\"]\s*,\s*['\"](.*)['\"]\s*\)/i", $content, $dbName);
    preg_match("/define\s*\(\s*['\"]DB_USER['\"]\s*,\s*['\"](.*)['\"]\s*\)/i", $content, $dbUser);
    preg_match("/define\s*\(\s*['\"]DB_PASSWORD['\"]\s*,\s*['\"](.*)['\"]\s*\)/i", $content, $dbPass);
    preg_match("/define\s*\(\s*['\"]DB_HOST['\"]\s*,\s*['\"](.*)['\"]\s*\)/i", $content, $dbHost);
    
    echo "DB_NAME: " . ($dbName[1] ?? 'not found') . "\n";
    echo "DB_USER: " . ($dbUser[1] ?? 'not found') . "\n";
    echo "DB_PASS: " . ($dbPass[1] ?? 'not found') . "\n";
    echo "DB_HOST: " . ($dbHost[1] ?? 'not found') . "\n";
} else {
    echo "\nwp-config.php NOT found in public_html.\n";
    
    // Check one level up (home directory)
    $grandparentFiles = scandir(__DIR__ . '/../..');
    echo "\nFiles in grandparent dir:\n";
    print_r($grandparentFiles);
    
    $wpConfigParentPath = __DIR__ . '/../../wp-config.php';
    if (file_exists($wpConfigParentPath)) {
        echo "\nwp-config.php found in parent of public_html!\n";
        $content = file_get_contents($wpConfigParentPath);
        preg_match("/define\s*\(\s*['\"]DB_NAME['\"]\s*,\s*['\"](.*)['\"]\s*\)/i", $content, $dbName);
        preg_match("/define\s*\(\s*['\"]DB_USER['\"]\s*,\s*['\"](.*)['\"]\s*\)/i", $content, $dbUser);
        preg_match("/define\s*\(\s*['\"]DB_PASSWORD['\"]\s*,\s*['\"](.*)['\"]\s*\)/i", $content, $dbPass);
        preg_match("/define\s*\(\s*['\"]DB_HOST['\"]\s*,\s*['\"](.*)['\"]\s*\)/i", $content, $dbHost);
        
        echo "DB_NAME: " . ($dbName[1] ?? 'not found') . "\n";
        echo "DB_USER: " . ($dbUser[1] ?? 'not found') . "\n";
        echo "DB_PASS: " . ($dbPass[1] ?? 'not found') . "\n";
        echo "DB_HOST: " . ($dbHost[1] ?? 'not found') . "\n";
    }
}
?>
