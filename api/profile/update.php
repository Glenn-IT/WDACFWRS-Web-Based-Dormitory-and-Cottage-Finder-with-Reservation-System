<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../users/_helpers.php';

$session = require_role('student');
require_post();
$in = json_input();

$firstName = trim((string)($in['firstName'] ?? ''));
$lastName = trim((string)($in['lastName'] ?? ''));
if ($firstName === '' || $lastName === '') {
    fail('First and last name are required.');
}

$phone = trim((string)($in['phone'] ?? ''));
if ($phone !== '' && !is_valid_ph_phone($phone)) {
    fail('Please enter a valid PH mobile number (e.g. 09123456789).');
}

$pdo = get_db();
$stmt = $pdo->prepare('UPDATE students SET first_name=?, last_name=?, course=?, year_level=?, semester=?, nationality=?, birthday=?, phone=?, address=? WHERE id=?');
$stmt->execute([
    $firstName,
    $lastName,
    trim((string)($in['course'] ?? '')),
    trim((string)($in['yearLevel'] ?? '')),
    trim((string)($in['semester'] ?? '')),
    trim((string)($in['nationality'] ?? '')),
    ($in['birthday'] ?? '') !== '' ? $in['birthday'] : null,
    $phone,
    trim((string)($in['address'] ?? '')),
    $session['id'],
]);

$_SESSION['user']['name'] = "$firstName $lastName";

$stmt = $pdo->prepare('SELECT * FROM students WHERE id = ?');
$stmt->execute([$session['id']]);

respond(['ok' => true, 'user' => map_student($stmt->fetch())]);
