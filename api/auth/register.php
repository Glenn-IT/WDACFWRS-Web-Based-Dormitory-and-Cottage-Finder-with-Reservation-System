<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

require_post();
$in = json_input();

$firstName = trim((string)($in['firstName'] ?? ''));
$lastName = trim((string)($in['lastName'] ?? ''));
$email = trim((string)($in['email'] ?? ''));
$password = (string)($in['password'] ?? '');
$securityQuestion = trim((string)($in['securityQuestion'] ?? ''));
$securityAnswer = trim((string)($in['securityAnswer'] ?? ''));

if ($firstName === '' || $lastName === '' || $email === '' || $password === '' || $securityQuestion === '' || $securityAnswer === '') {
    fail('Please fill in all required fields.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('Please enter a valid email address.');
}
if (strlen($password) < 6) {
    fail('Password must be at least 6 characters.');
}

$pdo = get_db();

$stmt = $pdo->prepare('SELECT id FROM students WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    fail('An account with this email already exists.');
}

$studentNo = next_code($pdo, 'students', 'student_no', 'STU');

$stmt = $pdo->prepare('INSERT INTO students
    (student_no, first_name, last_name, email, password_hash, security_question, security_answer_hash,
     course, year_level, semester, nationality, address, birthday, phone, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'Active\')');
$stmt->execute([
    $studentNo,
    $firstName,
    $lastName,
    $email,
    password_hash($password, PASSWORD_DEFAULT),
    $securityQuestion,
    password_hash(strtolower($securityAnswer), PASSWORD_DEFAULT),
    trim((string)($in['course'] ?? '')),
    trim((string)($in['yearLevel'] ?? '')),
    trim((string)($in['semester'] ?? '')),
    trim((string)($in['nationality'] ?? 'Filipino')),
    trim((string)($in['address'] ?? '')),
    ($in['birthday'] ?? '') !== '' ? $in['birthday'] : null,
    trim((string)($in['phone'] ?? '')),
]);

$id = (int)$pdo->lastInsertId();

$_SESSION['user'] = [
    'role' => 'student',
    'id' => $id,
    'email' => $email,
    'name' => "$firstName $lastName",
];

respond(['ok' => true, 'user' => $_SESSION['user']]);
