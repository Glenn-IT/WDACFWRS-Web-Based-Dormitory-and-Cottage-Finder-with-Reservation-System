<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

require_role('admin');

$id = (int)($_GET['id'] ?? 0);
if (!$id) {
    fail('Missing user id.');
}

$pdo = get_db();
$stmt = $pdo->prepare('SELECT * FROM students WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();

if (!$row) {
    fail('User not found.', 404);
}

respond(['ok' => true, 'user' => map_student($row)]);
