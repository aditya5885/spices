<?php
header("Content-Type: text/plain");

$backupFile = '/home1/vintae75/backup-6.5.2026_19-12-39_vintae75.tar.gz';

if (!file_exists($backupFile)) {
    die("Backup file not found at: " . $backupFile);
}

echo "Found backup file!\n";

// Method 1: exec tar
if (function_exists('exec')) {
    echo "Running tar extract...\n";
    // We want to find all config.php file paths in the tar archive
    $cmd = "tar -tzf " . escapeshellarg($backupFile) . " | grep 'config.php'";
    exec($cmd, $output, $returnVar);
    
    if ($returnVar === 0 && !empty($output)) {
        echo "All config files in tar:\n";
        print_r($output);
        
        // Let's find one that is in public_html/api/config.php
        $tarPath = "";
        foreach ($output as $path) {
            if (strpos($path, 'public_html/api/config.php') !== false) {
                $tarPath = trim($path);
                break;
            }
        }
        
        if (!$tarPath) {
            $tarPath = trim($output[0]);
        }
        
        echo "Extracting: " . $tarPath . "\n";
        
        // Extract it to stdout
        $extractCmd = "tar -xOf " . escapeshellarg($backupFile) . " " . escapeshellarg($tarPath);
        exec($extractCmd, $contentOutput, $extractReturn);
        if ($extractReturn === 0) {
            echo "--- CONTENT START ---\n";
            echo implode("\n", $contentOutput);
            echo "\n--- CONTENT END ---\n";
            exit();
        } else {
            echo "Extraction failed with return: " . $extractReturn . "\n";
        }
    } else {
        echo "Could not find api/config.php inside tar via exec.\n";
    }
} else {
    echo "exec() is disabled.\n";
}

// Method 2: PharData (if exec is disabled)
try {
    echo "Trying PharData...\n";
    $phar = new PharData($backupFile);
    // PharData might be slow or memory intensive for large files, but we try to traverse
    foreach (new RecursiveIteratorIterator($phar) as $file) {
        if (strpos($file->getPathname(), 'api/config.php') !== false) {
            echo "Found via PharData: " . $file->getPathname() . "\n";
            echo "--- CONTENT START ---\n";
            echo file_get_contents($file->getPathname());
            echo "\n--- CONTENT END ---\n";
            exit();
        }
    }
} catch (Exception $e) {
    echo "PharData Error: " . $e->getMessage() . "\n";
}
?>
