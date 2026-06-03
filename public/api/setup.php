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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if (!$conn->query($createProductsTable)) {
    die("Error creating products table: " . $conn->error);
}

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
    razorpay_order_id VARCHAR(100) NULL,
    razorpay_payment_id VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if (!$conn->query($createOrdersTable)) {
    die("Error creating orders table: " . $conn->error);
}

// 4. Seed default products if table is empty
$countResult = $conn->query("SELECT COUNT(*) as count FROM products");
$rowCount = $countResult->fetch_assoc();
$seeded = false;

if ($rowCount['count'] == 0) {
    $defaultProducts = [
        [
            'slug' => 'premium-turmeric',
            'name' => 'Premium Turmeric',
            'description' => 'Pure Alleppey Finger Turmeric with exceptionally high curcumin content, sun-dried to perfection.',
            'price_in_inr' => 722.50,
            'image' => 'https://lh3.googleusercontent.com/aida/ADBb0uhtKgRT1m4yMGEjgtZsCHGZdI9MazdpF6m6zzKRl6e_C15hn4lybVro_rJ2VpaOKGMJYDkEaAG2nT33WbEnFrmpMQFyC40qL22nzXQypE5UPFxA0f7EmRvNpVAy43OYQwXaUirOM2X6Qv3dFcD5eVeJq8HnwJcw8d0URSbMtQEHLfEm3xFgstmJIk00ZiyFDQ_JhdA5TqUFHDErdJ-OMxUZpCQW4WUex5SB7nq-McUCUF3XzXDC87b0JA',
            'badge' => '95% CURCUMIN',
            'specs' => 'Alleppey Finger, Organic Certified'
        ],
        [
            'slug' => 'black-pepper',
            'name' => 'Black Pepper',
            'description' => 'King of spices, bold MG1 grade black pepper from the Malabar coast, rich in piperine.',
            'price_in_inr' => 573.75,
            'image' => 'https://lh3.googleusercontent.com/aida/ADBb0ui8hqmXxngNsGTBdxpzgTR0NXOd9DhlwsOHZVfVX5SRLx1OhdfjBgENJxMvEy8jcmvwibi18kzU5dZc0m6kgr34pDAbldSJv-Lj6zX3AP-9yehez1DVQtMEx4zUap99rmjCt-bareqwY7PhXRfrHyp8xpo1nV002M14pehVPKQ2cUPxhjiTB3KyY1_BGLMxsv_w7JjbO-_eXb1en8S9hJGtYBo-BMNsQYTYkaifO4jhQJZgt00N3BrVmQ',
            'badge' => 'MG1 BOLD GRADE',
            'specs' => 'Malabar Bold, High Piperine'
        ],
        [
            'slug' => 'green-cardamom',
            'name' => 'Green Cardamom',
            'description' => 'Handpicked extra bold green pods from Idukki, renowned for their intense aroma and fresh flavor.',
            'price_in_inr' => 1870.00,
            'image' => 'https://lh3.googleusercontent.com/aida/ADBb0uhQpqVhUP9Zo9Td1Qh3bdZc_wWKBLevg6ETomEsCU3XifPpwO-tWh01MUIiCd05Ls3uvZvlntPlxHcO4JuUTpKICoyVq2dM6CCZ2q6cLTcLBwXOdZYGK3GL8XHk-KfdXVbnQK9fFYmmC8DxGyD5MwYiToQBodpfq_Do8sdVv8o2EmhcMLtZKp31p0sZ4754u0DS8_f0SM6LtsFARyiHQ-tX-ZYOye91i8O5oZMr3bSMd8uFCfMrOAsnDw',
            'badge' => '8MM+ BOLD',
            'specs' => 'Idukki Premium Green, Extra Bold'
        ],
        [
            'slug' => 'ceylon-cinnamon',
            'name' => 'Ceylon Cinnamon',
            'description' => 'Authentic thin-quilled cinnamon with a sweet, delicate aroma and low coumarin content.',
            'price_in_inr' => 1572.50,
            'image' => 'https://lh3.googleusercontent.com/aida/ADBb0uivuNcKhb4MxwMIKMFRJ2yig8S18rOXR2qvJuFtNU-pu4-qonZPVhTM4x1obkBV6X31_gVDEeG41Vnj-mtIoIaeP2Xx6fqBdNr4CsulaF5hbJsLg91yeAbQGYz8crSB2wuQ6YDmpniad9ME9R3oG39l-oM_nVyxUpVWjzPM-hcYTdd3365kNMkXJSK2sMa1-dK7SCW5i7P9bWPam55t0l6wLF6ihve26wAUu7mAHES-ZKCWeq_O_IPE4B0',
            'badge' => 'ALBA GRADE',
            'specs' => 'Thin Quill Ceylon, Organic'
        ],
        [
            'slug' => 'ginger-powder',
            'name' => 'Dry Ginger Powder',
            'description' => 'Zesty, sun-dried ginger ground into a fine powder. Perfect for tea, baking, and traditional recipes.',
            'price_in_inr' => 450.00,
            'image' => 'https://lh3.googleusercontent.com/aida/ADBb0uhtKgRT1m4yMGEjgtZsCHGZdI9MazdpF6m6zzKRl6e_C15hn4lybVro_rJ2VpaOKGMJYDkEaAG2nT33WbEnFrmpMQFyC40qL22nzXQypE5UPFxA0f7EmRvNpVAy43OYQwXaUirOM2X6Qv3dFcD5eVeJq8HnwJcw8d0URSbMtQEHLfEm3xFgstmJIk00ZiyFDQ_JhdA5TqUFHDErdJ-OMxUZpCQW4WUex5SB7nq-McUCUF3XzXDC87b0JA',
            'badge' => 'ORGANIC DRY',
            'specs' => 'Dry Ginger, Fine Ground'
        ],
        [
            'slug' => 'clove-buds',
            'name' => 'Premium Clove Buds',
            'description' => 'Highly aromatic handpicked clove buds from Kerala. Rich in essential oils with a sweet, spicy pungency.',
            'price_in_inr' => 950.00,
            'image' => 'https://lh3.googleusercontent.com/aida/ADBb0ui8hqmXxngNsGTBdxpzgTR0NXOd9DhlwsOHZVfVX5SRLx1OhdfjBgENJxMvEy8jcmvwibi18kzU5dZc0m6kgr34pDAbldSJv-Lj6zX3AP-9yehez1DVQtMEx4zUap99rmjCt-bareqwY7PhXRfrHyp8xpo1nV002M14pehVPKQ2cUPxhjiTB3KyY1_BGLMxsv_w7JjbO-_eXb1en8S9hJGtYBo-BMNsQYTYkaifO4jhQJZgt00N3BrVmQ',
            'badge' => 'EXTRA BOLD',
            'specs' => 'Handpicked Cloves, High Oil Content'
        ]
    ];

    $stmt = $conn->prepare("INSERT INTO products (slug, name, description, price_in_inr, image, badge, specs) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($defaultProducts as $p) {
        $stmt->bind_param("sssdsss", $p['slug'], $p['name'], $p['description'], $p['price_in_inr'], $p['image'], $p['badge'], $p['specs']);
        $stmt->execute();
    }
    $stmt->close();
    $seeded = true;
}

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
            <strong>Tables created:</strong> <code>products</code>, <code>orders</code><br>
            <strong>Seeding status:</strong> <?php echo $seeded ? 'Populated 6 default premium spices' : 'Already populated with active catalog'; ?>
        </div>
        <a href="admin_products.php" class="btn">Go to Admin Dashboard</a>
    </div>
</body>
</html>
