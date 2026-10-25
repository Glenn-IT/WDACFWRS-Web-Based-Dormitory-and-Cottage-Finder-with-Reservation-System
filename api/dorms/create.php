<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

require_role('admin');
require_post();

$roomNumber = trim((string)($_POST['dormitoryName'] ?? $_POST['dormName'] ?? $_POST['name'] ?? $_POST['roomNumber'] ?? ''));
$gender = in_array($_POST['gender'] ?? '', ['Male', 'Female', 'Mixed'], true) ? $_POST['gender'] : 'Male';
$capacity = (int)($_POST['capacity'] ?? 0);
$price = (float)($_POST['price'] ?? 0);
$status = in_array($_POST['status'] ?? '', ['Available', 'Occupied', 'Full', 'Not Available'], true) ? $_POST['status'] : 'Available';
$description = trim((string)($_POST['description'] ?? ''));

$latitude = isset($_POST['latitude']) && $_POST['latitude'] !== '' ? (float)$_POST['latitude'] : 17.79250300;
$longitude = isset($_POST['longitude']) && $_POST['longitude'] !== '' ? (float)$_POST['longitude'] : 121.51050500;
$mapAddress = trim((string)($_POST['mapAddress'] ?? $_POST['map_address'] ?? ''));
if ($mapAddress === '') {
    $mapAddress = 'CSU-Piat, Baung, Piat, Cagayan (QGV6+26H)';
}

$ownerName = trim((string)($_POST['ownerName'] ?? $_POST['owner_name'] ?? ''));
$ownerPhone = trim((string)($_POST['ownerPhone'] ?? $_POST['owner_phone'] ?? ''));
$paymentAccountName = trim((string)($_POST['paymentAccountName'] ?? $_POST['payment_account_name'] ?? ''));
$paymentAccountNumber = trim((string)($_POST['paymentAccountNumber'] ?? $_POST['payment_account_number'] ?? ''));

if ($roomNumber === '' || $capacity <= 0 || $price < 0) {
    fail('Please fill in all required fields.');
}

$pdo = get_db();

$images = handle_gallery_uploads('dorms');
$imagePath = $images[0] ?? null;
$imagesJson = !empty($images) ? json_encode($images) : null;

$paymentQr = null;
if (isset($_FILES['paymentQr'])) {
    $paymentQr = save_uploaded_image($_FILES['paymentQr'], 'qrcodes');
} elseif (isset($_FILES['payment_qr'])) {
    $paymentQr = save_uploaded_image($_FILES['payment_qr'], 'qrcodes');
}

$stmt = $pdo->prepare('INSERT INTO dormitories (room_no, gender, capacity, price, status, description, latitude, longitude, map_address, image_path, images, owner_name, owner_phone, payment_qr, payment_account_name, payment_account_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
$stmt->execute([$roomNumber, $gender, $capacity, $price, $status, $description, $latitude, $longitude, $mapAddress, $imagePath, $imagesJson, $ownerName, $ownerPhone, $paymentQr, $paymentAccountName, $paymentAccountNumber]);

$id = (int)$pdo->lastInsertId();
$stmt = $pdo->prepare('SELECT * FROM dormitories WHERE id = ?');
$stmt->execute([$id]);

respond(['ok' => true, 'dorm' => map_dorm($stmt->fetch())]);
