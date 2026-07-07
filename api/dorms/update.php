<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

require_role('admin');
require_post();

$id = (int)($_POST['id'] ?? 0);
if (!$id) {
    fail('Missing dormitory id.');
}

$roomNumber = trim((string)($_POST['roomNumber'] ?? ''));
$gender = ($_POST['gender'] ?? '') === 'Female' ? 'Female' : 'Male';
$capacity = (int)($_POST['capacity'] ?? 0);
$price = (float)($_POST['price'] ?? 0);
$status = in_array($_POST['status'] ?? '', ['Available', 'Occupied', 'Full'], true) ? $_POST['status'] : 'Available';
$description = trim((string)($_POST['description'] ?? ''));

if ($roomNumber === '' || $capacity <= 0 || $price < 0) {
    fail('Please fill in all required fields.');
}

$pdo = get_db();

$stmt = $pdo->prepare('SELECT id FROM dormitories WHERE room_no = ? AND id != ?');
$stmt->execute([$roomNumber, $id]);
if ($stmt->fetch()) {
    fail('A dormitory with this room number already exists.');
}

$imagePath = isset($_FILES['image']) ? save_uploaded_image($_FILES['image'], 'dorms') : null;

if ($imagePath) {
    $stmt = $pdo->prepare('UPDATE dormitories SET room_no=?, gender=?, capacity=?, price=?, status=?, description=?, image_path=? WHERE id=?');
    $stmt->execute([$roomNumber, $gender, $capacity, $price, $status, $description, $imagePath, $id]);
} else {
    $stmt = $pdo->prepare('UPDATE dormitories SET room_no=?, gender=?, capacity=?, price=?, status=?, description=? WHERE id=?');
    $stmt->execute([$roomNumber, $gender, $capacity, $price, $status, $description, $id]);
}

$stmt = $pdo->prepare('SELECT * FROM dormitories WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();

if (!$row) {
    fail('Dormitory not found.', 404);
}

respond(['ok' => true, 'dorm' => map_dorm($row)]);
