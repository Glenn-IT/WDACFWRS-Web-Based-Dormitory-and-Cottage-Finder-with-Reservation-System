<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../users/_helpers.php';

$session = require_role('student');

$pdo = get_db();
$stmt = $pdo->prepare('SELECT * FROM students WHERE id = ?');
$stmt->execute([$session['id']]);
$row = $stmt->fetch();

if (!$row) {
    fail('User not found.', 404);
}

respond(['ok' => true, 'user' => map_student($row)]);
