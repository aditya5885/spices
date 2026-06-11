<?php
header("Content-Type: text/plain");
$logFile = __DIR__ . '/error_log';

if (file_exists($logFile)) {
    echo "Last 100 lines of error_log:\n\n";
    $lines = file($logFile);
    $last_lines = array_slice($lines, -100);
    echo implode("", $last_lines);
} else {
    echo "error_log not found.";
}
?>
