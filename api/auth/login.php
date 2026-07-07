<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

require_post();
$in = json_input();

$role = ($in['role'] ?? '') === 'admin' ? 'admin' : 'student';
$email = trim((string)($in['email'] ?? ''));
$password = (string)($in['password'] ?? '');

if ($email === '' || $password === '') {
    fail('Please enter your email and password.');
}

$pdo = get_db();

if ($role === 'admin') {
    $stmt = $pdo->prepare('SELECT id, name, email, password_hash FROM admins WHERE email = ?');
    $stmt->execute([$email]);
    $account = $stmt->fetch();
    if (!$account || !password_verify($password, $account['password_hash'])) {
        fail('Invalid email or password.');
    }
    $_SESSION['user'] = [
        'role' => 'admin',
        'id' => (int)$account['id'],
        'email' => $account['email'],
        'name' => $account['name'],
    ];
} else {
    $stmt = $pdo->prepare('SELECT id, first_name, last_name, email, password_hash, status FROM students WHERE email = ?');
    $stmt->execute([$email]);
    $account = $stmt->fetch();
    if (!$account || !password_verify($password, $account['password_hash'])) {
        fail('Invalid email or password.');
    }
    if ($account['status'] === 'Inactive') {
        fail('Your account has been deactivated. Contact the admin office.');
    }
    $_SESSION['user'] = [
        'role' => 'student',
        'id' => (int)$account['id'],
        'email' => $account['email'],
        'name' => $account['first_name'] . ' ' . $account['last_name'],
    ];
}

respond(['ok' => true, 'user' => $_SESSION['user']]);
