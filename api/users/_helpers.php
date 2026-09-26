<?php
declare(strict_types=1);

function map_student(array $u): array {
    return [
        'id' => (int)$u['id'],
        'studentNo' => $u['student_no'],
        'firstName' => $u['first_name'],
        'lastName' => $u['last_name'],
        'email' => $u['email'],
        'course' => $u['course'],
        'yearLevel' => $u['year_level'],
        'semester' => $u['semester'],
        'nationality' => $u['nationality'],
        'address' => $u['address'],
        'birthday' => $u['birthday'],
        'phone' => $u['phone'],
        'profilePic' => $u['profile_pic_path'] ?: '',
        'status' => $u['status'],
        'dateRegistered' => substr($u['date_registered'], 0, 10),
    ];
}

function check_profile_completion(PDO $pdo, int $studentId): array {
    $stmtP = $pdo->prepare('SELECT * FROM student_parent_info WHERE student_id = ?');
    $stmtP->execute([$studentId]);
    $p = $stmtP->fetch();

    $missing = [];
    $hasParentName = !empty(trim((string)($p['father_name'] ?? ''))) || !empty(trim((string)($p['mother_name'] ?? '')));
    $hasEmergencyContact = !empty(trim((string)($p['emergency_contact'] ?? '')));
    $hasRelationship = !empty(trim((string)($p['relationship'] ?? '')));
    $hasEmergencyNumber = !empty(trim((string)($p['emergency_number'] ?? '')));

    if (!$p || !$hasParentName) {
        $missing[] = 'Father or Mother Full Name';
    }
    if (!$p || !$hasEmergencyContact) {
        $missing[] = 'Emergency Contact Person';
    }
    if (!$p || !$hasRelationship) {
        $missing[] = 'Relationship to Emergency Contact';
    }
    if (!$p || !$hasEmergencyNumber) {
        $missing[] = 'Emergency Contact Number';
    }

    $parentComplete = $hasParentName && $hasEmergencyContact && $hasRelationship && $hasEmergencyNumber;
    $isComplete = $parentComplete;

    return [
        'isComplete' => $isComplete,
        'parentComplete' => $parentComplete,
        'missingFields' => $missing,
    ];
}
