<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

require_role('admin');
require_post();

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

$stmt = $pdo->prepare('SELECT id FROM dormitories WHERE room_no = ?');
$stmt->execute([$roomNumber]);
if ($stmt->fetch()) {
    fail('A dormitory with this room number already exists.');
}

$imagePath = isset($_FILES['image']) ? save_uploaded_image($_FILES['image'], 'dorms') : null;

$stmt = $pdo->prepare('INSERT INTO dormitories (room_no, gender, capacity, price, status, description, image_path)
    VALUES (?, ?, ?, ?, ?, ?, ?)');
$stmt->execute([$roomNumber, $gender, $capacity, $price, $status, $description, $imagePath]);

$id = (int)$pdo->lastInsertId();
$stmt = $pdo->prepare('SELECT * FROM dormitories WHERE id = ?');
$stmt->execute([$id]);

respond(['ok' => true, 'dorm' => map_dorm($stmt->fetch())]);
