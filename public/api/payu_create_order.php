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

// Connect to DB
$conn = getDB();
$conn->select_db(DB_NAME);

// Verify stock first
$stmtStock = $conn->prepare("SELECT price_in_inr, stock_qty, is_fixed_price FROM products WHERE slug = ?");
$stmtStock->bind_param("s", $udf1);
$stmtStock->execute();
$resStock = $stmtStock->get_result();
if ($rowStock = $resStock->fetch_assoc()) {
    $currentStock = intval($rowStock['stock_qty']);
    $qtyInt = intval($udf3);
    if ($currentStock < $qtyInt) {
        http_response_code(400);
        echo json_encode(["error" => "Insufficient stock. Only {$currentStock} items available."]);
        $stmtStock->close();
        $conn->close();
        exit();
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Product not found."]);
    $stmtStock->close();
    $conn->close();
    exit();
}
$stmtStock->close();

$txnid = 'txn_' . time() . '_' . substr(md5(uniqid(rand(), true)), 0, 6);
$formattedAmount = number_format((float)$amount, 2, '.', '');
$productInfo = substr($productInfo, 0, 80);
$firstName = trim($firstName);
$email = trim($email);
$phone = preg_replace('/\D/', '', $phone);

// Parse city, state, postal code from udf4 (Format: "city, state, postalCode")
$city = '';
$state = '';
$pinCode = '';
$udf4Parts = explode(',', $udf4);
if (count($udf4Parts) >= 3) {
    $city = trim($udf4Parts[0]);
    $state = trim($udf4Parts[1]);
    $pinCode = trim($udf4Parts[2]);
} else {
    $city = trim($udf4);
}

// Estimate subtotal, shipping from total and product price
$isFixed = intval($rowStock['is_fixed_price']);
if ($isFixed === 1) {
    $estSubtotal = floatval($rowStock['price_in_inr']) * intval($udf3);
} else {
    $packMult = 1.0;
    switch ($udf2) {
        case '200kg': $packMult = 200; break;
        case '500kg': $packMult = 500; break;
        case '1000kg': $packMult = 1000; break;
        case '2000kg': $packMult = 2000; break;
    }
    $basePrice = floatval($rowStock['price_in_inr']);
    $estSubtotal = round($basePrice * $packMult) * intval($udf3);
}
$estShipping = floatval($formattedAmount) - $estSubtotal;
if ($estShipping < 0) $estShipping = 0.00;

// Save order into the database as pending
$stmtOrder = $conn->prepare("INSERT INTO orders (order_id, customer_name, email, phone, shipping_address, city, state, pin_code, notes, product_slug, pack_size, quantity, subtotal, shipping_cost, total, payment_method, payment_status, order_status, payu_txnid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, 'payu', 'pending', 'pending_payment', ?)");
$qtyVal = intval($udf3);
$stmtOrder->bind_param("sssssssssiiddds", 
    $txnid, $firstName, $email, $phone, $udf5, $city, $state, $pinCode, 
    $udf1, $udf2, $qtyVal, $estSubtotal, $estShipping, $formattedAmount, $txnid
);

if (!$stmtOrder->execute()) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to initiate order in database: " . $stmtOrder->error]);
    $stmtOrder->close();
    $conn->close();
    exit();
}
$stmtOrder->close();
$conn->close();

$payuKey = getSetting('payu_key');
$payuSalt = getSetting('payu_salt');
$payuBaseUrl = getSetting('payu_base_url');
$siteUrl = getSetting('site_url');

$surl = rtrim($siteUrl, '/') . '/api/payu_callback.php';
$furl = rtrim($siteUrl, '/') . '/api/payu_callback.php';

// Generate hash
// hash = sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)
$hashSequence = $payuKey . '|' . $txnid . '|' . $formattedAmount . '|' . $productInfo . '|' . $firstName . '|' . $email . '|' . $udf1 . '|' . $udf2 . '|' . $udf3 . '|' . $udf4 . '|' . $udf5 . '||||||' . $payuSalt;

$hash = hash('sha512', $hashSequence);

$payload = [
    'key' => $payuKey,
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

$payuUrl = rtrim($payuBaseUrl, '/') . '/_payment';

echo json_encode([
    'success' => true,
    'txnId' => $txnid,
    'payload' => $payload,
    'payuUrl' => $payuUrl
]);
?>
