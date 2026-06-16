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

// Parse incoming request data
$input = [];
if ($method === 'POST') {
    // If JSON request, parse it
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    if (stripos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
    } else {
        $input = $_POST;
    }
}

// Function to process image uploads
function processUpload() {
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $uploadDir = __DIR__ . '/../uploads/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    $fileName = time() . '_' . basename($_FILES['image']['name']);
    $fileName = preg_replace("/[^a-zA-Z0-9._-]/", "_", $fileName);
    $targetFilePath = $uploadDir . $fileName;
    $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));
    $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (in_array($fileType, $allowedTypes)) {
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFilePath)) {
            return '/uploads/' . $fileName;
        }
    }
    return null;
}

if ($method === 'GET') {
    if (isset($_GET['slug'])) {
        // Get single product
        $stmt = $conn->prepare("SELECT * FROM products WHERE slug = ?");
        $stmt->bind_param("s", $_GET['slug']);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($row = $res->fetch_assoc()) {
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Product not found"]);
        }
        $stmt->close();
    } else {
        // Get all products (active + inactive) for admin
        $res = $conn->query("SELECT * FROM products ORDER BY id ASC");
        $products = [];
        while ($row = $res->fetch_assoc()) {
            $products[] = $row;
        }
        echo json_encode($products);
    }
} elseif ($method === 'POST') {
    $action = isset($_GET['action']) ? $_GET['action'] : (isset($input['action']) ? $input['action'] : 'add');
    
    if ($action === 'add') {
        $name = isset($input['name']) ? trim($input['name']) : '';
        $slug = isset($input['slug']) ? preg_replace('/[^a-z0-9\-]/', '', strtolower(str_replace(' ', '-', $input['slug']))) : '';
        if (empty($slug) && !empty($name)) {
            $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower(str_replace(' ', '-', $name)));
        }
        $description = isset($input['description']) ? trim($input['description']) : '';
        $price = isset($input['price_in_inr']) ? floatval($input['price_in_inr']) : 0.0;
        $badge = isset($input['badge']) ? trim($input['badge']) : '';
        $specs = isset($input['specs']) ? trim($input['specs']) : '';
        $stock = isset($input['stock_qty']) ? intval($input['stock_qty']) : 50;
        $isActive = isset($input['is_active']) ? intval($input['is_active']) : 1;
        $isFixed = isset($input['is_fixed_price']) ? intval($input['is_fixed_price']) : 0;
        
        $imagePath = processUpload();
        if (!$imagePath) {
            $imagePath = isset($input['image_url']) && !empty($input['image_url']) ? $input['image_url'] : 'https://placehold.co/600x400?text=' . urlencode($name);
        }
        
        if (empty($name) || empty($slug)) {
            http_response_code(400);
            echo json_encode(["error" => "Name and slug are required"]);
            exit();
        }
        
        // Check duplicate slug
        $check = $conn->prepare("SELECT id FROM products WHERE slug = ?");
        $check->bind_param("s", $slug);
        $check->execute();
        $check->store_result();
        if ($check->num_rows > 0) {
            http_response_code(400);
            echo json_encode(["error" => "A product with slug '$slug' already exists."]);
            $check->close();
            exit();
        }
        $check->close();
        
        $stmt = $conn->prepare("INSERT INTO products (slug, name, description, price_in_inr, image, badge, specs, stock_qty, is_active, is_fixed_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssdsssiii", $slug, $name, $description, $price, $imagePath, $badge, $specs, $stock, $isActive, $isFixed);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Product added successfully", "slug" => $slug]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to add product: " . $stmt->error]);
        }
        $stmt->close();
        
    } elseif ($action === 'update') {
        $id = isset($input['id']) ? intval($input['id']) : 0;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Product ID is required for update"]);
            exit();
        }
        
        // Fetch current product to check fields
        $curr = $conn->query("SELECT * FROM products WHERE id = $id");
        if ($curr->num_rows === 0) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found"]);
            exit();
        }
        $currRow = $curr->fetch_assoc();
        
        $name = isset($input['name']) ? trim($input['name']) : $currRow['name'];
        $slug = isset($input['slug']) ? preg_replace('/[^a-z0-9\-]/', '', strtolower(str_replace(' ', '-', $input['slug']))) : $currRow['slug'];
        $description = isset($input['description']) ? trim($input['description']) : $currRow['description'];
        $price = isset($input['price_in_inr']) ? floatval($input['price_in_inr']) : floatval($currRow['price_in_inr']);
        $badge = isset($input['badge']) ? trim($input['badge']) : $currRow['badge'];
        $specs = isset($input['specs']) ? trim($input['specs']) : $currRow['specs'];
        $stock = isset($input['stock_qty']) ? intval($input['stock_qty']) : intval($currRow['stock_qty']);
        $isActive = isset($input['is_active']) ? intval($input['is_active']) : intval($currRow['is_active']);
        $isFixed = isset($input['is_fixed_price']) ? intval($input['is_fixed_price']) : intval($currRow['is_fixed_price']);
        
        $imagePath = processUpload();
        if (!$imagePath) {
            $imagePath = isset($input['image_url']) && !empty($input['image_url']) ? $input['image_url'] : $currRow['image'];
        }
        
        // Check duplicate slug for other products
        $check = $conn->prepare("SELECT id FROM products WHERE slug = ? AND id != ?");
        $check->bind_param("si", $slug, $id);
        $check->execute();
        $check->store_result();
        if ($check->num_rows > 0) {
            http_response_code(400);
            echo json_encode(["error" => "A product with slug '$slug' already exists."]);
            $check->close();
            exit();
        }
        $check->close();
        
        $stmt = $conn->prepare("UPDATE products SET slug = ?, name = ?, description = ?, price_in_inr = ?, image = ?, badge = ?, specs = ?, stock_qty = ?, is_active = ?, is_fixed_price = ? WHERE id = ?");
        $stmt->bind_param("sssdsssiiii", $slug, $name, $description, $price, $imagePath, $badge, $specs, $stock, $isActive, $isFixed, $id);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Product updated successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update product: " . $stmt->error]);
        }
        $stmt->close();
        
    } elseif ($action === 'delete') {
        $id = isset($input['id']) ? intval($input['id']) : 0;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Product ID is required for delete"]);
            exit();
        }
        
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Product deleted successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to delete product: " . $stmt->error]);
        }
        $stmt->close();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid action specified"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

$conn->close();
?>
