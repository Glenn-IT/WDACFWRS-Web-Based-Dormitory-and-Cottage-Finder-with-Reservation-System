<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

$session = require_role('student');
require_post();
$in = json_input();
$id = (int)($in['id'] ?? 0);

$pdo = get_db();
if ($id) {
    $stmt = $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND student_id = ?');
    $stmt->execute([$id, $session['id']]);
} else {
    $stmt = $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE student_id = ?');
    $stmt->execute([$session['id']]);
}

respond(['ok' => true]);
