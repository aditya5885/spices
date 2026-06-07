<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Only POST is supported."]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$amount = isset($input['amount']) ? $input['amount'] : null;
$productInfo = isset($input['productInfo']) ? $input['productInfo'] : '';
$firstName = isset($input['firstName']) ? $input['firstName'] : '';
$email = isset($input['email']) ? $input['email'] : '';
$phone = isset($input['phone']) ? $input['phone'] : '';

$udf1 = isset($input['udf1']) ? $input['udf1'] : '';
$udf2 = isset($input['udf2']) ? $input['udf2'] : '';
$udf3 = isset($input['udf3']) ? $input['udf3'] : '';
$udf4 = isset($input['udf4']) ? $input['udf4'] : '';
$udf5 = isset($input['udf5']) ? $input['udf5'] : '';
$udf6 = '';
$udf7 = '';
$udf8 = '';
$udf9 = '';
$udf10 = '';

if (!$amount || !$productInfo || !$firstName || !$email || !$phone) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required checkout parameters: amount, productInfo, firstName, email, and phone are mandatory."]);
    exit();
}

$txnid = 'txn_' . time() . '_' . substr(md5(uniqid(rand(), true)), 0, 6);
$formattedAmount = number_format((float)$amount, 2, '.', '');
$productInfo = substr($productInfo, 0, 80);
$firstName = trim($firstName);
$email = trim($email);
$phone = preg_replace('/\D/', '', $phone);

$surl = SITE_URL . '/api/payu_callback.php';
$furl = SITE_URL . '/api/payu_callback.php';

// Generate hash
// hash = sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)
$hashSequence = PAYU_KEY . '|' . $txnid . '|' . $formattedAmount . '|' . $productInfo . '|' . $firstName . '|' . $email . '|' . $udf1 . '|' . $udf2 . '|' . $udf3 . '|' . $udf4 . '|' . $udf5 . '|' . $udf6 . '|' . $udf7 . '|' . $udf8 . '|' . $udf9 . '|' . $udf10 . '|' . PAYU_SALT;

$hash = hash('sha512', $hashSequence);

$payload = [
    'key' => PAYU_KEY,
    'txnid' => $txnid,
    'amount' => $formattedAmount,
    'productinfo' => $productInfo,
    'firstname' => $firstName,
    'email' => $email,
    'phone' => $phone,
    'surl' => $surl,
    'furl' => $furl,
    'hash' => $hash,
    'service_provider' => 'payu_paisa',
    'udf1' => $udf1,
    'udf2' => $udf2,
    'udf3' => $udf3,
    'udf4' => $udf4,
    'udf5' => $udf5
];

$payuUrl = rtrim(PAYU_BASE_URL, '/') . '/_payment';

echo json_encode([
    'success' => true,
    'txnId' => $txnid,
    'payload' => $payload,
    'payuUrl' => $payuUrl
]);
?>
