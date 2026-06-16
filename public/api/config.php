<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set default headers for API responses
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle CORS Preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Credentials (configured for local setup, client modifies on cPanel)
define('DB_HOST', 'localhost');
define('DB_USER', 'vintae75_spices_user');
define('DB_PASS', 'SpicesPay2026!Aa9');
define('DB_NAME', 'vintae75_spices_db');

// Razorpay Credentials (test credentials, client modifies on cPanel)
define('RAZORPAY_KEY_ID', 'rzp_test_lE1QvWvDylfC5P'); 
define('RAZORPAY_KEY_SECRET', 'zVqF4h11s7YVp5uC7Y36Zf5E');

// PayU Credentials (test credentials, client modifies on cPanel)
define('PAYU_KEY', 'gmjiH9');
define('PAYU_SALT', 'VLC5JLnZa4qJ5SzFBAtUe269Oztl1uPp');
define('PAYU_MERCHANT_ID', 'your_merchant_id');
define('PAYU_BASE_URL', 'https://test.payu.in');
define('SITE_URL', 'https://vintageglobaltrading.com');

// Paytm Credentials (test credentials, client modifies on cPanel)
define('PAYTM_MID', 'rdWAFo18634751496152');
define('PAYTM_MERCHANT_KEY', 'E9#KULkD&o8kuU&H');
define('PAYTM_WEBSITE', 'WEBSTAGING');
define('PAYTM_INDUSTRY_TYPE', 'Retail');
define('PAYTM_CHANNEL_ID', 'WEB');
define('PAYTM_BASE_URL', 'https://securestage.paytmpayments.com');

// Admin Configuration (for product editing dashboard)
define('ADMIN_PASSWORD', 'spices2026');

// Helper function to return database connection
function getDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
    
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
        exit();
    }

    // Try to select database, if it doesn't exist, setup.php will create it
    if (!$conn->select_db(DB_NAME)) {
        // We will let setup.php handle DB creation. For now, establish connection without DB selected
    }
    
    $conn->set_charset("utf8mb4");
    return $conn;
}

// Helper function to get settings from settings table, falling back to constants if table/key doesn't exist
function getSetting($key, $default = null) {
    // If table doesn't exist or DB connection fails, use predefined constants as fallbacks
    $fallbackConstants = [
        'razorpay_key_id' => 'RAZORPAY_KEY_ID',
        'razorpay_key_secret' => 'RAZORPAY_KEY_SECRET',
        'payu_key' => 'PAYU_KEY',
        'payu_salt' => 'PAYU_SALT',
        'payu_merchant_id' => 'PAYU_MERCHANT_ID',
        'payu_base_url' => 'PAYU_BASE_URL',
        'paytm_mid' => 'PAYTM_MID',
        'paytm_merchant_key' => 'PAYTM_MERCHANT_KEY',
        'paytm_website' => 'PAYTM_WEBSITE',
        'paytm_industry_type' => 'PAYTM_INDUSTRY_TYPE',
        'paytm_channel_id' => 'PAYTM_CHANNEL_ID',
        'paytm_base_url' => 'PAYTM_BASE_URL',
        'site_url' => 'SITE_URL',
        'admin_password' => 'ADMIN_PASSWORD'
    ];

    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            throw new Exception("DB Connection failed");
        }
        $conn->set_charset("utf8mb4");
        
        $stmt = $conn->prepare("SELECT value_text FROM settings WHERE key_name = ?");
        if ($stmt) {
            $stmt->bind_param("s", $key);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($row = $result->fetch_assoc()) {
                $stmt->close();
                $conn->close();
                return $row['value_text'];
            }
            $stmt->close();
        }
        $conn->close();
    } catch (Exception $e) {
        // Silent fail, fallback to constants
    }

    if (isset($fallbackConstants[$key]) && defined($fallbackConstants[$key])) {
        return constant($fallbackConstants[$key]);
    }
    
    return $default;
}

