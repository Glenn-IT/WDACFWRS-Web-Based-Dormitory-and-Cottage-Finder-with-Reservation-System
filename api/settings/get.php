<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

$session = require_role('admin');

$pdo = get_db();
$stmt = $pdo->prepare('SELECT name, email, role, security_question FROM admins WHERE id = ?');
$stmt->execute([$session['id']]);
$row = $stmt->fetch();

if (!$row) {
    fail('Admin not found.', 404);
}

respond(['ok' => true, 'admin' => [
    'name' => $row['name'],
    'email' => $row['email'],
    'role' => $row['role'],
    'securityQuestion' => $row['security_question'],
]]);
