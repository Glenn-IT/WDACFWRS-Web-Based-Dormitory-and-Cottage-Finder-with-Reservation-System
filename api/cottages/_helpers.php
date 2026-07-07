<?php
declare(strict_types=1);
require_once __DIR__ . '/../_uploads.php';

function map_cottage(array $r): array {
    return [
        'id' => (int)$r['id'],
        'name' => $r['name'],
        'owner' => $r['owner'],
        'rooms' => (int)$r['rooms'],
        'price' => (float)$r['price'],
        'availability' => $r['availability'],
        'description' => $r['description'],
        'image' => $r['image_path'] ?: '',
    ];
}
