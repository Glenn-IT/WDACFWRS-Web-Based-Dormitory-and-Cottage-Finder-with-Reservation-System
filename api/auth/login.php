<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

require_post();

// Check if currently locked out
if (isset($_SESSION['login_lockout_until'])) {
    $remaining = $_SESSION['login_lockout_until'] - time();
    if ($remaining > 0) {
        fail("Too many failed login attempts. Please wait {$remaining} second" . ($remaining === 1 ? '' : 's') . " before trying again.", 429);
    } else {
        unset($_SESSION['login_lockout_until'], $_SESSION['login_failed_attempts']);
    }
}

$in = json_input();

$role = ($in['role'] ?? '') === 'admin' ? 'admin' : 'student';
$email = trim((string)($in['email'] ?? ''));
$password = (string)($in['password'] ?? '');

if ($email === '' || $password === '') {
    fail('Please enter your email and password.');
}

function handle_login_failure(): never {
    $attempts = (int)($_SESSION['login_failed_attempts'] ?? 0) + 1;
    $_SESSION['login_failed_attempts'] = $attempts;
    if ($attempts >= 3) {
        $_SESSION['login_lockout_until'] = time() + 30;
        $_SESSION['login_failed_attempts'] = 0;
        fail('Too many failed login attempts. Login locked for 30 seconds.', 429);
    }
    $remaining = 3 - $attempts;
    fail("Invalid email or password. Attempt {$attempts} of 3 ({$remaining} attempt" . ($remaining === 1 ? '' : 's') . " remaining).");
}

$pdo = get_db();

if ($role === 'admin') {
    $stmt = $pdo->prepare('SELECT id, name, email, password_hash FROM admins WHERE email = ?');
    $stmt->execute([$email]);
    $account = $stmt->fetch();
    if (!$account || !password_verify($password, $account['password_hash'])) {
        handle_login_failure();
    }
    unset($_SESSION['login_failed_attempts'], $_SESSION['login_lockout_until']);
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
        handle_login_failure();
    }
    if ($account['status'] === 'Inactive') {
        fail('Your account has been deactivated. Contact the admin office.');
    }
    unset($_SESSION['login_failed_attempts'], $_SESSION['login_lockout_until']);
    $_SESSION['user'] = [
        'role' => 'student',
        'id' => (int)$account['id'],
        'email' => $account['email'],
        'name' => $account['first_name'] . ' ' . $account['last_name'],
    ];
}

require_once __DIR__ . '/../users/_helpers.php';

$profileStatus = null;
if ($role === 'student' && isset($_SESSION['user']['id'])) {
    $profileStatus = check_profile_completion($pdo, (int)$_SESSION['user']['id']);
}

respond(['ok' => true, 'user' => $_SESSION['user'], 'profileStatus' => $profileStatus]);
