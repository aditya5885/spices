<?php
session_start();
require_once 'config.php';

$conn = getDB();
$conn->select_db(DB_NAME);

$method = $_SERVER['REQUEST_METHOD'];

// Parse incoming request data
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
    // Auth check - only admin can list repeat orders
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit();
    }
    
    // Get all repeat orders
    $res = $conn->query("SELECT * FROM repeat_orders ORDER BY id DESC");
    $repeat_orders = [];
    while ($row = $res->fetch_assoc()) {
        $repeat_orders[] = $row;
    }
    echo json_encode($repeat_orders);

} elseif ($method === 'POST') {
    $action = isset($_GET['action']) ? $_GET['action'] : (isset($input['action']) ? $input['action'] : 'create');

    if ($action === 'create') {
        // Public action
        $customer_name = isset($input['customer_name']) ? trim($input['customer_name']) : '';
        $email = isset($input['email']) ? trim($input['email']) : '';
        $phone = isset($input['phone']) ? trim($input['phone']) : '';
        $product_slug = isset($input['product_slug']) ? trim($input['product_slug']) : '';
        $pack_size = isset($input['pack_size']) ? trim($input['pack_size']) : '';
        $quantity = isset($input['quantity']) ? intval($input['quantity']) : 1;
        $frequency = isset($input['frequency']) ? trim($input['frequency']) : 'monthly';
        $shipping_address = isset($input['shipping_address']) ? trim($input['shipping_address']) : '';
        $city = isset($input['city']) ? trim($input['city']) : '';
        $state = isset($input['state']) ? trim($input['state']) : '';
        $pin_code = isset($input['pin_code']) ? trim($input['pin_code']) : '';
        
        if (empty($customer_name) || empty($email) || empty($phone) || empty($product_slug) || empty($pack_size) || empty($shipping_address)) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required subscription parameters."]);
            exit();
        }
        
        // Calculate next due date (e.g. today + 1 month or 1 week)
        $next_due = new DateTime();
        if ($frequency === 'weekly') {
            $next_due->modify('+1 week');
        } elseif ($frequency === 'fortnightly') {
            $next_due->modify('+2 weeks');
        } elseif ($frequency === 'bimonthly') {
            $next_due->modify('+2 months');
        } else { // default to monthly
            $next_due->modify('+1 month');
        }
        $next_due_str = $next_due->format('Y-m-d');
        
        $stmt = $conn->prepare("INSERT INTO repeat_orders (customer_name, email, phone, product_slug, pack_size, quantity, frequency, shipping_address, city, state, pin_code, status, next_due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)");
        $stmt->bind_param("sssssissssss", $customer_name, $email, $phone, $product_slug, $pack_size, $quantity, $frequency, $shipping_address, $city, $state, $pin_code, $next_due_str);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Standing order profile created successfully!"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to save standing order: " . $stmt->error]);
        }
        $stmt->close();
        
    } elseif ($action === 'update_status') {
        // Admin only
        if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            exit();
        }
        
        $id = isset($input['id']) ? intval($input['id']) : 0;
        $status = isset($input['status']) ? trim($input['status']) : '';
        
        if (!$id || empty($status)) {
            http_response_code(400);
            echo json_encode(["error" => "ID and status are required."]);
            exit();
        }
        
        $stmt = $conn->prepare("UPDATE repeat_orders SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $status, $id);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Standing order status updated to $status."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update standing order: " . $stmt->error]);
        }
        $stmt->close();

    } elseif ($action === 'delete') {
        // Admin only
        if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            exit();
        }
        
        $id = isset($input['id']) ? intval($input['id']) : 0;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "ID is required for delete."]);
            exit();
        }
        
        $stmt = $conn->prepare("DELETE FROM repeat_orders WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Standing order deleted successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to delete standing order: " . $stmt->error]);
        }
        $stmt->close();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid action specified."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

$conn->close();
?>
