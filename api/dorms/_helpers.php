<?php
declare(strict_types=1);
require_once __DIR__ . '/../_uploads.php';

function map_dorm(array $r, bool $reservedByMe = false): array {
    $images = [];
    if (!empty($r['images'])) {
        $decoded = is_string($r['images']) ? json_decode($r['images'], true) : $r['images'];
        if (is_array($decoded)) {
            $images = array_values(array_filter($decoded));
        }
    }
    if (empty($images) && !empty($r['image_path'])) {
        $images = [$r['image_path']];
    }

    return [
        'id' => (int)$r['id'],
        'roomNumber' => $r['room_no'],
        'dormitoryName' => $r['room_no'],
        'name' => $r['room_no'],
        'gender' => $r['gender'],
        'capacity' => (int)$r['capacity'],
        'price' => (float)$r['price'],
        'status' => $r['status'],
        'description' => $r['description'],
        'image' => $r['image_path'] ?: ($images[0] ?? ''),
        'images' => $images,
        'ownerName' => $r['owner_name'] ?? '',
        'ownerPhone' => $r['owner_phone'] ?? '',
        'paymentQr' => $r['payment_qr'] ?: '',
        'paymentAccountName' => $r['payment_account_name'] ?? '',
        'paymentAccountNumber' => $r['payment_account_number'] ?? '',
        'reservedByMe' => $reservedByMe,
    ];
}
