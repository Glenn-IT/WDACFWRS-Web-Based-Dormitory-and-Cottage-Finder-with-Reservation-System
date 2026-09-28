<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../users/_helpers.php';

$session = current_session();
$profileStatus = null;
if ($session && ($session['role'] ?? '') === 'student') {
    $pdo = get_db();
    $profileStatus = check_profile_completion($pdo, (int)$session['id']);
    $stmtG = $pdo->prepare('SELECT gender FROM students WHERE id = ?');
    $stmtG->execute([(int)$session['id']]);
    if ($gRow = $stmtG->fetch()) {
        $_SESSION['user']['gender'] = $gRow['gender'];
        $session['gender'] = $gRow['gender'];
    }
}

respond(['ok' => true, 'user' => $session, 'profileStatus' => $profileStatus]);
