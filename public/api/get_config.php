<?php
require_once 'config.php';

echo json_encode([
    "razorpay_key_id" => getSetting('razorpay_key_id'),
    "payu_key" => getSetting('payu_key'),
    "payu_base_url" => getSetting('payu_base_url'),
    "shipping_cost_standard" => floatval(getSetting('shipping_cost_standard', 0)),
    "shipping_cost_express" => floatval(getSetting('shipping_cost_express', 0)),
    "shipping_free_threshold" => floatval(getSetting('shipping_free_threshold', 1000))
]);
?>
