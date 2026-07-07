<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

$session = require_role('admin');
require_post();
$in = json_input();

$question = trim((string)($in['securityQuestion'] ?? ''));
$answer = trim((string)($in['securityAnswer'] ?? ''));

if ($question === '' || $answer === '') {
    fail('Please provide a security question and answer.');
}

$pdo = get_db();
$pdo->prepare('UPDATE admins SET security_question = ?, security_answer_hash = ? WHERE id = ?')
    ->execute([$question, password_hash(strtolower($answer), PASSWORD_DEFAULT), $session['id']]);

respond(['ok' => true]);
