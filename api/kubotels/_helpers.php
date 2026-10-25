<?php
declare(strict_types=1);
require_once __DIR__ . '/../_uploads.php';

function map_kubotel(array $r, bool $reservedByMe = false): array {
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
        'name' => $r['name'],
        'owner' => $r['owner'] ?? '',
        'ownerPhoto' => $r['owner_photo'] ?: '',
        'ownerPhone' => $r['owner_phone'] ?? '',
        'ownerEmail' => $r['owner_email'] ?? '',
        'ownerBio' => $r['owner_bio'] ?? '',
        'rooms' => (int)$r['rooms'],
        'price' => (float)$r['price'],
        'availability' => $r['availability'],
        'description' => $r['description'],
        'image' => $r['image_path'] ?: ($images[0] ?? ''),
        'images' => $images,
        'paymentQr' => $r['payment_qr'] ?: '',
        'paymentAccountName' => $r['payment_account_name'] ?? '',
        'paymentAccountNumber' => $r['payment_account_number'] ?? '',
        'reservedByMe' => $reservedByMe,
    ];
}
