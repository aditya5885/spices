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

// Calculate reverse hash
// hash = sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
$baseSequence = PAYU_SALT . '|' . $status . '||||||' . $udf5 . '|' . $udf4 . '|' . $udf3 . '|' . $udf2 . '|' . $udf1 . '|' . $email . '|' . $firstname . '|' . $productinfo . '|' . $amount . '|' . $txnid . '|' . $key;

if ($additionalCharges) {
    $finalSequence = $additionalCharges . '|' . $baseSequence;
} else {
    $finalSequence = $baseSequence;
}

$calculatedHash = hash('sha512', $finalSequence);
$isSignatureValid = (strtolower($calculatedHash) === strtolower($hash));

$siteUrl = rtrim(SITE_URL, '/');

if (!$isSignatureValid) {
    $failureUrl = $siteUrl . '/payment-failure.html?txnid=' . urlencode($txnid) . '&message=' . urlencode('Security verification failed. The transaction response hash did not match.');
    header("Location: " . $failureUrl);
    exit();
}

if ($status === "success") {
    $method = $net_amount_debit ? "PayU Card/NetBanking" : "PayU Hosted Checkout";
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
