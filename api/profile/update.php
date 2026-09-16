<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../users/_helpers.php';

$session = require_role('student');
require_post();
$in = json_input();

$phone = trim((string)($in['phone'] ?? ''));
if ($phone !== '' && !is_valid_ph_phone($phone)) {
    fail('Please enter a valid PH mobile number (e.g. 09123456789).');
}

$parent = is_array($in['parentInfo'] ?? null) ? $in['parentInfo'] : null;
if ($parent !== null) {
    $parentPhone = trim((string)($parent['phone'] ?? ''));
    $emergencyNumber = trim((string)($parent['emergencyNumber'] ?? ''));
    if ($parentPhone !== '' && !is_valid_ph_phone($parentPhone)) {
        fail('Please enter a valid parent mobile number (e.g. 09123456789).');
    }
    if ($emergencyNumber !== '' && !is_valid_ph_phone($emergencyNumber)) {
        fail('Please enter a valid emergency contact number (e.g. 09123456789).');
    }
}

$pdo = get_db();
$pdo->beginTransaction();

try {
    $stmt = $pdo->prepare('UPDATE students SET course=?, year_level=?, semester=?, nationality=?, birthday=?, phone=?, address=? WHERE id=?');
    $stmt->execute([
        trim((string)($in['course'] ?? '')),
        trim((string)($in['yearLevel'] ?? '')),
        trim((string)($in['semester'] ?? '')),
        trim((string)($in['nationality'] ?? '')),
        ($in['birthday'] ?? '') !== '' ? $in['birthday'] : null,
        $phone,
        trim((string)($in['address'] ?? '')),
        $session['id'],
    ]);

    if ($parent !== null) {
        $stmtParent = $pdo->prepare('INSERT INTO student_parent_info 
            (student_id, father_name, mother_name, occupation, education, address, phone, emergency_contact, relationship, emergency_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            father_name=VALUES(father_name), mother_name=VALUES(mother_name), occupation=VALUES(occupation), education=VALUES(education),
            address=VALUES(address), phone=VALUES(phone), emergency_contact=VALUES(emergency_contact), relationship=VALUES(relationship), emergency_number=VALUES(emergency_number)');
        $stmtParent->execute([
            $session['id'],
            trim((string)($parent['fatherName'] ?? '')),
            trim((string)($parent['motherName'] ?? '')),
            trim((string)($parent['occupation'] ?? '')),
            trim((string)($parent['education'] ?? '')),
            trim((string)($parent['address'] ?? '')),
            trim((string)($parent['phone'] ?? '')),
            trim((string)($parent['emergencyContact'] ?? '')),
            trim((string)($parent['relationship'] ?? '')),
            trim((string)($parent['emergencyNumber'] ?? '')),
        ]);
    }

    $bg = is_array($in['background'] ?? null) ? $in['background'] : null;
    if ($bg !== null) {
        $stmtBg = $pdo->prepare('INSERT INTO student_backgrounds
            (student_id, appliances, friends_at_dorm, friends_relationship, reason, medical_conditions, severe_illness, hobbies, smoking, drinking, organizations, leisure)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            appliances=VALUES(appliances), friends_at_dorm=VALUES(friends_at_dorm), friends_relationship=VALUES(friends_relationship),
            reason=VALUES(reason), medical_conditions=VALUES(medical_conditions), severe_illness=VALUES(severe_illness),
            hobbies=VALUES(hobbies), smoking=VALUES(smoking), drinking=VALUES(drinking), organizations=VALUES(organizations), leisure=VALUES(leisure)');
        $stmtBg->execute([
            $session['id'],
            trim((string)($bg['appliances'] ?? '')),
            trim((string)($bg['friendsAtDorm'] ?? '')),
            trim((string)($bg['friendsRelationship'] ?? '')),
            trim((string)($bg['reason'] ?? '')),
            trim((string)($bg['medicalConditions'] ?? '')),
            trim((string)($bg['severeIllness'] ?? '')),
            trim((string)($bg['hobbies'] ?? '')),
            trim((string)($bg['smoking'] ?? '')),
            trim((string)($bg['drinking'] ?? '')),
            trim((string)($bg['organizations'] ?? '')),
            trim((string)($bg['leisure'] ?? '')),
        ]);
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fail('Failed to update profile: ' . $e->getMessage(), 500);
}

$stmt = $pdo->prepare('SELECT * FROM students WHERE id = ?');
$stmt->execute([$session['id']]);

respond(['ok' => true, 'user' => map_student($stmt->fetch())]);