// Global Order Confirmation Email Notification Helper
function sendOrderEmail($orderId) {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
        if ($conn->connect_error) {
            return false;
        }
        $conn->select_db(DB_NAME);
        $conn->set_charset("utf8mb4");
        
        $stmt = $conn->prepare("SELECT * FROM orders WHERE order_id = ? OR payu_txnid = ? OR paytm_txnid = ?");
        $stmt->bind_param("sss", $orderId, $orderId, $orderId);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($order = $res->fetch_assoc()) {
            $customerName = $order['customer_name'];
            $customerEmail = $order['email'];
            $phone = $order['phone'];
            $address = $order['shipping_address'] . ", " . $order['city'] . ", " . $order['state'] . " - " . $order['pin_code'];
            $productSlug = $order['product_slug'];
            $packSize = $order['pack_size'];
            $quantity = $order['quantity'];
            $total = $order['total'];
            $paymentMethod = $order['payment_method'];
            $paymentStatus = $order['payment_status'];
            $notes = $order['notes'];
            $createdAt = $order['created_at'];
            
            // Get dynamic admin notification email
            $adminEmail = getSetting('new_order_email', 'admin@vintageglobaltrading.com');
            $siteUrl = getSetting('site_url', 'https://vintageglobaltrading.com');
            
            // Resolve product name
            $productName = ucfirst(str_replace('-', ' ', $productSlug));
            $stmtProd = $conn->prepare("SELECT name FROM products WHERE slug = ?");
            $stmtProd->bind_param("s", $productSlug);
            $stmtProd->execute();
            $resProd = $stmtProd->get_result();
            if ($prodRow = $resProd->fetch_assoc()) {
                $productName = $prodRow['name'];
            }
            $stmtProd->close();
            
            // Prepare email headers
            $headers = "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
            $headers .= "From: Exportia Spices <info@vintageglobaltrading.com>\r\n";
            $headers .= "Reply-To: info@vintageglobaltrading.com\r\n";
            
            // 1. Email to Customer
            $subjectCustomer = "Order Confirmed - " . $order['order_id'] . " | Exportia Spices";
            $bodyCustomer = "
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #2d241e; background-color: #faf9f6; padding: 20px; margin: 0; }
                    .card { background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #f1ece4; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
                    .header { text-align: center; border-bottom: 2px solid #00450d; padding-bottom: 20px; margin-bottom: 25px; }
                    .logo { max-height: 50px; }
                    .headline { color: #00450d; font-size: 20px; font-weight: bold; margin-top: 15px; }
                    .section-title { font-size: 14px; font-weight: bold; color: #845e3c; border-bottom: 1px solid #f1ece4; padding-bottom: 5px; margin-top: 25px; margin-bottom: 15px; text-transform: uppercase; }
                    .item-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    .item-table th { background: #f3fbf4; color: #00450d; font-weight: 600; padding: 10px; text-align: left; font-size: 13px; }
                    .item-table td { padding: 10px; border-bottom: 1px solid #f1ece4; font-size: 13px; }
                    .total-row { font-weight: bold; color: #00450d; font-size: 15px; }
                    .footer { text-align: center; font-size: 11px; color: #6e645e; margin-top: 30px; border-top: 1px solid #f1ece4; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class='card'>
                    <div class='header'>
                        <img src='https://vintageglobaltrading.com/images/headlogo_trimmed.png' class='logo' alt='Exportia Spices'><br>
                        <div class='headline'>Thank You for Your Order!</div>
                        <p style='font-size:13px; color:#6e645e; margin: 5px 0 0 0;'>Your order has been successfully placed and is now being processed.</p>
                    </div>
                    
                    <div class='section-title'>Order details</div>
                    <p style='font-size:13px; margin: 0;'>
                        <strong>Order Reference:</strong> " . htmlspecialchars($order['order_id']) . "<br>
                        <strong>Order Date:</strong> {$createdAt}<br>
                        <strong>Payment Method:</strong> " . strtoupper($paymentMethod) . " (" . ucfirst($paymentStatus) . ")
                    </p>
                    
                    <div class='section-title'>Items Ordered</div>
                    <table class='item-table'>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Pack Size</th>
                                <th>Qty</th>
                                <th style='text-align:right;'>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>" . htmlspecialchars($productName) . "</td>
                                <td>" . htmlspecialchars($packSize) . "</td>
                                <td>{$quantity}</td>
                                <td style='text-align:right;'>₹" . number_format($total, 2) . "</td>
                            </tr>
                            <tr class='total-row'>
                                <td colspan='3' style='text-align:right;'>Total paid:</td>
                                <td style='text-align:right;'>₹" . number_format($total, 2) . "</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class='section-title'>Delivery Coordinates</div>
                    <p style='font-size:13px; margin: 0;'>
                        <strong>Name:</strong> " . htmlspecialchars($customerName) . "<br>
                        <strong>Phone:</strong> " . htmlspecialchars($phone) . "<br>
                        <strong>Address:</strong> " . htmlspecialchars($address) . "
                        " . (!empty($notes) ? "<br><strong>Instructions:</strong> <em>\"" . htmlspecialchars($notes) . "\"</em>" : "") . "
                    </p>
                    
                    <div class='footer'>
                        &copy; " . date('Y') . " Vintage Global Ventures Private Limited. All Rights Reserved.<br>
                        Kochi, Kerala, India | info@vintageglobaltrading.com
                    </div>
                </div>
            </body>
            </html>";
            
            // Send email to Customer
            mail($customerEmail, $subjectCustomer, $bodyCustomer, $headers);
            
            // 2. Email to Admin (Store Owner)
            $subjectAdmin = "New Spice Order Received - " . $order['order_id'] . " | Admin Alert";
            $bodyAdmin = "
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #2d241e; background-color: #f6f6f6; padding: 20px; margin: 0; }
                    .card { background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #eae5dc; max-width: 600px; margin: 0 auto; }
                    .header { background: #00450d; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; }
                    .content { padding: 20px; font-size: 13px; }
                    .section-title { font-size: 12px; font-weight: bold; color: #845e3c; border-bottom: 1px solid #eae5dc; padding-bottom: 5px; margin-top: 20px; text-transform: uppercase; }
                    .table { width:100%; margin-top:10px; border-collapse:collapse; }
                    .table td { padding:8px; border-bottom: 1px solid #f6f6f6; }
                </style>
            </head>
            <body>
                <div class='card'>
                    <div class='header'>
                        <h3 style='margin:0;'>New Order Received</h3>
                    </div>
                    <div class='content'>
                        <p>A new spice order has been successfully placed and verified in the database.</p>
                        
                        <div class='section-title'>Order Overview</div>
                        <table class='table'>
                            <tr><td><strong>Order ID:</strong></td><td>" . htmlspecialchars($order['order_id']) . "</td></tr>
                            <tr><td><strong>Payment:</strong></td><td>" . strtoupper($paymentMethod) . " ({$paymentStatus})</td></tr>
                            <tr><td><strong>Date:</strong></td><td>{$createdAt}</td></tr>
                            <tr><td><strong>Total Amount:</strong></td><td style='color:#00450d; font-weight:bold;'>₹" . number_format($total, 2) . "</td></tr>
                        </table>
                        
                        <div class='section-title'>Item Details</div>
                        <table class='table'>
                            <tr><td><strong>Spice:</strong></td><td>" . htmlspecialchars($productName) . "</td></tr>
                            <tr><td><strong>Pack Size:</strong></td><td>" . htmlspecialchars($packSize) . "</td></tr>
                            <tr><td><strong>Quantity:</strong></td><td>{$quantity} Packs</td></tr>
                        </table>
                        
                        <div class='section-title'>Customer Coordinates</div>
                        <table class='table'>
                            <tr><td><strong>Name:</strong></td><td>" . htmlspecialchars($customerName) . "</td></tr>
                            <tr><td><strong>Email:</strong></td><td>" . htmlspecialchars($customerEmail) . "</td></tr>
                            <tr><td><strong>Phone:</strong></td><td>" . htmlspecialchars($phone) . "</td></tr>
                            <tr><td><strong>Shipping address:</strong></td><td>" . htmlspecialchars($address) . "</td></tr>
                            <tr><td><strong>Notes:</strong></td><td>" . (!empty($notes) ? htmlspecialchars($notes) : 'None') . "</td></tr>
                        </table>
                        
                        <p style='margin-top:25px;'><a href='" . htmlspecialchars($siteUrl) . "/admin' style='display:inline-block; background:#845e3c; color:white; padding:10px 20px; border-radius:6px; text-decoration:none; font-weight:bold;'>Go to Admin Dashboard</a></p>
                    </div>
                </div>
            </body>
            </html>";
            
            // Send email to Admin
            mail($adminEmail, $subjectAdmin, $bodyAdmin, $headers);
        }
        $stmt->close();
        $conn->close();
        return true;
    } catch (Exception $e) {
        return false;
    }
}
?>
