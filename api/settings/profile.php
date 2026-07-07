<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

$session = require_role('admin');
require_post();
$in = json_input();

$name = trim((string)($in['name'] ?? ''));
$email = trim((string)($in['email'] ?? ''));

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('Please provide a valid name and email.');
}

$pdo = get_db();

$stmt = $pdo->prepare('SELECT id FROM admins WHERE email = ? AND id != ?');
$stmt->execute([$email, $session['id']]);
if ($stmt->fetch()) {
    fail('Another admin account already uses this email.');
}

$pdo->prepare('UPDATE admins SET name = ?, email = ? WHERE id = ?')->execute([$name, $email, $session['id']]);

$_SESSION['user']['name'] = $name;
$_SESSION['user']['email'] = $email;

respond(['ok' => true, 'user' => $_SESSION['user']]);
