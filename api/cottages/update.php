<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

require_role('admin');
require_post();

$id = (int)($_POST['id'] ?? 0);
if (!$id) {
    fail('Missing cottage id.');
}

$name = trim((string)($_POST['name'] ?? ''));
$owner = trim((string)($_POST['owner'] ?? ''));
$rooms = (int)($_POST['rooms'] ?? 0);
$price = (float)($_POST['price'] ?? 0);
$description = trim((string)($_POST['description'] ?? ''));

if ($name === '' || $rooms <= 0 || $price < 0) {
    fail('Please fill in all required fields.');
}

$pdo = get_db();

$checkStmt = $pdo->prepare('SELECT COUNT(*) FROM cottages WHERE LOWER(name) = LOWER(?) AND id != ?');
$checkStmt->execute([$name, $id]);
if ((int)$checkStmt->fetchColumn() > 0) {
    fail('A cottage with this name already exists.');
}

$imagePath = isset($_FILES['image']) ? save_uploaded_image($_FILES['image'], 'cottages') : null;

if ($imagePath) {
    $stmt = $pdo->prepare('UPDATE cottages SET name=?, owner=?, rooms=?, price=?, description=?, image_path=? WHERE id=?');
    $stmt->execute([$name, $owner, $rooms, $price, $description, $imagePath, $id]);
} else {
    $stmt = $pdo->prepare('UPDATE cottages SET name=?, owner=?, rooms=?, price=?, description=? WHERE id=?');
    $stmt->execute([$name, $owner, $rooms, $price, $description, $id]);
}

$stmt = $pdo->prepare('SELECT * FROM cottages WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();

if (!$row) {
    fail('Cottage not found.', 404);
}

respond(['ok' => true, 'cottage' => map_cottage($row)]);
