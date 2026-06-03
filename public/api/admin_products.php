<?php
// Start Session for admin authentication
session_start();
require_once 'config.php';

// Set header for HTML rendering (overriding default JSON header from config.php)
header("Content-Type: text/html; charset=UTF-8");

// Create database connection
$conn = getDB();
$conn->select_db(DB_NAME);

// Handle Admin Logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    $_SESSION['admin_logged_in'] = false;
    session_destroy();
    header("Location: admin_products.php");
    exit();
}

// Handle Admin Login POST request
$loginError = "";
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $passwordInput = isset($_POST['password']) ? $_POST['password'] : '';
    if ($passwordInput === ADMIN_PASSWORD) {
        $_SESSION['admin_logged_in'] = true;
        header("Location: admin_products.php");
        exit();
    } else {
        $loginError = "Incorrect dashboard security password. Please try again.";
    }
}

// Check Authentication status
$loggedIn = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

// Active Navigation Tab: 'catalog' or 'orders'
$tab = isset($_GET['tab']) ? $_GET['tab'] : 'catalog';

// Handle image upload helper
function processImageUpload() {
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    
    $uploadDir = __DIR__ . '/../uploads/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $fileName = time() . '_' . basename($_FILES['image']['name']);
    // Replace spaces and special characters
    $fileName = preg_replace("/[^a-zA-Z0-9._-]/", "_", $fileName);
    $targetFilePath = $uploadDir . $fileName;
    
    // Check file extension
    $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));
    $allowedTypes = array('jpg', 'jpeg', 'png', 'gif', 'webp');
    
    if (in_array($fileType, $allowedTypes)) {
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFilePath)) {
            // Return public web url path relative to site root
            return '/uploads/' . $fileName;
        }
    }
    return null;
}

// Handle Product Add, Edit, Delete CRUD Operations (If Logged In)
$message = "";
$messageType = "success";

if ($loggedIn && $_SERVER['REQUEST_METHOD'] === 'POST') {
    // Add Product Action
    if (isset($_POST['action']) && $_POST['action'] === 'add_product') {
        $name = $_POST['name'];
        $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower(str_replace(' ', '-', $_POST['slug'])));
        if (empty($slug)) {
            $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower(str_replace(' ', '-', $name)));
        }
        $description = $_POST['description'];
        $price = floatval($_POST['price_in_inr']);
        $badge = isset($_POST['badge']) ? $_POST['badge'] : '';
        $specs = isset($_POST['specs']) ? $_POST['specs'] : '';
        
        $imagePath = processImageUpload();
        if (!$imagePath) {
            // Fallback to text input URL or placeholder
            $imagePath = isset($_POST['image_url']) && !empty($_POST['image_url']) ? $_POST['image_url'] : 'https://placehold.co/600x400?text=' . urlencode($name);
        }
        
        // Check for duplicate slug
        $check = $conn->prepare("SELECT id FROM products WHERE slug = ?");
        $check->bind_param("s", $slug);
        $check->execute();
        $check->store_result();
        
        if ($check->num_rows > 0) {
            $message = "Error: A spice product with the slug '$slug' already exists.";
            $messageType = "error";
        } else {
            $stmt = $conn->prepare("INSERT INTO products (slug, name, description, price_in_inr, image, badge, specs) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sssdsss", $slug, $name, $description, $price, $imagePath, $badge, $specs);
            
            if ($stmt->execute()) {
                $message = "Spice '$name' has been added to the catalog successfully!";
            } else {
                $message = "Error adding spice: " . $conn->error;
                $messageType = "error";
            }
            $stmt->close();
        }
        $check->close();
    }
    
    // Edit Product Action
    if (isset($_POST['action']) && $_POST['action'] === 'edit_product') {
        $id = intval($_POST['id']);
        $name = $_POST['name'];
        $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower(str_replace(' ', '-', $_POST['slug'])));
        $description = $_POST['description'];
        $price = floatval($_POST['price_in_inr']);
        $badge = isset($_POST['badge']) ? $_POST['badge'] : '';
        $specs = isset($_POST['specs']) ? $_POST['specs'] : '';
        
        $imagePath = processImageUpload();
        
        if ($imagePath) {
            // New file uploaded, update image path
            $stmt = $conn->prepare("UPDATE products SET slug = ?, name = ?, description = ?, price_in_inr = ?, image = ?, badge = ?, specs = ? WHERE id = ?");
            $stmt->bind_param("sssdsssi", $slug, $name, $description, $price, $imagePath, $badge, $specs, $id);
        } else {
            // Keep existing image URL/path
            $imageUrl = isset($_POST['image_url']) ? $_POST['image_url'] : '';
            $stmt = $conn->prepare("UPDATE products SET slug = ?, name = ?, description = ?, price_in_inr = ?, image = ?, badge = ?, specs = ? WHERE id = ?");
            $stmt->bind_param("sssdsssi", $slug, $name, $description, $price, $imageUrl, $badge, $specs, $id);
        }
        
        if ($stmt->execute()) {
            $message = "Spice '$name' has been successfully updated!";
        } else {
            $message = "Error updating spice: " . $conn->error;
            $messageType = "error";
        }
        $stmt->close();
    }
}

