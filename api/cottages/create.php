<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

require_role('admin');
require_post();

$name = trim((string)($_POST['name'] ?? ''));
$owner = trim((string)($_POST['owner'] ?? ''));
$rooms = (int)($_POST['rooms'] ?? 0);
$price = (float)($_POST['price'] ?? 0);
$availability = ($_POST['availability'] ?? '') === 'Booked' ? 'Booked' : 'Available';
$description = trim((string)($_POST['description'] ?? ''));

if ($name === '' || $rooms <= 0 || $price < 0) {
    fail('Please fill in all required fields.');
}

$pdo = get_db();
$imagePath = isset($_FILES['image']) ? save_uploaded_image($_FILES['image'], 'cottages') : null;

$stmt = $pdo->prepare('INSERT INTO cottages (name, owner, rooms, price, availability, description, image_path)
    VALUES (?, ?, ?, ?, ?, ?, ?)');
$stmt->execute([$name, $owner, $rooms, $price, $availability, $description, $imagePath]);

$id = (int)$pdo->lastInsertId();
$stmt = $pdo->prepare('SELECT * FROM cottages WHERE id = ?');
$stmt->execute([$id]);

respond(['ok' => true, 'cottage' => map_cottage($stmt->fetch())]);
