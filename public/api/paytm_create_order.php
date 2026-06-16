<?php
require_once 'config.php';
require_once 'PaytmChecksum.php';

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

$udf1 = isset($input['udf1']) ? $input['udf1'] : ''; // productSlug
$udf2 = isset($input['udf2']) ? $input['udf2'] : ''; // packSize
$udf3 = isset($input['udf3']) ? $input['udf3'] : ''; // quantity
$udf4 = isset($input['udf4']) ? $input['udf4'] : ''; // city, state, pin
$udf5 = isset($input['udf5']) ? $input['udf5'] : ''; // address

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

// Generate unique txn ID (compatible with orders table order_id)
$orderId = 'txn_' . time() . '_' . substr(md5(uniqid(rand(), true)), 0, 6);
$formattedAmount = number_format((float)$amount, 2, '.', '');
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

// Estimate subtotal and shipping
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

$stmtOrder = $conn->prepare("INSERT INTO orders (order_id, customer_name, email, phone, shipping_address, city, state, pin_code, notes, product_slug, pack_size, quantity, subtotal, shipping_cost, total, payment_method, payment_status, order_status, paytm_txnid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, 'paytm', 'pending', 'pending_payment', ?)");
$qtyVal = intval($udf3);
$stmtOrder->bind_param("ssssssssssiddds", 
    $orderId, $firstName, $email, $phone, $udf5, $city, $state, $pinCode, 
    $udf1, $udf2, $qtyVal, $estSubtotal, $estShipping, $formattedAmount, $orderId
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

// Fetch Paytm configurations from database settings
$paytmMid = getSetting('paytm_mid');
$paytmMerchantKey = getSetting('paytm_merchant_key');
$paytmWebsite = getSetting('paytm_website');
$paytmBaseUrl = getSetting('paytm_base_url');
$siteUrl = getSetting('site_url');

$callbackUrl = rtrim($siteUrl, '/') . '/api/paytm_callback.php';

// Prepare Paytm Initiate Transaction body parameters
// Note: JSON_UNESCAPED_SLASHES must be used during checksum calculation and in final post payload
$paytmParams = array();
$paytmParams["body"] = array(
    "requestType"   => "Payment",
    "mid"           => $paytmMid,
    "websiteName"   => $paytmWebsite,
    "orderId"       => $orderId,
    "callbackUrl"   => $callbackUrl,
    "txnAmount"     => array(
        "value"     => $formattedAmount,
        "currency"  => "INR",
    ),
    "userInfo"      => array(
        "custId"    => "CUST_" . ($phone ?: time()),
        "email"     => $email,
        "phone"     => $phone,
    ),
);

try {
    $bodyString = json_encode($paytmParams["body"], JSON_UNESCAPED_SLASHES);
    $checksum = PaytmChecksum::generateSignature($bodyString, $paytmMerchantKey);
    
    $paytmParams["head"] = array(
        "signature" => $checksum
    );
    
    $postData = json_encode($paytmParams, JSON_UNESCAPED_SLASHES);
    
    // Call Initiate Transaction API
    $apiEndpoint = rtrim($paytmBaseUrl, '/') . "/theia/api/v1/initiateTransaction?mid=" . $paytmMid . "&orderId=" . $orderId;
    
    $ch = curl_init($apiEndpoint);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
    
    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        throw new Exception(curl_error($ch));
    }
    curl_close($ch);
    
    $resData = json_decode($response, true);
    
    if (isset($resData['body']['resultInfo']['resultStatus']) && $resData['body']['resultInfo']['resultStatus'] === 'S') {
        $txnToken = $resData['body']['txnToken'];
        $paytmUrl = rtrim($paytmBaseUrl, '/') . "/theia/api/v1/showPaymentPage?mid=" . $paytmMid . "&orderId=" . $orderId;
        
        echo json_encode([
            "success" => true,
            "orderId" => $orderId,
            "txnToken" => $txnToken,
            "paytmUrl" => $paytmUrl,
            "mid" => $paytmMid
        ]);
    } else {
        $errorMsg = isset($resData['body']['resultInfo']['resultMsg']) ? $resData['body']['resultInfo']['resultMsg'] : 'Initiate Transaction API failed.';
        throw new Exception($errorMsg);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Paytm initiation failed: " . $e->getMessage()]);
}
?>
