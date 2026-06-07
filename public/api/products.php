<?php
require_once 'config.php';

$conn = getDB();
$conn->select_db(DB_NAME);

$sql = "SELECT * FROM products WHERE is_active = 1 ORDER BY id ASC";
$result = $conn->query($sql);

$products = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $products[] = [
            "id" => $row['slug'],
            "name" => $row['name'],
            "slug" => $row['slug'],
            "description" => $row['description'],
            "priceInINR" => floatval($row['price_in_inr']),
            "image" => $row['image'],
            "badge" => $row['badge'],
            "specs" => $row['specs'],
            "stockQty" => intval($row['stock_qty']),
            "isActive" => intval($row['is_active'])
        ];
    }
}

echo json_encode($products);
$conn->close();
?>
