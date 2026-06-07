<?php
require_once 'config.php';
header("Content-Type: text/html; charset=UTF-8");

// Connect to MySQL server (without selecting DB since we might need to create it)
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
if ($conn->connect_error) {
    die("<div style='color:#b71c1c; font-family:system-ui, sans-serif; padding:40px; text-align:center;'>
            <h2>Database Connection Failed</h2>
            <p style='color:#555;'>Please configure your database credentials in <code>api/config.php</code> first.</p>
            <p style='background:#fbe9e7; padding:10px; display:inline-block; border-radius:4px;'>Error: " . htmlspecialchars($conn->connect_error) . "</p>
         </div>");
}

// 1. Create Database if not exists
$dbName = DB_NAME;
$sql = "CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
if (!$conn->query($sql)) {
    die("<div style='color:#b71c1c; font-family:system-ui, sans-serif; padding:40px;'>
            <h2>Error creating database</h2>
            <p>" . htmlspecialchars($conn->error) . "</p>
         </div>");
}

// Select Database
$conn->select_db($dbName);

// Helper function to check and add column if it doesn't exist
function addColumnIfNotExists($conn, $table, $column, $definition) {
    $result = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
    if ($result && $result->num_rows == 0) {
        $conn->query("ALTER TABLE `$table` ADD `$column` $definition");
    }
}

// 2. Create Products Table
$createProductsTable = "CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price_in_inr DECIMAL(10,2) NOT NULL,
    image VARCHAR(512) NOT NULL,
    badge VARCHAR(100) NULL,
    specs VARCHAR(255) NULL,
    stock_qty INT DEFAULT 50,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if (!$conn->query($createProductsTable)) {
    die("Error creating products table: " . $conn->error);
}

// Add columns to products table if they don't exist
addColumnIfNotExists($conn, 'products', 'stock_qty', 'INT DEFAULT 50 AFTER specs');
addColumnIfNotExists($conn, 'products', 'is_active', 'TINYINT(1) DEFAULT 1 AFTER stock_qty');

// 3. Create Orders Table
$createOrdersTable = "CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pin_code VARCHAR(20) NOT NULL,
    notes TEXT NULL,
    product_slug VARCHAR(100) NOT NULL,
    pack_size VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL,
    cod_fee DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    order_status VARCHAR(50) DEFAULT 'new',
    razorpay_order_id VARCHAR(100) NULL,
    razorpay_payment_id VARCHAR(100) NULL,
    payu_mihpayid VARCHAR(100) NULL,
    payu_txnid VARCHAR(100) NULL,
    payu_status VARCHAR(50) NULL,
    payu_mode VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if (!$conn->query($createOrdersTable)) {
    die("Error creating orders table: " . $conn->error);
}

// Add columns to orders table if they don't exist
addColumnIfNotExists($conn, 'orders', 'order_status', "VARCHAR(50) DEFAULT 'new' AFTER payment_status");
addColumnIfNotExists($conn, 'orders', 'payu_mihpayid', "VARCHAR(100) NULL AFTER razorpay_payment_id");
addColumnIfNotExists($conn, 'orders', 'payu_txnid', "VARCHAR(100) NULL AFTER payu_mihpayid");
addColumnIfNotExists($conn, 'orders', 'payu_status', "VARCHAR(50) NULL AFTER payu_txnid");
addColumnIfNotExists($conn, 'orders', 'payu_mode', "VARCHAR(50) NULL AFTER payu_status");

// 4. Create Settings Table
$createSettingsTable = "CREATE TABLE IF NOT EXISTS settings (
    key_name VARCHAR(100) PRIMARY KEY,
    value_text TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if (!$conn->query($createSettingsTable)) {
    die("Error creating settings table: " . $conn->error);
}

// Seed Settings Table
$defaultSettings = [
    'razorpay_key_id' => RAZORPAY_KEY_ID,
    'razorpay_key_secret' => RAZORPAY_KEY_SECRET,
    'payu_key' => PAYU_KEY,
    'payu_salt' => PAYU_SALT,
    'payu_merchant_id' => PAYU_MERCHANT_ID,
    'payu_base_url' => PAYU_BASE_URL,
    'site_url' => SITE_URL,
    'admin_password' => ADMIN_PASSWORD,
    'new_order_email' => 'admin@vintageglobaltrading.com'
];

$stmtSet = $conn->prepare("INSERT INTO settings (key_name, value_text) VALUES (?, ?) ON DUPLICATE KEY UPDATE key_name = key_name");
foreach ($defaultSettings as $k => $v) {
    $stmtSet->bind_param("ss", $k, $v);
    $stmtSet->execute();
}
$stmtSet->close();

// 5. Seed default products if table is empty
$countResult = $conn->query("SELECT COUNT(*) as count FROM products");
$rowCount = $countResult->fetch_assoc();
$seeded = false;

$defaultProducts = [
    [
        'slug' => 'premium-turmeric',
        'name' => 'Premium Turmeric',
        'description' => 'Pure Alleppey Finger Turmeric with exceptionally high curcumin content, sun-dried to perfection.',
        'price_in_inr' => 722.50,
        'image' => '/images/turmeric.png',
        'badge' => '95% CURCUMIN',
        'specs' => 'Alleppey Finger, Organic Certified',
        'stock_qty' => 120,
        'is_active' => 1
    ],
    [
        'slug' => 'black-pepper',
        'name' => 'Black Pepper',
        'description' => 'King of spices, bold MG1 grade black pepper from the Malabar coast, rich in piperine.',
        'price_in_inr' => 573.75,
        'image' => '/images/black_pepper.png',
        'badge' => 'MG1 BOLD GRADE',
        'specs' => 'Malabar Bold, High Piperine',
        'stock_qty' => 85,
        'is_active' => 1
    ],
    [
        'slug' => 'green-cardamom',
        'name' => 'Green Cardamom',
        'description' => 'Handpicked extra bold green pods from Idukki, renowned for their intense aroma and fresh flavor.',
        'price_in_inr' => 1870.00,
        'image' => '/images/cardamom.png',
        'badge' => '8MM+ BOLD',
        'specs' => 'Idukki Premium Green, Extra Bold',
        'stock_qty' => 45,
        'is_active' => 1
    ],
    [
        'slug' => 'ceylon-cinnamon',
        'name' => 'Ceylon Cinnamon',
        'description' => 'Authentic thin-quilled cinnamon with a sweet, delicate aroma and low coumarin content.',
        'price_in_inr' => 1572.50,
        'image' => '/images/cinnamon.png',
        'badge' => 'ALBA GRADE',
        'specs' => 'Thin Quill Ceylon, Organic',
        'stock_qty' => 60,
        'is_active' => 1
    ],
    [
        'slug' => 'ginger-powder',
        'name' => 'Dry Ginger Powder',
        'description' => 'Zesty, sun-dried ginger ground into a fine powder. Perfect for tea, baking, and traditional recipes.',
        'price_in_inr' => 450.00,
        'image' => '/images/ginger_powder.png',
        'badge' => 'ORGANIC DRY',
        'specs' => 'Dry Ginger, Fine Ground',
        'stock_qty' => 150,
        'is_active' => 1
    ],
    [
        'slug' => 'clove-buds',
        'name' => 'Premium Clove Buds',
        'description' => 'Highly aromatic handpicked clove buds from Kerala. Rich in essential oils with a sweet, spicy pungency.',
        'price_in_inr' => 950.00,
        'image' => '/images/cloves.png',
        'badge' => 'EXTRA BOLD',
        'specs' => 'Handpicked Cloves, High Oil Content',
        'stock_qty' => 70,
        'is_active' => 1
    ]
];

$stmtInsert = $conn->prepare("INSERT INTO products (slug, name, description, price_in_inr, image, badge, specs, stock_qty, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmtUpdate = $conn->prepare("UPDATE products SET image = ?, stock_qty = ?, is_active = ? WHERE slug = ?");

foreach ($defaultProducts as $p) {
    if ($rowCount['count'] == 0) {
        $stmtInsert->bind_param("sssdsssii", $p['slug'], $p['name'], $p['description'], $p['price_in_inr'], $p['image'], $p['badge'], $p['specs'], $p['stock_qty'], $p['is_active']);
        $stmtInsert->execute();
        $seeded = true;
    } else {
        // Update the image path, stock_qty, is_active for existing products matching default slugs
        $stmtUpdate->bind_param("siis", $p['image'], $p['stock_qty'], $p['is_active'], $p['slug']);
        $stmtUpdate->execute();
    }
}

$stmtInsert->close();
$stmtUpdate->close();

$conn->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exportia Spices - DB Setup</title>
    <style>
        body { font-family: 'Montserrat', 'Inter', sans-serif; background-color: #fcfbfa; color: #2d241e; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(132, 94, 60, 0.08); text-align: center; max-width: 500px; width: 90%; border: 1px solid #f1ece4; }
        h1 { color: #845e3c; margin-top: 0; font-weight: 600; letter-spacing: -0.5px; }
        .status { color: #2e7d32; font-weight: 600; margin: 20px 0; font-size: 1.1em; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .details { font-size: 0.95em; color: #5c4e43; text-align: left; background: #FAF9F6; border: 1px solid #eae5dc; padding: 20px; border-radius: 8px; line-height: 1.6; }
        .btn { display: inline-block; background-color: #845e3c; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; margin-top: 25px; font-weight: 500; transition: all 0.2s ease; border: none; box-shadow: 0 4px 12px rgba(132, 94, 60, 0.2); }
        .btn:hover { background-color: #6d4b2e; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(132, 94, 60, 0.3); }
    </style>
</head>
<body>
    <div class="card">
        <h1>Exportia Spices Database Setup</h1>
        <p class="status">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Database &amp; Tables Initialized!
        </p>
        <div class="details">
            <strong>Database Target:</strong> <code><?php echo htmlspecialchars($dbName); ?></code><br>
            <strong>Tables created/updated:</strong> <code>products</code>, <code>orders</code>, <code>settings</code><br>
            <strong>Seeding status:</strong> <?php echo $seeded ? 'Populated default premium spices & system settings' : 'Upgraded tables to support stock and status'; ?>
        </div>
        <a href="admin.php" class="btn">Go to Admin Dashboard</a>
    </div>
</body>
</html>
