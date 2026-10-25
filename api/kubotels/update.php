<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

require_role('admin');
require_post();

$id = (int)($_POST['id'] ?? 0);
if (!$id) {
    fail('Missing kubotel id.');
}

$name = trim((string)($_POST['name'] ?? ''));
$owner = trim((string)($_POST['owner'] ?? ''));
$rooms = (int)($_POST['rooms'] ?? 0);
$price = (float)($_POST['price'] ?? 0);
$description = trim((string)($_POST['description'] ?? ''));

$latitude = isset($_POST['latitude']) && $_POST['latitude'] !== '' ? (float)$_POST['latitude'] : null;
$longitude = isset($_POST['longitude']) && $_POST['longitude'] !== '' ? (float)$_POST['longitude'] : null;
$mapAddress = isset($_POST['mapAddress']) ? trim((string)$_POST['mapAddress']) : (isset($_POST['map_address']) ? trim((string)$_POST['map_address']) : null);

$ownerPhone = trim((string)($_POST['ownerPhone'] ?? $_POST['owner_phone'] ?? ''));
$ownerEmail = trim((string)($_POST['ownerEmail'] ?? $_POST['owner_email'] ?? ''));
$ownerBio = trim((string)($_POST['ownerBio'] ?? $_POST['owner_bio'] ?? ''));
$paymentAccountName = trim((string)($_POST['paymentAccountName'] ?? $_POST['payment_account_name'] ?? ''));
$paymentAccountNumber = trim((string)($_POST['paymentAccountNumber'] ?? $_POST['payment_account_number'] ?? ''));

if ($name === '' || $rooms <= 0 || $price < 0) {
    fail('Please fill in all required fields.');
}

$pdo = get_db();

$checkStmt = $pdo->prepare('SELECT COUNT(*) FROM kubotels WHERE LOWER(name) = LOWER(?) AND id != ?');
$checkStmt->execute([$name, $id]);
if ((int)$checkStmt->fetchColumn() > 0) {
    fail('A Kubotel unit with this name already exists.');
}

$stmtOld = $pdo->prepare('SELECT * FROM kubotels WHERE id = ?');
$stmtOld->execute([$id]);
$existing = $stmtOld->fetch();
if (!$existing) {
    fail('Kubotel not found.');
}

$existingImages = [];
if (!empty($existing['images'])) {
    $existingImages = json_decode($existing['images'], true) ?: [];
}
if (empty($existingImages) && !empty($existing['image_path'])) {
    $existingImages = [$existing['image_path']];
}

$images = handle_gallery_uploads('kubotels', $existingImages);

$ownerPhoto = null;
if (isset($_FILES['ownerPhoto'])) {
    $ownerPhoto = save_uploaded_image($_FILES['ownerPhoto'], 'owners');
} elseif (isset($_FILES['owner_photo'])) {
    $ownerPhoto = save_uploaded_image($_FILES['owner_photo'], 'owners');
}

$paymentQr = null;
if (isset($_FILES['paymentQr'])) {
    $paymentQr = save_uploaded_image($_FILES['paymentQr'], 'qrcodes');
} elseif (isset($_FILES['payment_qr'])) {
    $paymentQr = save_uploaded_image($_FILES['payment_qr'], 'qrcodes');
}

$fields = [
    'name = ?',
    'owner = ?',
    'owner_phone = ?',
    'owner_email = ?',
    'owner_bio = ?',
    'rooms = ?',
    'price = ?',
    'description = ?',
    'payment_account_name = ?',
    'payment_account_number = ?',
];
$params = [$name, $owner, $ownerPhone, $ownerEmail, $ownerBio, $rooms, $price, $description, $paymentAccountName, $paymentAccountNumber];

if ($latitude !== null) {
    $fields[] = 'latitude = ?';
    $params[] = $latitude;
}
if ($longitude !== null) {
    $fields[] = 'longitude = ?';
    $params[] = $longitude;
}
if ($mapAddress !== null) {
    $fields[] = 'map_address = ?';
    $params[] = $mapAddress;
}

if (!empty($images)) {
    $fields[] = 'image_path = ?';
    $params[] = $images[0];
    $fields[] = 'images = ?';
    $params[] = json_encode($images);
}
if ($ownerPhoto) {
    $fields[] = 'owner_photo = ?';
    $params[] = $ownerPhoto;
}
if ($paymentQr) {
    $fields[] = 'payment_qr = ?';
    $params[] = $paymentQr;
}

$params[] = $id;
$sql = 'UPDATE kubotels SET ' . implode(', ', $fields) . ' WHERE id = ?';
$stmt = $pdo->prepare($sql);
$stmt->execute($params);

$stmt = $pdo->prepare('SELECT * FROM kubotels WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();

respond(['ok' => true, 'kubotel' => map_kubotel($row)]);
