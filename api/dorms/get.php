<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

if (!current_session()) {
    fail('Not authenticated.', 401);
}

$id = (int)($_GET['id'] ?? 0);
if (!$id) {
    fail('Missing dormitory id.');
}

$pdo = get_db();
$stmt = $pdo->prepare('SELECT * FROM dormitories WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();

if (!$row) {
    fail('Dormitory not found.', 404);
}

respond(['ok' => true, 'dorm' => map_dorm($row)]);
