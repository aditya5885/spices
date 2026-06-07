<?php
session_start();
require_once 'config.php';

// Auth check
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$conn = getDB();
$conn->select_db(DB_NAME);

$method = $_SERVER['REQUEST_METHOD'];

// Parse incoming JSON request data for POST/PUT
$input = [];
if ($method === 'POST') {
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    if (stripos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
    } else {
        $input = $_POST;
    }
}

if ($method === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : 'list';
    
    if ($action === 'csv') {
        // Export to CSV
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=orders_export_' . date('Ymd_His') . '.csv');
        $output = fopen('php://output', 'w');
        
        // Output headers
        fputcsv($output, [
            'ID', 'Order ID', 'Customer Name', 'Email', 'Phone', 
            'Address', 'City', 'State', 'Pin Code', 'Notes', 
            'Product Slug', 'Pack Size', 'Quantity', 'Subtotal', 
            'Shipping Cost', 'COD Fee', 'Total', 'Payment Method', 
            'Payment Status', 'Order Status', 'Created At'
        ]);
        
        $res = $conn->query("SELECT * FROM orders ORDER BY id DESC");
        while ($row = $res->fetch_assoc()) {
            fputcsv($output, [
                $row['id'], $row['order_id'], $row['customer_name'], $row['email'], $row['phone'],
                $row['shipping_address'], $row['city'], $row['state'], $row['pin_code'], $row['notes'],
                $row['product_slug'], $row['pack_size'], $row['quantity'], $row['subtotal'],
                $row['shipping_cost'], $row['cod_fee'], $row['total'], $row['payment_method'],
                $row['payment_status'], $row['order_status'], $row['created_at']
            ]);
        }
        fclose($output);
        exit();
    } else {
        // Get all orders
        $res = $conn->query("SELECT * FROM orders ORDER BY id DESC");
        $orders = [];
        while ($row = $res->fetch_assoc()) {
            $orders[] = $row;
        }
        echo json_encode($orders);
    }
} elseif ($method === 'POST') {
    $action = isset($_GET['action']) ? $_GET['action'] : (isset($input['action']) ? $input['action'] : '');
    
    if ($action === 'update_status') {
        $id = isset($input['id']) ? intval($input['id']) : 0;
        $order_status = isset($input['order_status']) ? trim($input['order_status']) : '';
        $payment_status = isset($input['payment_status']) ? trim($input['payment_status']) : '';
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Order ID is required"]);
            exit();
        }
        
        // Prepare dynamic update
        $updates = [];
        $params = [];
        $types = "";
        
        if (!empty($order_status)) {
            $updates[] = "order_status = ?";
            $params[] = $order_status;
            $types .= "s";
        }
        if (!empty($payment_status)) {
            $updates[] = "payment_status = ?";
            $params[] = $payment_status;
            $types .= "s";
        }
        
        if (count($updates) === 0) {
            http_response_code(400);
            echo json_encode(["error" => "No fields specified for update"]);
            exit();
        }
        
        $sql = "UPDATE orders SET " . implode(", ", $updates) . " WHERE id = ?";
        $params[] = $id;
        $types .= "i";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Order status updated successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update order status: " . $stmt->error]);
        }
        $stmt->close();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid action"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

$conn->close();
?>
