<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Only POST is supported."]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$paymentMethod = isset($input['payment_method']) ? $input['payment_method'] : '';

// Validation of required fields
$requiredFields = [
    'customer_name', 'email', 'phone', 'shipping_address', 'city', 
    'state', 'pin_code', 'product_slug', 'pack_size', 'quantity', 
    'subtotal', 'shipping_cost', 'total', 'payment_method'
];

foreach ($requiredFields as $field) {
    if (!isset($input[$field]) || $input[$field] === '') {
        http_response_code(400);
        echo json_encode(["error" => "Missing required field: " . $field]);
        exit();
    }
}

$conn = getDB();
$conn->select_db(DB_NAME);

// Check stock level first
$stmtStock = $conn->prepare("SELECT stock_qty FROM products WHERE slug = ?");
$stmtStock->bind_param("s", $input['product_slug']);
$stmtStock->execute();
$resStock = $stmtStock->get_result();
if ($rowStock = $resStock->fetch_assoc()) {
    $currentStock = intval($rowStock['stock_qty']);
    $requestedQty = intval($input['quantity']);
    if ($currentStock < $requestedQty) {
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

$orderId = '';
$paymentStatus = 'pending';
$orderStatus = 'new';
$razorpayOrderId = isset($input['razorpay_order_id']) ? $input['razorpay_order_id'] : null;
$razorpayPaymentId = isset($input['razorpay_payment_id']) ? $input['razorpay_payment_id'] : null;
$razorpaySignature = isset($input['razorpay_signature']) ? $input['razorpay_signature'] : null;

if ($paymentMethod === 'razorpay') {
    if (!$razorpayOrderId || !$razorpayPaymentId || !$razorpaySignature) {
        http_response_code(400);
        echo json_encode(["error" => "Missing Razorpay verification parameters."]);
        $conn->close();
        exit();
    }

    // Verify cryptographic signature: HMAC-SHA256(order_id + "|" + payment_id, secret)
    $keySecret = getSetting('razorpay_key_secret');
    $text = $razorpayOrderId . "|" . $razorpayPaymentId;
    $generatedSignature = hash_hmac("sha256", $text, $keySecret);

    if ($generatedSignature !== $razorpaySignature) {
        http_response_code(400);
        echo json_encode(["error" => "Payment verification failed: cryptographic signature mismatch."]);
        $conn->close();
        exit();
    }

    $orderId = $razorpayOrderId;
    $paymentStatus = 'completed';
} else {
    // Generate a unique local order ID for COD/Mock payments
    $orderId = 'EXP-' . time() . '-' . rand(100, 999);
    $paymentStatus = ($paymentMethod === 'cod') ? 'pending' : 'completed';
}

// Insert order record into DB
$stmt = $conn->prepare("INSERT INTO orders (order_id, customer_name, email, phone, shipping_address, city, state, pin_code, notes, product_slug, pack_size, quantity, subtotal, shipping_cost, cod_fee, total, payment_method, payment_status, order_status, razorpay_order_id, razorpay_payment_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Database statement preparation failed: " . $conn->error]);
    $conn->close();
    exit();
}

$notes = isset($input['notes']) ? $input['notes'] : '';
$codFee = isset($input['cod_fee']) ? floatval($input['cod_fee']) : 0.00;
$subtotal = floatval($input['subtotal']);
$shippingCost = floatval($input['shipping_cost']);
$total = floatval($input['total']);
$quantity = intval($input['quantity']);

$stmt->bind_param(
    "sssssssssssidddddssss",
    $orderId,
    $input['customer_name'],
    $input['email'],
    $input['phone'],
    $input['shipping_address'],
    $input['city'],
    $input['state'],
    $input['pin_code'],
    $notes,
    $input['product_slug'],
    $input['pack_size'],
    $quantity,
    $subtotal,
    $shippingCost,
    $codFee,
    $total,
    $paymentMethod,
    $paymentStatus,
    $orderStatus,
    $razorpayOrderId,
    $razorpayPaymentId
);

if ($stmt->execute()) {
    // Payment verified and order saved successfully - decrement stock
    $stmtDec = $conn->prepare("UPDATE products SET stock_qty = stock_qty - ? WHERE slug = ?");
    $stmtDec->bind_param("is", $quantity, $input['product_slug']);
    $stmtDec->execute();
    $stmtDec->close();

    echo json_encode([
        "verified" => true,
        "order_id" => $orderId,
        "payment_status" => $paymentStatus,
        "message" => "Order successfully saved and verified."
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to save order to database: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
