<?php
session_start();
require_once 'config.php';

// Override JSON content-type from config.php — this page serves HTML
header("Content-Type: text/html; charset=UTF-8");

// Create database connection
$conn = getDB();
$conn->select_db(DB_NAME);

// Handle Logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    $_SESSION['admin_logged_in'] = false;
    session_destroy();
    header("Location: admin.php");
    exit();
}

// Handle Login
$loginError = "";
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $passwordInput = isset($_POST['password']) ? $_POST['password'] : '';
    $storedPass = getSetting('admin_password');
    if ($passwordInput === $storedPass) {
        $_SESSION['admin_logged_in'] = true;
        header("Location: admin.php");
        exit();
    } else {
        $loginError = "Incorrect dashboard security password. Please try again.";
    }
}

// Authentication check
$loggedIn = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

// If not logged in, render the login page
if (!$loggedIn) {
    ?>
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard Login - Exportia Spices</title>
        <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700&display=swap"
            rel="stylesheet">
        <style>
            :root {
                --primary: #00450d;
                --accent: #845e3c;
                --bg: #fbfaf8;
                --text: #2d241e;
            }

            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }

            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #002206 0%, #00450d 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .login-card {
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 10px 45px rgba(0, 0, 0, 0.25);
                max-width: 420px;
                width: 100%;
                text-align: center;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .logo-img {
                max-height: 80px;
                margin-bottom: 25px;
            }

            h2 {
                font-family: 'Montserrat', sans-serif;
                color: var(--primary);
                font-size: 1.6rem;
                margin-bottom: 10px;
                font-weight: 700;
            }

            p {
                color: #6e645e;
                font-size: 0.95rem;
                margin-bottom: 30px;
            }

            .error-msg {
                background-color: #ffebee;
                color: #c62828;
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 20px;
                font-size: 0.85rem;
                text-align: left;
                border: 1px solid #ffcdd2;
            }

            .input-group {
                margin-bottom: 20px;
                text-align: left;
            }

            label {
                display: block;
                margin-bottom: 8px;
                font-size: 0.85rem;
                font-weight: 600;
                color: #2d241e;
            }

            input[type="password"] {
                width: 100%;
                padding: 12px 16px;
                border: 1px solid #eae5dc;
                border-radius: 8px;
                font-size: 1rem;
                background-color: #FAF9F6;
                outline: none;
                transition: all 0.2s ease;
            }

            input[type="password"]:focus {
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(0, 69, 13, 0.15);
                background-color: white;
            }

            .btn-submit {
                width: 100%;
                background-color: var(--primary);
                color: white;
                padding: 14px;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 4px 12px rgba(0, 69, 13, 0.2);
                margin-top: 10px;
            }

            .btn-submit:hover {
                background-color: #003309;
                transform: translateY(-1px);
            }
        </style>
    </head>

    <body>
        <div class="login-card">
            <img src="https://vintageglobaltrading.com/images/headlogo_trimmed.png" class="logo-img" alt="Exportia Spices">
            <h2>Dashboard Access</h2>
            <p>Enter your management security password</p>

            <?php if (!empty($loginError)): ?>
                <div class="error-msg"><?php echo htmlspecialchars($loginError); ?></div>
            <?php endif; ?>

            <form method="POST" action="admin.php">
                <input type="hidden" name="action" value="login">
                <div class="input-group">
                    <label for="password">Security Password</label>
                    <input type="password" id="password" name="password" required placeholder="••••••••" autofocus>
                </div>
                <button type="submit" class="btn-submit">Unlock Dashboard</button>
            </form>
        </div>
    </body>

    </html>
    <?php
    exit();
}

