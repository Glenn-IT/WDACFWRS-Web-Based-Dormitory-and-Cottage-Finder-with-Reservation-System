<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../users/_helpers.php';

$session = require_role('student');

$pdo = get_db();
$stmt = $pdo->prepare('SELECT * FROM students WHERE id = ?');
$stmt->execute([$session['id']]);
$row = $stmt->fetch();

if (!$row) {
    fail('User not found.', 404);
}

$stmtParent = $pdo->prepare('SELECT * FROM student_parent_info WHERE student_id = ?');
$stmtParent->execute([$session['id']]);
$parentRow = $stmtParent->fetch() ?: [];

$stmtBg = $pdo->prepare('SELECT * FROM student_backgrounds WHERE student_id = ?');
$stmtBg->execute([$session['id']]);
$bgRow = $stmtBg->fetch() ?: [];

respond([
    'ok' => true,
    'user' => map_student($row),
    'parentInfo' => [
        'fatherName' => (string)($parentRow['father_name'] ?? ''),
        'motherName' => (string)($parentRow['mother_name'] ?? ''),
        'occupation' => (string)($parentRow['occupation'] ?? ''),
        'education' => (string)($parentRow['education'] ?? ''),
        'address' => (string)($parentRow['address'] ?? ''),
        'phone' => (string)($parentRow['phone'] ?? ''),
        'emergencyContact' => (string)($parentRow['emergency_contact'] ?? ''),
        'relationship' => (string)($parentRow['relationship'] ?? ''),
        'emergencyNumber' => (string)($parentRow['emergency_number'] ?? ''),
    ],
    'background' => [
        'appliances' => (string)($bgRow['appliances'] ?? ''),
        'friendsAtDorm' => (string)($bgRow['friends_at_dorm'] ?? ''),
        'friendsRelationship' => (string)($bgRow['friends_relationship'] ?? ''),
        'reason' => (string)($bgRow['reason'] ?? ''),
        'medicalConditions' => (string)($bgRow['medical_conditions'] ?? ''),
        'severeIllness' => (string)($bgRow['severe_illness'] ?? ''),
        'hobbies' => (string)($bgRow['hobbies'] ?? ''),
        'smoking' => (string)($bgRow['smoking'] ?? ''),
        'drinking' => (string)($bgRow['drinking'] ?? ''),
        'organizations' => (string)($bgRow['organizations'] ?? ''),
        'leisure' => (string)($bgRow['leisure'] ?? ''),
    ],
    'profileStatus' => check_profile_completion($pdo, (int)$session['id']),
]);
