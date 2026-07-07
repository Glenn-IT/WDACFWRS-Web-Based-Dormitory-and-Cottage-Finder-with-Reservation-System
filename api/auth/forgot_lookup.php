<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

require_post();
$in = json_input();

$role = ($in['role'] ?? '') === 'admin' ? 'admin' : 'student';
$email = trim((string)($in['email'] ?? ''));
if ($email === '') {
    fail('Please enter your email address.');
}

$pdo = get_db();
$table = $role === 'admin' ? 'admins' : 'students';
$stmt = $pdo->prepare("SELECT security_question FROM $table WHERE email = ?");
$stmt->execute([$email]);
$row = $stmt->fetch();

if (!$row) {
    fail('No account found with that email.');
}

respond(['ok' => true, 'question' => $row['security_question']]);
