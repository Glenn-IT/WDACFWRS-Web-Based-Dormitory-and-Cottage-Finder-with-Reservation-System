<?php
declare(strict_types=1);
require_once __DIR__ . '/../_uploads.php';

function map_dorm(array $r): array {
    return [
        'id' => (int)$r['id'],
        'roomNumber' => $r['room_no'],
        'gender' => $r['gender'],
        'capacity' => (int)$r['capacity'],
        'price' => (float)$r['price'],
        'status' => $r['status'],
        'description' => $r['description'],
        'image' => $r['image_path'] ?: '',
    ];
}
