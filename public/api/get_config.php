<?php
require_once 'config.php';

echo json_encode([
    "razorpay_key_id" => getSetting('razorpay_key_id'),
    "payu_key" => getSetting('payu_key'),
    "payu_base_url" => getSetting('payu_base_url')
]);
?>
