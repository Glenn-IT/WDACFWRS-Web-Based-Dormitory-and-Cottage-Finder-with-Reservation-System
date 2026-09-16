<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

require_role('admin');
require_post();

$name = trim((string)($_POST['name'] ?? ''));
$owner = trim((string)($_POST['owner'] ?? ''));
$ownerPhone = trim((string)($_POST['ownerPhone'] ?? $_POST['owner_phone'] ?? ''));
$ownerEmail = trim((string)($_POST['ownerEmail'] ?? $_POST['owner_email'] ?? ''));
$ownerBio = trim((string)($_POST['ownerBio'] ?? $_POST['owner_bio'] ?? ''));
$rooms = (int)($_POST['rooms'] ?? 0);
$price = (float)($_POST['price'] ?? 0);
$description = trim((string)($_POST['description'] ?? ''));
if ($name === '' || $rooms <= 0 || $price < 0) {
    fail('Please fill in all required fields.');
}

$pdo = get_db();

$checkStmt = $pdo->prepare('SELECT COUNT(*) FROM cottages WHERE LOWER(name) = LOWER(?)');
$checkStmt->execute([$name]);
if ((int)$checkStmt->fetchColumn() > 0) {
    fail('A cottage with this name already exists.');
}

$availability = 'Available';
$imagePath = isset($_FILES['image']) ? save_uploaded_image($_FILES['image'], 'cottages') : null;
$ownerPhoto = null;
if (isset($_FILES['ownerPhoto'])) {
    $ownerPhoto = save_uploaded_image($_FILES['ownerPhoto'], 'owners');
} elseif (isset($_FILES['owner_photo'])) {
    $ownerPhoto = save_uploaded_image($_FILES['owner_photo'], 'owners');
}

$stmt = $pdo->prepare('INSERT INTO cottages (name, owner, owner_photo, owner_phone, owner_email, owner_bio, rooms, price, availability, description, image_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
$stmt->execute([$name, $owner, $ownerPhoto, $ownerPhone, $ownerEmail, $ownerBio, $rooms, $price, $availability, $description, $imagePath]);

$id = (int)$pdo->lastInsertId();
$stmt = $pdo->prepare('SELECT * FROM cottages WHERE id = ?');
$stmt->execute([$id]);

respond(['ok' => true, 'cottage' => map_cottage($stmt->fetch())]);
