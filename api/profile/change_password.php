<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

$session = require_role('student');
require_post();
$in = json_input();

$current = (string)($in['current'] ?? '');
$next = (string)($in['next'] ?? '');
$confirm = (string)($in['confirm'] ?? '');

if ($next !== $confirm) {
    fail('New passwords do not match.');
}
if (strlen($next) < 6) {
    fail('Password must be at least 6 characters.');
}

$pdo = get_db();
$stmt = $pdo->prepare('SELECT password_hash FROM students WHERE id = ?');
$stmt->execute([$session['id']]);
$row = $stmt->fetch();

if (!$row || !password_verify($current, $row['password_hash'])) {
    fail('Current password is incorrect.');
}

$pdo->prepare('UPDATE students SET password_hash = ? WHERE id = ?')
    ->execute([password_hash($next, PASSWORD_DEFAULT), $session['id']]);

respond(['ok' => true]);
