<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

require_post();
$in = json_input();

$role = ($in['role'] ?? '') === 'admin' ? 'admin' : 'student';
$email = trim((string)($in['email'] ?? ''));
$securityAnswer = trim((string)($in['securityAnswer'] ?? ''));

if ($email === '' || $securityAnswer === '') {
    fail('Please provide your answer.');
}

$pdo = get_db();
$table = $role === 'admin' ? 'admins' : 'students';

$stmt = $pdo->prepare("SELECT security_answer_hash FROM $table WHERE email = ?");
$stmt->execute([$email]);
$row = $stmt->fetch();

if (!$row || !password_verify(strtolower($securityAnswer), $row['security_answer_hash'])) {
    fail('Incorrect answer. Please try again.');
}

respond(['ok' => true]);