// Below is the main dashboard layout for logged-in admin users
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exportia Spices - Admin Center</title>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700&display=swap"
        rel="stylesheet">
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
            --sidebar-width: 260px;
            --shadow: 0 4px 20px rgba(132, 94, 60, 0.05);
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
            display: flex;
        }

        h1,
        h2,
        h3,
        h4,
        .font-headline {
            font-family: 'Montserrat', sans-serif;
            font-weight: 700;
        }

        /* Sidebar Nav Styles */
        .sidebar {
            width: var(--sidebar-width);
            background-color: white;
            border-right: 1px solid var(--card-border);
            height: 100vh;
            position: fixed;
            left: 0;
            top: 0;
            display: flex;
            flex-direction: column;
            z-index: 100;
        }

        .sidebar-brand {
            padding: 30px 24px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid var(--card-border);
        }

        .sidebar-brand img {
            max-height: 40px;
        }

        .sidebar-brand h3 {
            font-size: 1.1rem;
            color: var(--primary);
            letter-spacing: -0.5px;
        }

        .sidebar-nav {
            list-style: none;
            padding: 24px 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex-grow: 1;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            color: var(--text-muted);
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .nav-item:hover,
        .nav-item.active {
            background-color: var(--primary-light);
            color: var(--primary);
        }

        .nav-item.active {
            font-weight: 600;
        }

        .sidebar-footer {
            padding: 24px;
            border-top: 1px solid var(--card-border);
        }

        .btn-logout {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--danger);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 600;
        }

        /* Main Content Container */
        .main-content {
            margin-left: var(--sidebar-width);
            flex-grow: 1;
            padding: 40px;
            min-height: 100vh;
            background-color: var(--bg);
        }

        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }

        .header-section h1 {
            font-size: 1.8rem;
            color: var(--primary);
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(5px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Stats Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 24px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 24px;
            box-shadow: var(--shadow);
        }

        .stat-title {
            font-size: 0.85rem;
            color: var(--text-muted);
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .stat-val {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--primary);
        }

        /* Table Card & General Card Style */
        .card {
            background: white;
            border: 1px solid var(--card-border);
            border-radius: 12px;
            box-shadow: var(--shadow);
            margin-bottom: 30px;
            overflow: hidden;
        }

        .card-header {
            padding: 20px 24px;
            border-bottom: 1px solid var(--card-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .card-header h3 {
            font-size: 1.1rem;
            color: var(--primary);
        }

        .table-responsive {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        th {
            background-color: var(--primary-light);
            color: var(--primary);
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
            padding: 16px 24px;
            border-bottom: 1px solid var(--card-border);
        }

        td {
            padding: 16px 24px;
            border-bottom: 1px solid var(--card-border);
            font-size: 0.9rem;
            color: var(--text-main);
            vertical-align: middle;
        }

        tr:last-child td {
            border-bottom: none;
        }

        /* Badges */
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .badge-success {
            background-color: #e8f5e9;
            color: var(--success);
        }

        .badge-pending {
            background-color: #fff8e1;
            color: var(--warning);
        }

        .badge-danger {
            background-color: #ffebee;
            color: var(--danger);
        }

        .badge-info {
            background-color: #e3f2fd;
            color: #1565c0;
        }

        /* Buttons & Forms */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
            border: none;
        }

        .btn-primary {
            background-color: var(--primary);
            color: white;
        }

        .btn-primary:hover {
            background-color: #003309;
        }

        .btn-accent {
            background-color: var(--accent);
            color: white;
        }

        .btn-accent:hover {
            background-color: var(--accent-hover);
        }

        .btn-outline {
            border: 1px solid var(--card-border);
            background-color: white;
            color: var(--text-main);
        }

        .btn-outline:hover {
            background-color: #FAF9F6;
        }

        .btn-danger {
            background-color: var(--danger);
            color: white;
        }

        .btn-danger:hover {
            background-color: #b71c1c;
        }

        .btn-sm {
            padding: 6px 12px;
            font-size: 0.8rem;
            border-radius: 6px;
        }

        /* Modals */
        .modal {
            display: none;
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 200;
            align-items: center;
            justify-content: center;
        }

        .modal.active {
            display: flex;
        }

        .modal-content {
            background: white;
            border-radius: 16px;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            border: 1px solid var(--card-border);
        }

        .modal-header {
            padding: 24px;
            border-bottom: 1px solid var(--card-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-body {
            padding: 24px;
        }

        .modal-footer {
            padding: 20px 24px;
            border-top: 1px solid var(--card-border);
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-main);
        }

        .form-control {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid var(--card-border);
            border-radius: 8px;
            font-size: 0.95rem;
            background-color: #FAF9F6;
            outline: none;
        }

        .form-control:focus {
            border-color: var(--primary);
            background-color: white;
        }

        textarea.form-control {
            resize: vertical;
            min-height: 100px;
        }

        /* Settings Grid Layout */
        .settings-section-title {
            font-size: 1.1rem;
            color: var(--primary);
            margin: 24px 0 16px 0;
            border-bottom: 1px solid var(--card-border);
            padding-bottom: 8px;
        }

        /* Media Grid */
        .media-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 16px;
            padding: 24px;
        }

        .media-item {
            border: 1px solid var(--card-border);
            border-radius: 8px;
            overflow: hidden;
            background-color: #FAF9F6;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .media-preview {
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: white;
            padding: 8px;
        }

        .media-preview img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .media-details {
            padding: 8px;
            font-size: 0.75rem;
            color: var(--text-muted);
            border-top: 1px solid var(--card-border);
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }

        .media-actions {
            display: flex;
            border-top: 1px solid var(--card-border);
        }

        .media-btn {
            flex-grow: 1;
            padding: 6px;
            font-size: 0.7rem;
            border: none;
            background: white;
            cursor: pointer;
            text-align: center;
            font-weight: 600;
        }

        .media-btn:first-child {
            border-right: 1px solid var(--card-border);
            color: var(--primary);
        }

        .media-btn:last-child {
            color: var(--danger);
        }

        /* Toast Notifications */
        .toast {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #2d241e;
            color: white;
            padding: 14px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 300;
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }

        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }
    </style>
</head>

<body>

    <!-- Sidebar -->
    <div class="sidebar">
        <div class="sidebar-brand">
            <img src="https://vintageglobaltrading.com/images/headlogo_trimmed.png" alt="Exportia">
        </div>
        <ul class="sidebar-nav">
            <li><a class="nav-item active" data-tab="dashboard">Dashboard</a></li>
            <li><a class="nav-item" data-tab="catalog">Catalog</a></li>
            <li><a class="nav-item" data-tab="orders">Orders</a></li>
            <li><a class="nav-item" data-tab="settings">Settings</a></li>
            <li><a class="nav-item" data-tab="media">Media &amp; Files</a></li>
        </ul>
        <div class="sidebar-footer">
            <a href="admin.php?action=logout" class="btn-logout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign Out
            </a>
        </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">

        <!-- DASHBOARD TAB -->
        <div id="dashboard" class="tab-content active">
            <div class="header-section">
                <h1>Dashboard Summary</h1>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title">Revenue (Paid Orders)</div>
                    <div class="stat-val" id="stat-sales">₹0.00</div>
                    <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;" id="stat-paid-count"></div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Total Orders</div>
                    <div class="stat-val" id="stat-order-count">0</div>
                    <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;" id="stat-order-breakdown"></div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Avg. Paid Order Value</div>
                    <div class="stat-val" id="stat-aov">₹0.00</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Low Stock / Out of Stock</div>
                    <div class="stat-val" id="stat-low-stock">0</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Recent Transactions</h3>
                    <a class="btn btn-outline btn-sm" onclick="switchTab('orders')">View All</a>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Product</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody id="recent-orders-tbody">
                            <tr>
                                <td colspan="7" style="text-align:center;">Retrieving live database...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- CATALOG TAB -->
        <div id="catalog" class="tab-content">
            <div class="header-section">
                <h1>Product Catalog</h1>
                <button class="btn btn-primary" onclick="openProductModal('add')">Add New Spice</button>
            </div>

            <div class="card">
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Spice</th>
                                <th>Slug</th>
                                <th>Price (INR)</th>
                                <th>Stock Qty</th>
                                <th>Active Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="catalog-tbody">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ORDERS TAB -->
        <div id="orders" class="tab-content">
            <div class="header-section">
                <h1>Orders &amp; Shipments</h1>
                <a href="api_orders.php?action=csv" class="btn btn-outline">Export to CSV</a>
            </div>

            <div class="card">
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer Name</th>
                                <th>Spice &amp; Size</th>
                                <th>Amount</th>
                                <th>Payment Status</th>
                                <th>Order Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="orders-tbody">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- SETTINGS TAB -->
        <div id="settings" class="tab-content">
            <div class="header-section">
                <h1>Site Configuration</h1>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Configure Payment Gateways &amp; Settings</h3>
                </div>
                <div class="modal-body">
                    <form id="settings-form">
                        <div class="settings-section-title">Razorpay Settings (Test/Live)</div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label for="setting-razorpay_key_id">Razorpay Key ID</label>
                                <input type="text" id="setting-razorpay_key_id" class="form-control"
                                    name="razorpay_key_id">
                            </div>
                            <div class="form-group">
                                <label for="setting-razorpay_key_secret">Razorpay Key Secret</label>
                                <input type="text" id="setting-razorpay_key_secret" class="form-control"
                                    name="razorpay_key_secret">
                            </div>
                        </div>

                        <div class="settings-section-title">PayU settings (Test/Live)</div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label for="setting-payu_key">PayU Key</label>
                                <input type="text" id="setting-payu_key" class="form-control" name="payu_key">
                            </div>
                            <div class="form-group">
                                <label for="setting-payu_salt">PayU Salt</label>
                                <input type="text" id="setting-payu_salt" class="form-control" name="payu_salt">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label for="setting-payu_merchant_id">PayU Merchant ID</label>
                                <input type="text" id="setting-payu_merchant_id" class="form-control"
                                    name="payu_merchant_id">
                            </div>
                            <div class="form-group">
                                <label for="setting-payu_base_url">PayU Base URL</label>
                                <input type="text" id="setting-payu_base_url" class="form-control" name="payu_base_url">
                                <span style="font-size:0.75rem; color: var(--text-muted);">Use
                                    <code>https://test.payu.in</code> for sandbox, <code>https://api.payu.in</code> for
                                    live.</span>
                            </div>
                        </div>

                        <div class="settings-section-title">Paytm Settings (Test/Live)</div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label for="setting-paytm_mid">Paytm Merchant ID</label>
                                <input type="text" id="setting-paytm_mid" class="form-control" name="paytm_mid">
                            </div>
                            <div class="form-group">
                                <label for="setting-paytm_merchant_key">Paytm Merchant Key</label>
                                <input type="text" id="setting-paytm_merchant_key" class="form-control"
                                    name="paytm_merchant_key">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label for="setting-paytm_website">Paytm Website</label>
                                <input type="text" id="setting-paytm_website" class="form-control" name="paytm_website">
                            </div>
                            <div class="form-group">
                                <label for="setting-paytm_industry_type">Paytm Industry Type</label>
                                <input type="text" id="setting-paytm_industry_type" class="form-control"
                                    name="paytm_industry_type">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label for="setting-paytm_channel_id">Paytm Channel ID</label>
                                <input type="text" id="setting-paytm_channel_id" class="form-control"
                                    name="paytm_channel_id">
                            </div>
                            <div class="form-group">
                                <label for="setting-paytm_base_url">Paytm Base URL</label>
                                <input type="text" id="setting-paytm_base_url" class="form-control"
                                    name="paytm_base_url">
                                <span style="font-size:0.75rem; color: var(--text-muted);">Use
                                    <code>https://securestage.paytmpayments.com</code> for sandbox,
                                    <code>https://securegw.paytm.in</code> for live.</span>
                            </div>
                        </div>

                        <div class="settings-section-title">General settings</div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label for="setting-site_url">Site Domain URL</label>
                                <input type="text" id="setting-site_url" class="form-control" name="site_url">
                            </div>
                            <div class="form-group">
                                <label for="setting-new_order_email">Notifications Alert Email</label>
                                <input type="email" id="setting-new_order_email" class="form-control"
                                    name="new_order_email">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="setting-admin_password">Admin Security Password</label>
                            <input type="text" id="setting-admin_password" class="form-control" name="admin_password">
                        </div>

                        <div style="text-align: right; margin-top: 20px;">
                            <button type="submit" class="btn btn-primary">Save All Configuration</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- MEDIA TAB -->
        <div id="media" class="tab-content">
            <div class="header-section">
                <h1>Media &amp; Product Images</h1>
                <form id="media-upload-form" style="display:flex; gap:10px;">
                    <input type="file" id="media-file-input" class="form-control"
                        style="background:white; max-width:250px;" required accept="image/*">
                    <button type="submit" class="btn btn-primary">Upload File</button>
                </form>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Uploaded Media Catalog</h3>
                </div>
                <div class="media-grid" id="media-container">
                    <!-- Populated dynamically -->
                </div>
            </div>
        </div>

    </div>

    <!-- Product Modal -->
    <div id="product-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="product-modal-title">Add Spice Product</h3>
                <span style="font-size:1.5rem; cursor:pointer;" onclick="closeProductModal()">&times;</span>
            </div>
            <form id="product-form">
                <input type="hidden" name="action" id="product-action-input" value="add">
                <input type="hidden" name="id" id="product-id-input">
                <div class="modal-body">
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label for="prod-name">Product Name *</label>
                            <input type="text" id="prod-name" class="form-control" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="prod-slug">Slug (URL Name) *</label>
                            <input type="text" id="prod-slug" class="form-control" name="slug"
                                placeholder="premium-turmeric">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="prod-desc">Description *</label>
                        <textarea id="prod-desc" class="form-control" name="description" required></textarea>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label for="prod-price">Price in INR (per kg) *</label>
                            <input type="number" step="0.01" id="prod-price" class="form-control" name="price_in_inr"
                                required>
                        </div>
                        <div class="form-group">
                            <label for="prod-stock">Initial Stock Quantity *</label>
                            <input type="number" id="prod-stock" class="form-control" name="stock_qty" value="50"
                                required>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label for="prod-badge">Product Badge (e.g. 95% CURCUMIN)</label>
                            <input type="text" id="prod-badge" class="form-control" name="badge">
                        </div>
                        <div class="form-group">
                            <label for="prod-specs">Product Specs (e.g. Alleppey Finger, Organic)</label>
                            <input type="text" id="prod-specs" class="form-control" name="specs">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="prod-image-url">Image Web Path (or select file below)</label>
                        <input type="text" id="prod-image-url" class="form-control" name="image_url"
                            placeholder="/images/turmeric.png">
                    </div>
                    <div class="form-group">
                        <label for="prod-file">Upload Image File (replaces web path if provided)</label>
                        <input type="file" id="prod-file" class="form-control" name="image" accept="image/*"
                            style="background: white;">
                    </div>
                    <div class="form-group">
                        <label for="prod-isactive">Active Status</label>
                        <select id="prod-isactive" class="form-control" name="is_active">
                            <option value="1">Active (Visible in Storefront)</option>
                            <option value="0">Inactive (Hidden)</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="closeProductModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Product</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Order Details Modal -->
    <div id="order-modal" class="modal">
        <div class="modal-content" style="max-width:650px;">
            <div class="modal-header">
                <h3>Order Shipment Details</h3>
                <span style="font-size:1.5rem; cursor:pointer;" onclick="closeOrderModal()">&times;</span>
            </div>
            <div class="modal-body" id="order-modal-body">
                <!-- Loaded dynamically -->
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="closeOrderModal()">Close</button>
            </div>
        </div>
    </div>

    <!-- Toast Alert Element -->
    <div id="toast" class="toast">
        <span id="toast-message">Action processed successfully</span>
    </div>

    <!-- Javascript Controller -->
    <script>
        // Store state locally
        let products = [];
        let orders = [];
        let settings = {};

        // Sidebar Navigation Controller
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
                this.classList.add('active');

                const targetTab = this.getAttribute('data-tab');
                switchTab(targetTab);
            });
        });

        function switchTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');

            // Highlight nav item if switched programmatically
            document.querySelectorAll('.nav-item').forEach(el => {
                if (el.getAttribute('data-tab') === tabId) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });

            // Reload data for target tab
            if (tabId === 'dashboard') loadDashboardData();
            if (tabId === 'catalog') loadCatalogData();
            if (tabId === 'orders') loadOrdersData();
            if (tabId === 'settings') loadSettingsData();
            if (tabId === 'media') loadMediaData();
        }

        // Show Toast Notice Helper
        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            const toastMsg = document.getElementById('toast-message');
            toastMsg.innerText = message;

            if (type === 'error') {
                toast.style.backgroundColor = '#c62828';
            } else {
                toast.style.backgroundColor = '#2e7d32';
            }

            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // --- DASHBOARD CONTROLLER ---
        function loadDashboardData() {
            fetch('api_orders.php')
                .then(res => res.json())
                .then(data => {
                    orders = data;
                    calculateDashboardStats();
                    renderRecentOrders();
                })
                .catch(err => {
                    console.error("Dashboard failed to load orders", err);
                    showToast("Failed to reload sales metrics.", "error");
                });
        }

        function calculateDashboardStats() {
            let totalSales = 0;
            let paidOrders = 0;
            let pendingOrders = 0;
            let failedOrders = 0;

            orders.forEach(order => {
                if (order.payment_status === 'completed' || order.payment_status === 'success') {
                    totalSales += parseFloat(order.total);
                    paidOrders++;
                } else if (order.payment_status === 'pending') {
                    pendingOrders++;
                } else {
                    failedOrders++;
                }
            });

            const totalOrders = orders.length;
            const aov = paidOrders > 0 ? (totalSales / paidOrders) : 0;

            document.getElementById('stat-sales').innerText = '₹' + totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            document.getElementById('stat-paid-count').innerText = paidOrders + ' paid out of ' + totalOrders + ' total';
            document.getElementById('stat-order-count').innerText = totalOrders;
            document.getElementById('stat-order-breakdown').innerText = paidOrders + ' paid · ' + pendingOrders + ' pending · ' + failedOrders + ' failed';
            document.getElementById('stat-aov').innerText = '₹' + aov.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            // Count low stock items from products
            fetch('api_products.php')
                .then(res => res.json())
                .then(data => {
                    products = data;
                    const lowStockCount = products.filter(p => parseInt(p.stock_qty) <= 10).length;
                    document.getElementById('stat-low-stock').innerText = lowStockCount;
                });
        }

        function renderRecentOrders() {
            const tbody = document.getElementById('recent-orders-tbody');
            tbody.innerHTML = '';

            const recent = orders.slice(0, 5);
            if (recent.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No transactions found in system.</td></tr>';
                return;
            }

            recent.forEach(order => {
                const date = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                const payStatusBadge = order.payment_status === 'completed' ? 'success' : (order.payment_status === 'pending' ? 'pending' : 'danger');
                const orderStatusBadge = order.order_status === 'delivered' ? 'success' : (order.order_status === 'cancelled' ? 'danger' : 'info');

                tbody.innerHTML += `
                    <tr>
                        <td style="font-weight:600;">${order.order_id}</td>
                        <td>${order.customer_name}</td>
                        <td>${order.product_slug} (${order.pack_size})</td>
                        <td style="font-weight:600;">₹${parseFloat(order.total).toFixed(2)}</td>
                        <td><span class="badge badge-${payStatusBadge}">${order.payment_status}</span></td>
                        <td><span class="badge badge-${orderStatusBadge}">${order.order_status}</span></td>
                        <td>${date}</td>
                    </tr>
                `;
            });
        }

        // --- PRODUCT CATALOG CONTROLLER ---
        function loadCatalogData() {
            fetch('api_products.php')
                .then(res => res.json())
                .then(data => {
                    products = data;
                    renderCatalog();
                })
                .catch(err => showToast("Error loading catalog.", "error"));
        }

        function renderCatalog() {
            const tbody = document.getElementById('catalog-tbody');
            tbody.innerHTML = '';

            if (products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No products in catalog. Click Add Spice to create one!</td></tr>';
                return;
            }

            products.forEach(p => {
                const activeBadge = parseInt(p.is_active) === 1 ? 'success' : 'danger';
                const activeLabel = parseInt(p.is_active) === 1 ? 'Active' : 'Inactive';
                const imageSrc = p.image.startsWith('http') ? p.image : p.image;

                tbody.innerHTML += `
                    <tr id="prod-row-${p.id}">
                        <td>
                            <div style="display:flex; align-items:center; gap:12px;">
                                <img src="${imageSrc}" style="width:40px; height:40px; border-radius:6px; border:1px solid var(--card-border); object-fit:cover;">
                                <div>
                                    <div style="font-weight:600;">${p.name}</div>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">${p.badge || 'No Badge'}</span>
                                </div>
                            </div>
                        </td>
                        <td><code>${p.slug}</code></td>
                        <td>₹${parseFloat(p.price_in_inr).toFixed(2)}</td>
                        <td>
                            <input type="number" value="${p.stock_qty}" 
                                   style="width:70px; padding:6px; border:1px solid var(--card-border); border-radius:4px;" 
                                   onchange="updateProductStock(${p.id}, this.value)">
                        </td>
                        <td>
                            <span class="badge badge-${activeBadge}" style="cursor:pointer;" onclick="toggleProductActive(${p.id}, ${p.is_active})">
                                ${activeLabel}
                            </span>
                        </td>
                        <td>
                            <div style="display:flex; gap:8px;">
                                <button class="btn btn-outline btn-sm" onclick="openProductModal('edit', ${p.id})">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }

        // Inline edit stock
        function updateProductStock(id, newStock) {
            const prod = products.find(p => p.id == id);
            if (!prod) return;

            fetch('api_products.php?action=update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: id,
                    stock_qty: parseInt(newStock)
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        showToast(`Stock updated for ${prod.name}`);
                    } else {
                        showToast(data.error || "Failed to update stock", "error");
                    }
                })
                .catch(err => showToast("Error updating stock", "error"));
        }

        // Toggle active status
        function toggleProductActive(id, currentStatus) {
            const prod = products.find(p => p.id == id);
            if (!prod) return;

            const nextStatus = currentStatus === 1 ? 0 : 1;
            fetch('api_products.php?action=update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: id,
                    is_active: nextStatus
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        showToast(`Toggled storefront status for ${prod.name}`);
                        loadCatalogData();
                    } else {
                        showToast(data.error || "Failed to update status", "error");
                    }
                })
                .catch(err => showToast("Error updating status", "error"));
        }

        // Delete Product
        function deleteProduct(id) {
            const prod = products.find(p => p.id == id);
            if (!prod) return;

            if (confirm(`Are you sure you want to completely delete "${prod.name}"? This action cannot be undone.`)) {
                fetch('api_products.php?action=delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id })
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            showToast(`Successfully deleted ${prod.name}`);
                            loadCatalogData();
                        } else {
                            showToast(data.error || "Failed to delete product", "error");
                        }
                    })
                    .catch(err => showToast("Error deleting product", "error"));
            }
        }

        // Modal Controls
        function openProductModal(action, id = null) {
            const modal = document.getElementById('product-modal');
            const title = document.getElementById('product-modal-title');
            const form = document.getElementById('product-form');
            form.reset();

            document.getElementById('product-action-input').value = action === 'add' ? 'add' : 'update';
            document.getElementById('product-id-input').value = id || '';

            if (action === 'add') {
                title.innerText = 'Add Spice Product';
                document.getElementById('prod-stock').value = 50;
                document.getElementById('prod-isactive').value = "1";
            } else {
                title.innerText = 'Edit Spice Product';
                const p = products.find(prod => prod.id == id);
                if (p) {
                    document.getElementById('prod-name').value = p.name;
                    document.getElementById('prod-slug').value = p.slug;
                    document.getElementById('prod-desc').value = p.description;
                    document.getElementById('prod-price').value = p.price_in_inr;
                    document.getElementById('prod-stock').value = p.stock_qty;
                    document.getElementById('prod-badge').value = p.badge || '';
                    document.getElementById('prod-specs').value = p.specs || '';
                    document.getElementById('prod-image-url').value = p.image;
                    document.getElementById('prod-isactive').value = p.is_active;
                }
            }
            modal.classList.add('active');
        }

        function closeProductModal() {
            document.getElementById('product-modal').classList.remove('active');
        }

        // Submit product form (Handles multipart for file upload)
        document.getElementById('product-form').addEventListener('submit', function (e) {
            e.preventDefault();

            const form = this;
            const formData = new FormData(form);
            const action = document.getElementById('product-action-input').value;

            fetch(`api_products.php?action=${action}`, {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        showToast(data.message || "Product saved successfully!");
                        closeProductModal();
                        loadCatalogData();
                    } else {
                        showToast(data.error || "Failed to save product.", "error");
                    }
                })
                .catch(err => {
                    console.error(err);
                    showToast("Server connection error during upload.", "error");
                });
        });

        // --- ORDERS CONTROLLER ---
        function loadOrdersData() {
            fetch('api_orders.php')
                .then(res => res.json())
                .then(data => {
                    orders = data;
                    renderOrders();
                })
                .catch(err => showToast("Error loading orders.", "error"));
        }

        function renderOrders() {
            const tbody = document.getElementById('orders-tbody');
            tbody.innerHTML = '';

            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No orders found in database.</td></tr>';
                return;
            }

            orders.forEach(o => {
                const date = new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                const payStatusBadge = o.payment_status === 'completed' ? 'success' : (o.payment_status === 'pending' ? 'pending' : 'danger');

                tbody.innerHTML += `
                    <tr>
                        <td style="font-weight:600;">${o.order_id}</td>
                        <td>
                            <div><strong>${o.customer_name}</strong></div>
                            <span style="font-size:0.75rem; color:var(--text-muted);">${o.phone}</span>
                        </td>
                        <td>
                            <div>${o.product_slug}</div>
                            <span style="font-size:0.75rem; color:var(--text-muted);">${o.pack_size} x ${o.quantity}</span>
                        </td>
                        <td style="font-weight:600;">₹${parseFloat(o.total).toFixed(2)}</td>
                        <td>
                            <select class="form-control" style="width:110px; padding:4px 8px; font-size:0.8rem; border-radius:4px;" 
                                    onchange="updateOrderPaymentStatus(${o.id}, this.value)">
                                <option value="pending" ${o.payment_status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="completed" ${o.payment_status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="failed" ${o.payment_status === 'failed' ? 'selected' : ''}>Failed</option>
                            </select>
                        </td>
                        <td>
                            <select class="form-control" style="width:110px; padding:4px 8px; font-size:0.8rem; border-radius:4px;" 
                                    onchange="updateOrderStatus(${o.id}, this.value)">
                                <option value="new" ${o.order_status === 'new' ? 'selected' : ''}>New</option>
                                <option value="pending_payment" ${o.order_status === 'pending_payment' ? 'selected' : ''}>Pending Pay</option>
                                <option value="processing" ${o.order_status === 'processing' ? 'selected' : ''}>Processing</option>
                                <option value="shipped" ${o.order_status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="delivered" ${o.order_status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="cancelled" ${o.order_status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </td>
                        <td>${date}</td>
                        <td>
                            <button class="btn btn-outline btn-sm" onclick="viewOrderDetails(${o.id})">Details</button>
                        </td>
                    </tr>
                `;
            });
        }

        function updateOrderPaymentStatus(id, newStatus) {
            fetch('api_orders.php?action=update_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, payment_status: newStatus })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) showToast("Payment status updated.");
                    else showToast(data.error || "Failed updating status", "error");
                });
        }

        function updateOrderStatus(id, newStatus) {
            fetch('api_orders.php?action=update_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, order_status: newStatus })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) showToast("Order status updated.");
                    else showToast(data.error || "Failed updating status", "error");
                });
        }

        function viewOrderDetails(id) {
            const o = orders.find(order => order.id == id);
            if (!o) return;

            const date = new Date(o.created_at).toLocaleString('en-IN');
            const modalBody = document.getElementById('order-modal-body');

            modalBody.innerHTML = `
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 0.9rem;">
                    <div>
                        <h4 style="margin-bottom:8px; color:var(--primary);">Customer Profile</h4>
                        <strong>Name:</strong> ${o.customer_name}<br>
                        <strong>Email:</strong> ${o.email}<br>
                        <strong>Phone:</strong> ${o.phone}
                    </div>
                    <div>
                        <h4 style="margin-bottom:8px; color:var(--primary);">Shipment Location</h4>
                        <strong>Address:</strong> ${o.shipping_address}<br>
                        <strong>City:</strong> ${o.city}<br>
                        <strong>State / PIN:</strong> ${o.state} - ${o.pin_code}
                    </div>
                </div>
                <hr style="margin:20px 0; border:0; border-top:1px solid var(--card-border);">
                <div style="font-size:0.9rem;">
                    <h4 style="margin-bottom:12px; color:var(--primary);">Purchased Items</h4>
                    <table style="width:100%; font-size:0.85rem;">
                        <thead>
                            <tr style="background:#f9f9f9;">
                                <th style="padding:8px;">Product</th>
                                <th style="padding:8px;">Pack Size</th>
                                <th style="padding:8px;">Quantity</th>
                                <th style="padding:8px; text-align:right;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding:10px;">${o.product_slug}</td>
                                <td style="padding:10px;">${o.pack_size}</td>
                                <td style="padding:10px;">${o.quantity}</td>
                                <td style="padding:10px; text-align:right;">₹${parseFloat(o.subtotal).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="3" style="text-align:right; padding:6px; font-weight:600;">Shipping Cost:</td>
                                <td style="text-align:right; padding:6px;">₹${parseFloat(o.shipping_cost).toFixed(2)}</td>
                            </tr>
                            ${parseFloat(o.cod_fee) > 0 ? `
                            <tr>
                                <td colspan="3" style="text-align:right; padding:6px; font-weight:600;">COD Fee:</td>
                                <td style="text-align:right; padding:6px;">₹${parseFloat(o.cod_fee).toFixed(2)}</td>
                            </tr>` : ''}
                            <tr style="font-weight:700; border-top: 1px solid var(--card-border);">
                                <td colspan="3" style="text-align:right; padding:8px;">Grand Total:</td>
                                <td style="text-align:right; padding:8px; color:var(--primary);">₹${parseFloat(o.total).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <hr style="margin:20px 0; border:0; border-top:1px solid var(--card-border);">
                <div style="font-size: 0.9rem;">
                    <h4 style="margin-bottom:8px; color:var(--primary);">Transaction Metadata</h4>
                    <strong>Payment Method:</strong> ${o.payment_method.toUpperCase()}<br>
                    ${o.razorpay_payment_id ? `<strong>Razorpay Payment ID:</strong> <code>${o.razorpay_payment_id}</code><br>` : ''}
                    ${o.payu_mihpayid ? `<strong>PayU Transaction ID (mihpayid):</strong> <code>${o.payu_mihpayid}</code><br>` : ''}
                    ${o.payu_txnid ? `<strong>PayU Local Txn ID:</strong> <code>${o.payu_txnid}</code><br>` : ''}
                    ${o.paytm_txnid ? `<strong>Paytm Transaction ID:</strong> <code>${o.paytm_txnid}</code><br>` : ''}
                    ${o.paytm_status ? `<strong>Paytm Status:</strong> <code>${o.paytm_status}</code><br>` : ''}
                    ${o.paytm_mode ? `<strong>Paytm Mode:</strong> <code>${o.paytm_mode}</code><br>` : ''}
                    <strong>Notes/Instructions:</strong> ${o.notes || 'None provided'}
                </div>
            `;

            document.getElementById('order-modal').classList.add('active');
        }

        function closeOrderModal() {
            document.getElementById('order-modal').classList.remove('active');
        }

        // --- SETTINGS CONTROLLER ---
        function loadSettingsData() {
            fetch('api_settings.php')
                .then(res => res.json())
                .then(data => {
                    settings = data;
                    // Populate settings fields
                    for (const key in settings) {
                        const el = document.getElementById(`setting-${key}`);
                        if (el) el.value = settings[key];
                    }
                })
                .catch(err => showToast("Error loading config settings", "error"));
        }

        document.getElementById('settings-form').addEventListener('submit', function (e) {
            e.preventDefault();
            const inputs = this.querySelectorAll('input');
            const data = {};

            inputs.forEach(input => {
                if (input.name) {
                    data[input.name] = input.value;
                }
            });

            fetch('api_settings.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(resData => {
                    if (resData.success) {
                        showToast("System configurations saved successfully!");
                        loadSettingsData();
                    } else {
                        showToast("Failed to save configuration settings", "error");
                    }
                })
                .catch(err => showToast("Error saving configurations", "error"));
        });

        // --- MEDIA CONTROLLER ---
        function loadMediaData() {
            fetch('file_list.php')
                .then(res => res.json())
                .then(data => {
                    renderMedia(data);
                })
                .catch(err => showToast("Error loading uploads list", "error"));
        }

        function renderMedia(files) {
            const container = document.getElementById('media-container');
            container.innerHTML = '';

            if (!files || files.length === 0) {
                container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">No images found in upload catalog.</div>';
                return;
            }

            files.forEach(file => {
                // Check if it's image or other
                const isImg = file.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                const webPath = '/uploads/' + file;

                container.innerHTML += `
                    <div class="media-item">
                        <div class="media-preview">
                            ${isImg ? `<img src="${webPath}" alt="${file}">` : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`}
                        </div>
                        <div class="media-details" title="${file}">${file}</div>
                        <div class="media-actions">
                            <button class="media-btn" onclick="copyPath('${webPath}')">Copy</button>
                            <button class="media-btn" onclick="deleteFile('${file}')">Delete</button>
                        </div>
                    </div>
                `;
            });
        }

        function copyPath(path) {
            navigator.clipboard.writeText(path)
                .then(() => showToast("Web path copied to clipboard!"))
                .catch(() => showToast("Failed to copy path", "error"));
        }

        function deleteFile(file) {
            if (confirm(`Are you sure you want to delete file "${file}"?`)) {
                fetch('file_list.php?action=delete&file=' + encodeURIComponent(file), { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            showToast("File deleted.");
                            loadMediaData();
                        } else {
                            showToast(data.error || "Failed to delete file", "error");
                        }
                    })
                    .catch(err => showToast("Error deleting file", "error"));
            }
        }

        // Handle Media Direct Upload
        document.getElementById('media-upload-form').addEventListener('submit', function (e) {
            e.preventDefault();

            const fileInput = document.getElementById('media-file-input');
            if (!fileInput.files || fileInput.files.length === 0) return;

            const formData = new FormData();
            formData.append('image', fileInput.files[0]);
            formData.append('action', 'add');
            formData.append('name', fileInput.files[0].name);

            // Upload through product API to reuse image upload logic
            fetch('api_products.php?action=add', {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        showToast("File uploaded successfully.");
                        fileInput.value = '';
                        loadMediaData();
                    } else {
                        showToast(data.error || "Failed to upload file.", "error");
                    }
                })
                .catch(err => showToast("Error uploading file", "error"));
        });

        // Initialize view
        loadDashboardData();
    </script>
</body>

</html>