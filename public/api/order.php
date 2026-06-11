<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Only POST is supported."]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$amount = isset($input['amount']) ? $input['amount'] : null;

if ($amount === null || !is_numeric($amount)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid request: amount is required and must be a number."]);
    exit();
}

$keyId = getSetting('razorpay_key_id');
$keySecret = getSetting('razorpay_key_secret');

if (empty($keyId) || empty($keySecret) || $keyId === 'rzp_test_xxxxxx') {
    http_response_code(500);
    echo json_encode(["error" => "Razorpay credentials are not configured on the server."]);
    exit();
}

$receipt = 'rcpt_' . time() . '_' . rand(1000, 9999);
$postData = json_encode([
    'amount' => round($amount * 100), // convert to paise
    'currency' => 'INR',
    'receipt' => $receipt
]);

$ch = curl_init('https://api.razorpay.com/v1/orders');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($keyId . ':' . $keySecret)
]);

$response = curl_exec($ch);
$httpStatusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpStatusCode !== 200 && $httpStatusCode !== 201) {
    $data = json_decode($response, true);
    http_response_code($httpStatusCode);
    echo json_encode([
        "error" => isset($data['error']['description']) ? $data['error']['description'] : "Failed to initiate transaction with Razorpay."
    ]);
    exit();
}

$data = json_decode($response, true);
echo json_encode([
    'id' => $data['id'],
    'amount' => $data['amount'],
    'currency' => $data['currency']
]);
?>
