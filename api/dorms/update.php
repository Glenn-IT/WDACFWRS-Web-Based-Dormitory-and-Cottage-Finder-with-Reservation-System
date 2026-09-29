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

$roomNumber = trim((string)($_POST['dormitoryName'] ?? $_POST['dormName'] ?? $_POST['name'] ?? $_POST['roomNumber'] ?? ''));
$gender = in_array($_POST['gender'] ?? '', ['Male', 'Female', 'Mixed'], true) ? $_POST['gender'] : 'Male';
$capacity = (int)($_POST['capacity'] ?? 0);
$price = (float)($_POST['price'] ?? 0);
$status = in_array($_POST['status'] ?? '', ['Available', 'Occupied', 'Full'], true) ? $_POST['status'] : 'Available';
$description = trim((string)($_POST['description'] ?? ''));

$ownerName = trim((string)($_POST['ownerName'] ?? $_POST['owner_name'] ?? ''));
$ownerPhone = trim((string)($_POST['ownerPhone'] ?? $_POST['owner_phone'] ?? ''));
$paymentAccountName = trim((string)($_POST['paymentAccountName'] ?? $_POST['payment_account_name'] ?? ''));
$paymentAccountNumber = trim((string)($_POST['paymentAccountNumber'] ?? $_POST['payment_account_number'] ?? ''));

if ($roomNumber === '' || $capacity <= 0 || $price < 0) {
    fail('Please fill in all required fields.');
}

$pdo = get_db();

$imagePath = isset($_FILES['image']) ? save_uploaded_image($_FILES['image'], 'dorms') : null;
$paymentQr = null;
if (isset($_FILES['paymentQr'])) {
    $paymentQr = save_uploaded_image($_FILES['paymentQr'], 'qrcodes');
} elseif (isset($_FILES['payment_qr'])) {
    $paymentQr = save_uploaded_image($_FILES['payment_qr'], 'qrcodes');
}

$fields = [
    'room_no = ?',
    'gender = ?',
    'capacity = ?',
    'price = ?',
    'status = ?',
    'description = ?',
    'owner_name = ?',
    'owner_phone = ?',
    'payment_account_name = ?',
    'payment_account_number = ?',
];
$params = [$roomNumber, $gender, $capacity, $price, $status, $description, $ownerName, $ownerPhone, $paymentAccountName, $paymentAccountNumber];

if ($imagePath) {
    $fields[] = 'image_path = ?';
    $params[] = $imagePath;
}
if ($paymentQr) {
    $fields[] = 'payment_qr = ?';
    $params[] = $paymentQr;
}

$params[] = $id;
$sql = 'UPDATE dormitories SET ' . implode(', ', $fields) . ' WHERE id = ?';
$stmt = $pdo->prepare($sql);
$stmt->execute($params);

$stmt = $pdo->prepare('SELECT * FROM dormitories WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();

if (!$row) {
    fail('Dormitory not found.', 404);
}

respond(['ok' => true, 'dorm' => map_dorm($row)]);
