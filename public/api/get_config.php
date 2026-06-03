<?php
require_once 'config.php';

// Return public configuration parameters (do NOT expose secrets like DB passwords or Razorpay Secrets!)
echo json_encode([
    "razorpay_key_id" => RAZORPAY_KEY_ID
]);
?>
