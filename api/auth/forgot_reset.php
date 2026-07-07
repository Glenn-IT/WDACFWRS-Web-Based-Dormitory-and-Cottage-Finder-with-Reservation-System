<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

require_post();
$in = json_input();

$role = ($in['role'] ?? '') === 'admin' ? 'admin' : 'student';
$email = trim((string)($in['email'] ?? ''));
$securityAnswer = trim((string)($in['securityAnswer'] ?? ''));
$newPassword = (string)($in['newPassword'] ?? '');

if ($email === '' || $securityAnswer === '' || $newPassword === '') {
    fail('Please fill in all fields.');
}
if (strlen($newPassword) < 6) {
    fail('Password must be at least 6 characters.');
}

$pdo = get_db();
$table = $role === 'admin' ? 'admins' : 'students';

$stmt = $pdo->prepare("SELECT id, security_answer_hash FROM $table WHERE email = ?");
$stmt->execute([$email]);
$row = $stmt->fetch();

if (!$row) {
    fail('No account found with that email.');
}
if (!password_verify(strtolower($securityAnswer), $row['security_answer_hash'])) {
    fail('Security answer does not match our records.');
}

$stmt = $pdo->prepare("UPDATE $table SET password_hash = ? WHERE id = ?");
$stmt->execute([password_hash($newPassword, PASSWORD_DEFAULT), $row['id']]);

respond(['ok' => true]);
