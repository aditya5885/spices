<?php
require_once 'config.php';

// Accept form-data
$status = isset($_POST['status']) ? $_POST['status'] : '';
$firstname = isset($_POST['firstname']) ? $_POST['firstname'] : '';
$amount = isset($_POST['amount']) ? $_POST['amount'] : '';
$txnid = isset($_POST['txnid']) ? $_POST['txnid'] : '';
$hash = isset($_POST['hash']) ? $_POST['hash'] : '';
$key = isset($_POST['key']) ? $_POST['key'] : '';
$productinfo = isset($_POST['productinfo']) ? $_POST['productinfo'] : '';
$email = isset($_POST['email']) ? $_POST['email'] : '';
$udf1 = isset($_POST['udf1']) ? $_POST['udf1'] : '';
$udf2 = isset($_POST['udf2']) ? $_POST['udf2'] : '';
$udf3 = isset($_POST['udf3']) ? $_POST['udf3'] : '';
$udf4 = isset($_POST['udf4']) ? $_POST['udf4'] : '';
$udf5 = isset($_POST['udf5']) ? $_POST['udf5'] : '';
$mihpayid = isset($_POST['mihpayid']) ? $_POST['mihpayid'] : '';
$error_Message = isset($_POST['error_Message']) ? $_POST['error_Message'] : '';
$unmappedstatus = isset($_POST['unmappedstatus']) ? $_POST['unmappedstatus'] : '';
$net_amount_debit = isset($_POST['net_amount_debit']) ? $_POST['net_amount_debit'] : '';
$additionalCharges = isset($_POST['additionalCharges']) ? $_POST['additionalCharges'] : '';

$payuKey = getSetting('payu_key');
$payuSalt = getSetting('payu_salt');

// Calculate reverse hash
// hash = sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
$baseSequence = $payuSalt . '|' . $status . '||||||' . $udf5 . '|' . $udf4 . '|' . $udf3 . '|' . $udf2 . '|' . $udf1 . '|' . $email . '|' . $firstname . '|' . $productinfo . '|' . $amount . '|' . $txnid . '|' . $key;

if ($additionalCharges) {
    $finalSequence = $additionalCharges . '|' . $baseSequence;
} else {
    $finalSequence = $baseSequence;
}

$calculatedHash = hash('sha512', $finalSequence);
$isSignatureValid = (strtolower($calculatedHash) === strtolower($hash));

$siteUrl = getSetting('site_url');
$siteUrl = rtrim($siteUrl, '/');

if (!$isSignatureValid) {
    // Mark order as failed due to signature verification failure
    $conn = getDB();
    $conn->select_db(DB_NAME);
    $stmtFailed = $conn->prepare("UPDATE orders SET payment_status = 'failed', order_status = 'cancelled', payu_status = 'hash_mismatch' WHERE order_id = ? OR payu_txnid = ?");
    $stmtFailed->bind_param("ss", $txnid, $txnid);
    $stmtFailed->execute();
    $stmtFailed->close();
    $conn->close();

    $failureUrl = $siteUrl . '/payment-failure.html?txnid=' . urlencode($txnid) . '&message=' . urlencode('Security verification failed. The transaction response hash did not match.');
    header("Location: " . $failureUrl);
    exit();
}

if ($status === "success") {
    $method = $net_amount_debit ? "PayU Card/NetBanking" : "PayU Hosted Checkout";
    
    // Update order status to completed and decrement stock
    $conn = getDB();
    $conn->select_db(DB_NAME);
    
    // Check if order is already completed to prevent double-decrementing stock
    $stmtCheck = $conn->prepare("SELECT payment_status, product_slug, quantity FROM orders WHERE order_id = ? OR payu_txnid = ?");
    $stmtCheck->bind_param("ss", $txnid, $txnid);
    $stmtCheck->execute();
    $resCheck = $stmtCheck->get_result();
    if ($rowCheck = $resCheck->fetch_assoc()) {
        if ($rowCheck['payment_status'] !== 'completed') {
            // Update order record
            $stmtUpdate = $conn->prepare("UPDATE orders SET payment_status = 'completed', order_status = 'new', payu_mihpayid = ?, payu_status = ?, payu_mode = ?, payu_txnid = ? WHERE order_id = ? OR payu_txnid = ?");
            $stmtUpdate->bind_param("ssssss", $mihpayid, $status, $method, $txnid, $txnid, $txnid);
            $stmtUpdate->execute();
            $stmtUpdate->close();
            
            // Decrement product stock
            $pSlug = $rowCheck['product_slug'];
            $pQty = intval($rowCheck['quantity']);
            $stmtDec = $conn->prepare("UPDATE products SET stock_qty = stock_qty - ? WHERE slug = ?");
            $stmtDec->bind_param("is", $pQty, $pSlug);
            $stmtDec->execute();
            $stmtDec->close();
        }
    }
    $stmtCheck->close();
    $conn->close();

    $successUrl = $siteUrl . '/payment-success.html?' . http_build_query([
        'txnid' => $txnid,
        'paymentId' => $mihpayid ? $mihpayid : 'unknown',
        'product' => $udf1,
        'size' => $udf2,
        'qty' => $udf3,
        'name' => $firstname ? $firstname : 'Customer',
        'total' => $amount,
        'method' => $method
    ]);
    header("Location: " . $successUrl);
    exit();
} else {
    // Update order to failed
    $conn = getDB();
    $conn->select_db(DB_NAME);
    $stmtFailed = $conn->prepare("UPDATE orders SET payment_status = 'failed', order_status = 'cancelled', payu_status = ?, payu_txnid = ? WHERE order_id = ? OR payu_txnid = ?");
    $stmtFailed->bind_param("ssss", $status, $txnid, $txnid, $txnid);
    $stmtFailed->execute();
    $stmtFailed->close();
    $conn->close();

    $errorMessage = $error_Message ? $error_Message : ($unmappedstatus ? $unmappedstatus : 'Your payment could not be processed by the bank.');
    $failureUrl = $siteUrl . '/payment-failure.html?' . http_build_query([
        'txnid' => $txnid,
        'amount' => $amount,
        'message' => $errorMessage
    ]);
    header("Location: " . $failureUrl);
    exit();
}
?>
