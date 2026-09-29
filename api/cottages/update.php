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

$ownerPhone = trim((string)($_POST['ownerPhone'] ?? $_POST['owner_phone'] ?? ''));
$ownerEmail = trim((string)($_POST['ownerEmail'] ?? $_POST['owner_email'] ?? ''));
$ownerBio = trim((string)($_POST['ownerBio'] ?? $_POST['owner_bio'] ?? ''));
$paymentAccountName = trim((string)($_POST['paymentAccountName'] ?? $_POST['payment_account_name'] ?? ''));
$paymentAccountNumber = trim((string)($_POST['paymentAccountNumber'] ?? $_POST['payment_account_number'] ?? ''));

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

if ($imagePath) {
    $fields[] = 'image_path = ?';
    $params[] = $imagePath;
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
$sql = 'UPDATE cottages SET ' . implode(', ', $fields) . ' WHERE id = ?';
$stmt = $pdo->prepare($sql);
$stmt->execute($params);

$stmt = $pdo->prepare('SELECT * FROM cottages WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();

if (!$row) {
    fail('Cottage not found.', 404);
}

respond(['ok' => true, 'cottage' => map_cottage($row)]);