// Handle GET-based deletions
if ($loggedIn && isset($_GET['action']) && $_GET['action'] === 'delete_product') {
    $id = intval($_GET['id']);
    // Fetch name for log message
    $nameQuery = $conn->query("SELECT name FROM products WHERE id = $id");
    if ($nameRow = $nameQuery->fetch_assoc()) {
        $name = $nameRow['name'];
        if ($conn->query("DELETE FROM products WHERE id = $id")) {
            $message = "Spice '$name' was successfully deleted.";
        } else {
            $message = "Error deleting product: " . $conn->error;
            $messageType = "error";
        }
    }
}

// Fetch data from database
$products = [];
$orders = [];

if ($loggedIn) {
    // 1. Fetch Products
    $prodResult = $conn->query("SELECT * FROM products ORDER BY id DESC");
    if ($prodResult) {
        while ($row = $prodResult->fetch_assoc()) {
            $products[] = $row;
        }
    }
    
    // 2. Fetch Orders
    $orderResult = $conn->query("SELECT * FROM orders ORDER BY id DESC");
    if ($orderResult) {
        while ($row = $orderResult->fetch_assoc()) {
            $orders[] = $row;
        }
    }
}

// Close connection at page render end
$conn->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exportia Spices - Admin Panel</title>
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #00450d;
            --primary-light: #f3fbf4;
            --accent: #845e3c;
            --accent-hover: #6d4b2e;
            --bg: #fbfaf8;
            --text-main: #2d241e;
            --text-muted: #6e645e;
            --card-border: #f1ece4;
            --success: #2e7d32;
            --danger: #c62828;
            --warning: #f9a825;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            min-height: 100vh;
        }

        h1, h2, h3, h4, .font-headline {
            font-family: 'Montserrat', sans-serif;
            font-weight: 700;
        }

        /* Authentication Page Style */
        .login-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            background: linear-gradient(135deg, #002206 0%, #00450d 100%);
        }

        .login-card {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            max-width: 420px;
            width: 100%;
            text-align: center;
        }

        .login-card h2 {
            color: var(--primary);
            margin-bottom: 8px;
            font-size: 1.8em;
        }

        .login-card p {
            color: var(--text-muted);
            margin-bottom: 24px;
            font-size: 0.95em;
        }

        .input-group {
            margin-bottom: 20px;
            text-align: left;
        }

        .input-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            font-size: 0.85em;
            color: var(--text-main);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .form-control {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #dcd7ce;
            border-radius: 8px;
            font-size: 1em;
            font-family: inherit;
            color: var(--text-main);
            transition: border-color 0.2s;
            background-color: #fdfdfc;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--primary);
            background-color: #fff;
        }

        .btn-submit {
            display: block;
            width: 100%;
            background-color: var(--accent);
            color: white;
            padding: 14px;
            border: none;
            border-radius: 8px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.1s;
            box-shadow: 0 4px 12px rgba(132, 94, 60, 0.2);
            font-family: 'Montserrat', sans-serif;
        }

        .btn-submit:hover {
            background-color: var(--accent-hover);
        }

        .btn-submit:active {
            transform: scale(0.99);
        }

        .error-banner {
            background-color: #ffebee;
            color: var(--danger);
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.9em;
            font-weight: 500;
            border: 1px solid #ffcdd2;
        }

        /* Header Style */
        header {
            background-color: white;
            border-bottom: 1px solid var(--card-border);
            padding: 16px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }

        .brand-title {
            color: var(--primary);
            font-size: 1.4em;
            letter-spacing: -0.5px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .brand-badge {
            background-color: var(--primary-light);
            color: var(--primary);
            font-size: 0.5em;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid rgba(0,69,13,0.1);
            vertical-align: middle;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .btn-logout {
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.9em;
            font-weight: 500;
            padding: 8px 16px;
            border-radius: 6px;
            border: 1px solid #eae5dc;
            transition: all 0.2s;
        }

        .btn-logout:hover {
            color: var(--danger);
            background-color: #ffebee;
            border-color: #ffcdd2;
        }

        /* Layout Grid */
        .dashboard-container {
            max-width: 1400px;
            margin: 40px auto;
            padding: 0 20px;
        }

        /* Alert notifications */
        .notification {
            padding: 16px 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .notification-success {
            background-color: var(--primary-light);
            color: var(--primary);
            border-left: 4px solid var(--primary);
        }

        .notification-error {
            background-color: #ffebee;
            color: var(--danger);
            border-left: 4px solid var(--danger);
        }

        /* Nav Tabs */
        .tabs {
            display: flex;
            border-bottom: 2px solid var(--card-border);
            margin-bottom: 30px;
            gap: 10px;
        }

        .tab-link {
            text-decoration: none;
            color: var(--text-muted);
            padding: 12px 24px;
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            font-size: 0.95em;
            border-bottom: 3px solid transparent;
            margin-bottom: -2px;
            transition: all 0.2s;
        }

        .tab-link:hover {
            color: var(--primary);
        }

        .tab-link.active {
            color: var(--primary);
            border-bottom-color: var(--primary);
        }

        /* Dashboard content structures */
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .section-header h2 {
            font-size: 1.6em;
            color: var(--primary);
        }

        .btn-add {
            background-color: var(--accent);
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.9em;
            transition: background-color 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 10px rgba(132,94,60,0.15);
        }

        .btn-add:hover {
            background-color: var(--accent-hover);
        }

        /* Tables style */
        .table-responsive {
            background: white;
            border: 1px solid var(--card-border);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(132, 94, 60, 0.02);
            margin-bottom: 40px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.95em;
        }

        th {
            background-color: #faf9f6;
            color: var(--text-main);
            font-weight: 600;
            font-family: 'Montserrat', sans-serif;
            padding: 16px 20px;
            border-bottom: 1px solid var(--card-border);
            font-size: 0.85em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        td {
            padding: 16px 20px;
            border-bottom: 1px solid var(--card-border);
            vertical-align: middle;
            color: var(--text-main);
        }

        tr:last-child td {
            border-bottom: none;
        }

        tr:hover td {
            background-color: #fcfbfa;
        }

        /* Badges */
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75em;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge-success {
            background-color: var(--primary-light);
            color: var(--success);
            border: 1px solid rgba(46,125,50,0.15);
        }

        .badge-pending {
            background-color: #fff9c4;
            color: #f57f17;
            border: 1px solid rgba(245,127,23,0.15);
        }

        .badge-failed {
            background-color: #ffebee;
            color: var(--danger);
            border: 1px solid rgba(198,40,40,0.15);
        }

        .badge-method {
            background-color: #eae5dc;
            color: var(--text-main);
            font-weight: 600;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 0.75em;
        }

        .badge-promo {
            background-color: #e3f2fd;
            color: #1565c0;
            border: 1px solid rgba(21,101,192,0.15);
        }

        /* Images and descriptions in table */
        .product-img-col {
            width: 80px;
        }
        
        .product-img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid var(--card-border);
            background-color: #f9f9f9;
        }

        .product-name-title {
            font-weight: 600;
            color: var(--primary);
            margin-bottom: 4px;
            font-size: 1.05em;
        }

        .product-slug-text {
            font-family: monospace;
            font-size: 0.8em;
            color: var(--text-muted);
        }

        .product-desc {
            max-width: 320px;
            font-size: 0.9em;
            color: var(--text-muted);
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .action-links {
            display: flex;
            gap: 12px;
        }

        .action-link {
            text-decoration: none;
            font-size: 0.85em;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .action-edit {
            background-color: #eae5dc;
            color: var(--text-main);
        }

        .action-edit:hover {
            background-color: #dcd7ce;
        }

        .action-delete {
            background-color: #ffebee;
            color: var(--danger);
        }

        .action-delete:hover {
            background-color: #ffcdd2;
        }

        /* Order Info Styles */
        .order-customer {
            font-size: 0.9em;
            line-height: 1.5;
        }

        .order-customer strong {
            font-size: 1.05em;
            color: var(--primary);
            display: block;
            margin-bottom: 2px;
        }

        .order-customer a {
            color: var(--accent);
            text-decoration: none;
        }

        .order-customer a:hover {
            text-decoration: underline;
        }

        .order-address {
            font-size: 0.85em;
            color: var(--text-muted);
            line-height: 1.4;
            max-width: 250px;
        }

        /* Admin Forms Panels */
        .panel-form {
            background: white;
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 25px rgba(0,0,0,0.02);
            margin-bottom: 40px;
            display: none; /* Toggle visible with JS */
        }

        .panel-form.active {
            display: block;
        }

        .panel-form h3 {
            color: var(--primary);
            margin-bottom: 24px;
            font-size: 1.3em;
            border-bottom: 1px solid var(--card-border);
            padding-bottom: 12px;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
        }

        .form-full {
            grid-column: span 2;
        }

        .form-actions {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            border-top: 1px solid var(--card-border);
            padding-top: 20px;
        }

        .btn-cancel {
            background: none;
            border: 1px solid #eae5dc;
            color: var(--text-muted);
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            font-family: 'Montserrat', sans-serif;
            transition: all 0.2s;
        }

        .btn-cancel:hover {
            background-color: #faf9f6;
            color: var(--text-main);
        }

        .file-upload-preview {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-top: 5px;
        }

        .file-preview-img {
            width: 50px;
            height: 50px;
            border-radius: 6px;
            object-fit: cover;
            border: 1px solid var(--card-border);
            display: none;
        }

        /* Empty state styling */
        .empty-state {
            text-align: center;
            padding: 60px 40px;
            color: var(--text-muted);
        }

        .empty-state svg {
            margin-bottom: 16px;
            color: #dcd7ce;
        }

        .empty-state p {
            font-size: 1.1em;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>

<?php if (!$loggedIn): ?>
    <!-- Admin Login Screen -->
    <div class="login-container">
        <div class="login-card">
            <h2>Exportia Spices</h2>
            <p>Admin Portal Dashboard Control</p>
            
            <?php if (!empty($loginError)): ?>
                <div class="error-banner"><?php echo htmlspecialchars($loginError); ?></div>
            <?php endif; ?>
            
            <form method="POST" action="admin_products.php">
                <input type="hidden" name="action" value="login">
                
                <div class="input-group">
                    <label for="password">Enter Portal Security Password</label>
                    <input type="password" id="password" name="password" class="form-control" placeholder="••••••••" required autofocus>
                </div>
                
                <button type="submit" class="btn-submit">Authenticate Portal</button>
            </form>
        </div>
    </div>
<?php else: ?>
    <!-- Authenticated Dashboard -->
    <header>
        <div class="brand-title">
            <strong>Exportia Spices</strong> <span class="brand-badge">ADMIN CONTROL</span>
        </div>
        
        <div class="header-actions">
            <span style="font-size: 0.9em; color: var(--text-muted);">Session Connected</span>
            <a href="admin_products.php?action=logout" class="btn-logout">Logout Portal</a>
        </div>
    </header>

    <div class="dashboard-container">
        <!-- Display Operation Messages -->
        <?php if (!empty($message)): ?>
            <div class="notification notification-<?php echo $messageType; ?>">
                <?php if ($messageType === 'success'): ?>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <?php else: ?>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <?php endif; ?>
                <span><?php echo htmlspecialchars($message); ?></span>
            </div>
        <?php endif; ?>

        <!-- Navigation Tabs -->
        <div class="tabs">
            <a href="admin_products.php?tab=catalog" class="tab-link <?php echo $tab === 'catalog' ? 'active' : ''; ?>">Spices Catalog</a>
            <a href="admin_products.php?tab=orders" class="tab-link <?php echo $tab === 'orders' ? 'active' : ''; ?>">Customer Orders</a>
        </div>

        <?php if ($tab === 'catalog'): ?>
            <!-- SPICES CATALOG CRUD PANELS -->
            <div class="section-header">
                <h2>Product Catalog</h2>
                <a href="#" class="btn-add" id="btn-toggle-add">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Add New Spice
                </a>
            </div>

            <!-- Create Product Form Panel -->
            <div class="panel-form" id="panel-add-form">
                <h3>Add New Spice Product</h3>
                <form method="POST" action="admin_products.php?tab=catalog" enctype="multipart/form-data">
                    <input type="hidden" name="action" value="add_product">
                    
                    <div class="form-grid">
                        <div class="input-group">
                            <label for="add-name">Product Name *</label>
                            <input type="text" id="add-name" name="name" class="form-control" placeholder="e.g. Premium Turmeric" required>
                        </div>
                        <div class="input-group">
                            <label for="add-slug">URL Slug (leave empty to auto-generate) </label>
                            <input type="text" id="add-slug" name="slug" class="form-control" placeholder="e.g. premium-turmeric">
                        </div>
                        <div class="input-group">
                            <label for="add-price">Price in INR (per kg) *</label>
                            <input type="number" id="add-price" name="price_in_inr" step="0.01" class="form-control" placeholder="722.50" required>
                        </div>
                        <div class="input-group">
                            <label for="add-badge">Highlight Badge (Optional)</label>
                            <input type="text" id="add-badge" name="badge" class="form-control" placeholder="e.g. 95% CURCUMIN">
                        </div>
                        <div class="input-group">
                            <label for="add-specs">Specifications Label (Optional)</label>
                            <input type="text" id="add-specs" name="specs" class="form-control" placeholder="e.g. Alleppey Finger, Organic Certified">
                        </div>
                        <div class="input-group">
                            <label for="add-image">Spice Image Upload (PNG/JPG/WEBP)</label>
                            <div class="file-upload-preview">
                                <input type="file" id="add-image" name="image" class="form-control" accept="image/*" onchange="previewImage(this, 'add-img-prev')">
                                <img id="add-img-prev" class="file-preview-img" src="" alt="preview">
                            </div>
                            <div style="margin-top: 10px;">
                                <label style="font-size: 0.75em; color: var(--text-muted);">Or paste remote Image URL directly:</label>
                                <input type="text" name="image_url" class="form-control" placeholder="https://example.com/spice.jpg">
                            </div>
                        </div>
                        <div class="input-group form-full">
                            <label for="add-description">Product Description *</label>
                            <textarea id="add-description" name="description" class="form-control" rows="4" placeholder="Describe the qualities, sourcing, and aroma of this spice..." required></textarea>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" onclick="closeFormPanels()">Cancel</button>
                        <button type="submit" class="btn-submit" style="width: auto; display: inline-block;">Save Product</button>
                    </div>
                </form>
            </div>

            <!-- Edit Product Form Panel -->
            <div class="panel-form" id="panel-edit-form">
                <h3>Edit Spice Details</h3>
                <form method="POST" action="admin_products.php?tab=catalog" enctype="multipart/form-data">
                    <input type="hidden" name="action" value="edit_product">
                    <input type="hidden" id="edit-id" name="id">
                    <input type="hidden" id="edit-image-url" name="image_url">
                    
                    <div class="form-grid">
                        <div class="input-group">
                            <label for="edit-name">Product Name *</label>
                            <input type="text" id="edit-name" name="name" class="form-control" required>
                        </div>
                        <div class="input-group">
                            <label for="edit-slug">URL Slug *</label>
                            <input type="text" id="edit-slug" name="slug" class="form-control" required>
                        </div>
                        <div class="input-group">
                            <label for="edit-price">Price in INR (per kg) *</label>
                            <input type="number" id="edit-price" name="price_in_inr" step="0.01" class="form-control" required>
                        </div>
                        <div class="input-group">
                            <label for="edit-badge">Highlight Badge</label>
                            <input type="text" id="edit-badge" name="badge" class="form-control">
                        </div>
                        <div class="input-group">
                            <label for="edit-specs">Specifications Label</label>
                            <input type="text" id="edit-specs" name="specs" class="form-control">
                        </div>
                        <div class="input-group">
                            <label>Spice Image (Upload to replace current)</label>
                            <div class="file-upload-preview">
                                <input type="file" name="image" class="form-control" accept="image/*" onchange="previewImage(this, 'edit-img-prev')">
                                <img id="edit-img-prev" class="file-preview-img" style="display: block;" src="" alt="current">
                            </div>
                        </div>
                        <div class="input-group form-full">
                            <label for="edit-description">Product Description *</label>
                            <textarea id="edit-description" name="description" class="form-control" rows="4" required></textarea>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" onclick="closeFormPanels()">Cancel</button>
                        <button type="submit" class="btn-submit" style="width: auto; display: inline-block;">Save Changes</button>
                    </div>
                </form>
            </div>

            <!-- Product Table -->
            <div class="table-responsive">
                <?php if (empty($products)): ?>
                    <div class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                        <p>No products found in the database. Run <code>setup.php</code> to add default products.</p>
                    </div>
                <?php else: ?>
                    <table>
                        <thead>
                            <tr>
                                <th class="product-img-col">Image</th>
                                <th>Spice Details</th>
                                <th>Description</th>
                                <th>Price per kg</th>
                                <th>Specs / Badge</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($products as $p): ?>
                                <tr>
                                    <td>
                                        <img class="product-img" src="<?php echo htmlspecialchars($p['image']); ?>" onerror="this.src='https://placehold.co/100?text=Spice'" alt="Product Image">
                                    </td>
                                    <td>
                                        <div class="product-name-title"><?php echo htmlspecialchars($p['name']); ?></div>
                                        <div class="product-slug-text">/product/<?php echo htmlspecialchars($p['slug']); ?></div>
                                    </td>
                                    <td>
                                        <div class="product-desc"><?php echo htmlspecialchars($p['description']); ?></div>
                                    </td>
                                    <td style="font-weight: 600; color: var(--primary);">
                                        ₹<?php echo number_format($p['price_in_inr'], 2); ?>
                                    </td>
                                    <td>
                                        <?php if (!empty($p['badge'])): ?>
                                            <span class="badge badge-promo" style="margin-bottom: 5px; display: inline-block;"><?php echo htmlspecialchars($p['badge']); ?></span><br>
                                        <?php endif; ?>
                                        <span style="font-size: 0.8em; color: var(--text-muted);"><?php echo htmlspecialchars($p['specs']); ?></span>
                                    </td>
                                    <td>
                                        <div class="action-links">
                                            <a href="#" class="action-link action-edit" onclick="openEditForm(<?php echo htmlspecialchars(json_encode($p)); ?>)">Edit</a>
                                            <a href="admin_products.php?tab=catalog&action=delete_product&id=<?php echo $p['id']; ?>" class="action-link action-delete" onclick="return confirm('Are you sure you want to delete <?php echo htmlspecialchars($p['name']); ?>?')">Delete</a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>

        <?php else: ?>
            <!-- CUSTOMER ORDERS TABLE -->
            <div class="section-header">
                <h2>Customer Orders Tracker</h2>
            </div>

            <div class="table-responsive">
                <?php if (empty($orders)): ?>
                    <div class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        <p>No customer orders recorded in the system yet.</p>
                    </div>
                <?php else: ?>
                    <table>
                        <thead>
                            <tr>
                                <th>Date &amp; Order ID</th>
                                <th>Customer details</th>
                                <th>Shipping Address</th>
                                <th>Order Items</th>
                                <th>Checkout Pricing</th>
                                <th>Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($orders as $o): ?>
                                <tr>
                                    <td>
                                        <div style="font-weight: 600; color: var(--primary);"><?php echo htmlspecialchars($o['order_id']); ?></div>
                                        <div style="font-size: 0.8em; color: var(--text-muted); margin-top: 4px;"><?php echo htmlspecialchars($o['created_at']); ?></div>
                                    </td>
                                    <td>
                                        <div class="order-customer">
                                            <strong><?php echo htmlspecialchars($o['customer_name']); ?></strong>
                                            <a href="mailto:<?php echo htmlspecialchars($o['email']); ?>"><?php echo htmlspecialchars($o['email']); ?></a><br>
                                            <a href="tel:<?php echo htmlspecialchars($o['phone']); ?>"><?php echo htmlspecialchars($o['phone']); ?></a>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="order-address">
                                            <?php echo htmlspecialchars($o['shipping_address']); ?>,<br>
                                            <?php echo htmlspecialchars($o['city']); ?>, <?php echo htmlspecialchars($o['state']); ?> - <?php echo htmlspecialchars($o['pin_code']); ?>
                                            <?php if (!empty($o['notes'])): ?>
                                                <div style="margin-top: 6px; font-style: italic; font-size: 0.95em; color: var(--accent);">
                                                    "<?php echo htmlspecialchars($o['notes']); ?>"
                                                </div>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="font-weight: 500;"><?php echo htmlspecialchars($o['product_slug']); ?></div>
                                        <div style="font-size: 0.85em; color: var(--text-muted); margin-top: 2px;">
                                            Size: <strong><?php echo htmlspecialchars($o['pack_size']); ?></strong> | Qty: <strong><?php echo htmlspecialchars($o['quantity']); ?></strong>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="line-height: 1.4; font-size: 0.9em;">
                                            Subtotal: ₹<?php echo number_format($o['subtotal'], 2); ?><br>
                                            Shipping: ₹<?php echo number_format($o['shipping_cost'], 2); ?><br>
                                            <?php if ($o['cod_fee'] > 0): ?>
                                                COD Fee: ₹<?php echo number_format($o['cod_fee'], 2); ?><br>
                                            <?php endif; ?>
                                            <strong style="color: var(--primary); font-size: 1.05em;">Total: ₹<?php echo number_format($o['total'], 2); ?></strong>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge badge-method" style="margin-bottom: 6px; display: inline-block;"><?php echo htmlspecialchars($o['payment_method']); ?></span><br>
                                        
                                        <?php if ($o['payment_status'] === 'completed'): ?>
                                            <span class="badge badge-success">Paid</span>
                                        <?php elseif ($o['payment_status'] === 'pending'): ?>
                                            <span class="badge badge-pending">COD Pending</span>
                                        <?php else: ?>
                                            <span class="badge badge-failed"><?php echo htmlspecialchars($o['payment_status']); ?></span>
                                        <?php endif; ?>
                                        
                                        <?php if (!empty($o['razorpay_payment_id'])): ?>
                                            <div style="font-size: 0.75em; font-family: monospace; color: var(--text-muted); margin-top: 6px;">
                                                Pay ID: <?php echo htmlspecialchars($o['razorpay_payment_id']); ?>
                                            </div>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>

    <!-- UI State JavaScript Handlers -->
    <script>
        const btnToggleAdd = document.getElementById('btn-toggle-add');
        const panelAddForm = document.getElementById('panel-add-form');
        const panelEditForm = document.getElementById('panel-edit-form');

        if (btnToggleAdd) {
            btnToggleAdd.addEventListener('click', function(e) {
                e.preventDefault();
                closeFormPanels();
                panelAddForm.classList.add('active');
                panelAddForm.scrollIntoView({ behavior: 'smooth' });
            });
        }

        function closeFormPanels() {
            if (panelAddForm) panelAddForm.classList.remove('active');
            if (panelEditForm) panelEditForm.classList.remove('active');
        }

        function previewImage(input, previewId) {
            const preview = document.getElementById(previewId);
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                reader.readAsDataURL(input.files[0]);
            }
        }

        function openEditForm(product) {
            closeFormPanels();
            
            document.getElementById('edit-id').value = product.id;
            document.getElementById('edit-name').value = product.name;
            document.getElementById('edit-slug').value = product.slug;
            document.getElementById('edit-price').value = product.price_in_inr;
            document.getElementById('edit-badge').value = product.badge;
            document.getElementById('edit-specs').value = product.specs;
            document.getElementById('edit-description').value = product.description;
            document.getElementById('edit-image-url').value = product.image;
            
            const prevImg = document.getElementById('edit-img-prev');
            prevImg.src = product.image;
            prevImg.style.display = 'block';
            
            panelEditForm.classList.add('active');
            panelEditForm.scrollIntoView({ behavior: 'smooth' });
        }
    </script>
<?php endif; ?>
</body>
</html>
