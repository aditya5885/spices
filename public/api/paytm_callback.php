<?php
require_once 'config.php';
require_once 'PaytmChecksum.php';

$status = isset($_POST['STATUS']) ? $_POST['STATUS'] : '';
$orderId = isset($_POST['ORDERID']) ? $_POST['ORDERID'] : '';
$txnId = isset($_POST['TXNID']) ? $_POST['TXNID'] : '';
$amount = isset($_POST['TXNAMOUNT']) ? $_POST['TXNAMOUNT'] : '';
$paymentMode = isset($_POST['PAYMENTMODE']) ? $_POST['PAYMENTMODE'] : '';
$respMsg = isset($_POST['RESPMSG']) ? $_POST['RESPMSG'] : '';
$checksum = isset($_POST['CHECKSUMHASH']) ? $_POST['CHECKSUMHASH'] : '';

$paytmMerchantKey = getSetting('paytm_merchant_key');
$siteUrl = getSetting('site_url');
$siteUrl = rtrim($siteUrl, '/');

// Verify response signature
$isSignatureValid = false;
try {
    $isSignatureValid = PaytmChecksum::verifySignature($_POST, $paytmMerchantKey, $checksum);
} catch (Exception $e) {
    $isSignatureValid = false;
}

if (!$isSignatureValid) {
    // Update order status to failed due to security checksum mismatch
    $conn = getDB();
    $conn->select_db(DB_NAME);
    $stmtFailed = $conn->prepare("UPDATE orders SET payment_status = 'failed', order_status = 'cancelled', paytm_status = 'hash_mismatch' WHERE order_id = ?");
    $stmtFailed->bind_param("s", $orderId);
    $stmtFailed->execute();
    $stmtFailed->close();
    $conn->close();

    $failureUrl = $siteUrl . '/payment-failure.html?txnid=' . urlencode($orderId) . '&message=' . urlencode('Security verification failed. Paytm checksum did not match.');
    header("Location: " . $failureUrl);
    exit();
}

$conn = getDB();
$conn->select_db(DB_NAME);

// Get original order details
$stmtCheck = $conn->prepare("SELECT customer_name, product_slug, pack_size, quantity, payment_status FROM orders WHERE order_id = ?");
$stmtCheck->bind_param("s", $orderId);
$stmtCheck->execute();
$resCheck = $stmtCheck->get_result();
$rowCheck = $resCheck->fetch_assoc();

if (!$rowCheck) {
    $conn->close();
    $failureUrl = $siteUrl . '/payment-failure.html?txnid=' . urlencode($orderId) . '&message=' . urlencode('Order not found.');
    header("Location: " . $failureUrl);
    exit();
}

if ($status === "TXN_SUCCESS") {
    if ($rowCheck['payment_status'] !== 'completed') {
        // Update order status
        $stmtUpdate = $conn->prepare("UPDATE orders SET payment_status = 'completed', order_status = 'new', paytm_txnid = ?, paytm_status = ?, paytm_mode = ? WHERE order_id = ?");
        $stmtUpdate->bind_param("ssss", $txnId, $status, $paymentMode, $orderId);
        $stmtUpdate->execute();
        $stmtUpdate->close();
        
        // Decrement product inventory
        $pSlug = $rowCheck['product_slug'];
        $pQty = intval($rowCheck['quantity']);
        $stmtDec = $conn->prepare("UPDATE products SET stock_qty = stock_qty - ? WHERE slug = ?");
        $stmtDec->bind_param("is", $pQty, $pSlug);
        $stmtDec->execute();
        $stmtDec->close();
    }
    
    $stmtCheck->close();
    $conn->close();

    $successUrl = $siteUrl . '/payment-success.html?' . http_build_query([
        'txnid' => $orderId,
        'paymentId' => $txnId ? $txnId : 'unknown',
        'product' => $rowCheck['product_slug'],
        'size' => $rowCheck['pack_size'],
        'qty' => $rowCheck['quantity'],
        'name' => $rowCheck['customer_name'] ? $rowCheck['customer_name'] : 'Customer',
        'total' => $amount,
        'method' => 'Paytm'
    ]);
    header("Location: " . $successUrl);
    exit();
} else {
    // Update order status to failed
    $stmtFailed = $conn->prepare("UPDATE orders SET payment_status = 'failed', order_status = 'cancelled', paytm_status = ? WHERE order_id = ?");
    $stmtFailed->bind_param("ss", $status, $orderId);
    $stmtFailed->execute();
    $stmtFailed->close();
    
    $stmtCheck->close();
    $conn->close();

    $errorMessage = $respMsg ? $respMsg : 'Your payment could not be processed by Paytm.';
    $failureUrl = $siteUrl . '/payment-failure.html?' . http_build_query([
        'txnid' => $orderId,
        'amount' => $amount,
        'message' => $errorMessage
    ]);
    header("Location: " . $failureUrl);
    exit();
}
?>
