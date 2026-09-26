<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';
require_once __DIR__ . '/../users/_helpers.php';

$session = require_role('student');
$studentId = (int)$session['id'];

require_post();
$in = json_input();

$type = ($in['type'] ?? '') === 'Cottage' ? 'Cottage' : 'Dormitory';
$assetId = (int)($in['assetId'] ?? 0);
$paymentMethod = trim((string)($in['paymentMethod'] ?? ''));

if (!$assetId || $paymentMethod === '') {
    fail('Missing required reservation details.');
}

$pdo = get_db();

// Requirement: Mandatory Profile & Parent Background Completion Check
$profStatus = check_profile_completion($pdo, $studentId);
if (!$profStatus['parentComplete']) {
    fail('Mandatory Profile Incomplete: University housing rules require you to complete your Parent / Guardian Background and Emergency Contacts in your profile before you can reserve a unit.', 403);
}

// Requirement: My Reservation - should not accept new reservation if there is existing approved.
$chkApproved = $pdo->prepare("SELECT id FROM reservations WHERE student_id = ? AND approval_status = 'Approved' LIMIT 1");
$chkApproved->execute([$studentId]);
if ($chkApproved->fetch()) {
    fail('You already have an active approved reservation and cannot submit a new one.');
}

// Requirement: Parent info & background moved to profile.
// Auto-pull parent and background from student profile if not supplied in the request.
$parent = is_array($in['parentInfo'] ?? null) ? $in['parentInfo'] : [];
if (empty($parent)) {
    $stmtP = $pdo->prepare('SELECT * FROM student_parent_info WHERE student_id = ?');
    $stmtP->execute([$studentId]);
    $pRow = $stmtP->fetch();
    if ($pRow) {
        $parent = [
            'fatherName' => (string)$pRow['father_name'],
            'motherName' => (string)$pRow['mother_name'],
            'occupation' => (string)$pRow['occupation'],
            'education' => (string)$pRow['education'],
            'address' => (string)$pRow['address'],
            'phone' => (string)$pRow['phone'],
            'emergencyContact' => (string)$pRow['emergency_contact'],
            'relationship' => (string)$pRow['relationship'],
            'emergencyNumber' => (string)$pRow['emergency_number'],
        ];
    }
}

$background = is_array($in['background'] ?? null) ? $in['background'] : [];
if (empty($background)) {
    $stmtB = $pdo->prepare('SELECT * FROM student_backgrounds WHERE student_id = ?');
    $stmtB->execute([$studentId]);
    $bRow = $stmtB->fetch();
    if ($bRow) {
        $background = [
            'appliances' => (string)$bRow['appliances'],
            'friendsAtDorm' => (string)$bRow['friends_at_dorm'],
            'friendsRelationship' => (string)$bRow['friends_relationship'],
            'reason' => (string)$bRow['reason'],
            'medicalConditions' => (string)$bRow['medical_conditions'],
            'severeIllness' => (string)$bRow['severe_illness'],
            'hobbies' => (string)$bRow['hobbies'],
            'smoking' => (string)$bRow['smoking'],
            'drinking' => (string)$bRow['drinking'],
            'organizations' => (string)$bRow['organizations'],
            'leisure' => (string)$bRow['leisure'],
        ];
    }
}

$parentPhone = trim((string)($parent['phone'] ?? ''));
$emergencyNumber = trim((string)($parent['emergencyNumber'] ?? ''));
if ($parentPhone !== '' && !is_valid_ph_phone($parentPhone)) {
    fail('Please enter a valid PH mobile number for parent/guardian (e.g. 09123456789).');
}
if ($emergencyNumber !== '' && !is_valid_ph_phone($emergencyNumber)) {
    fail('Please enter a valid emergency contact number (e.g. 09123456789).');
}

$pdo->beginTransaction();

try {
    if ($type === 'Dormitory') {
        $stmt = $pdo->prepare('SELECT id, price, status FROM dormitories WHERE id = ? FOR UPDATE');
        $stmt->execute([$assetId]);
        $asset = $stmt->fetch();
        if (!$asset) {
            throw new RuntimeException('Dormitory not found.');
        }
        if ($asset['status'] !== 'Available') {
            throw new RuntimeException('This dormitory is no longer available.');
        }
    } else {
        $stmt = $pdo->prepare('SELECT id, price, availability FROM cottages WHERE id = ? FOR UPDATE');
        $stmt->execute([$assetId]);
        $asset = $stmt->fetch();
        if (!$asset) {
            throw new RuntimeException('Cottage not found.');
        }
        if ($asset['availability'] !== 'Available') {
            throw new RuntimeException('This cottage is no longer available.');
        }
    }

    $amount = (float)$asset['price'];
    $paymentStatus = $paymentMethod === 'Cash' ? 'Pending' : 'Paid';
    $today = date('Y-m-d');

    $stmt = $pdo->prepare('INSERT INTO reservations
        (student_id, type, dorm_id, cottage_id, payment_method, amount, reservation_date, payment_status, approval_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, \'Pending\')');
    $stmt->execute([
        $studentId,
        $type,
        $type === 'Dormitory' ? $assetId : null,
        $type === 'Cottage' ? $assetId : null,
        $paymentMethod,
        $amount,
        $today,
        $paymentStatus,
    ]);
    $reservationId = (int)$pdo->lastInsertId();

    $stmt = $pdo->prepare('INSERT INTO reservation_parent_info
        (reservation_id, father_name, mother_name, occupation, education, address, phone, emergency_contact, relationship, emergency_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $reservationId,
        trim((string)($parent['fatherName'] ?? '')),
        trim((string)($parent['motherName'] ?? '')),
        trim((string)($parent['occupation'] ?? '')),
        trim((string)($parent['education'] ?? '')),
        trim((string)($parent['address'] ?? '')),
        $parentPhone,
        trim((string)($parent['emergencyContact'] ?? '')),
        trim((string)($parent['relationship'] ?? '')),
        $emergencyNumber,
    ]);

    $friendsRel = trim((string)($background['relationship'] ?? ($background['friendsRelationship'] ?? '')));
    $stmt = $pdo->prepare('INSERT INTO reservation_backgrounds
        (reservation_id, appliances, friends_at_dorm, friends_relationship, reason, medical_conditions,
         severe_illness, hobbies, smoking, drinking, organizations, leisure)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $reservationId,
        trim((string)($background['appliances'] ?? '')),
        trim((string)($background['friendsAtDorm'] ?? '')),
        $friendsRel,
        trim((string)($background['reason'] ?? '')),
        trim((string)($background['medicalConditions'] ?? '')),
        trim((string)($background['severeIllness'] ?? '')),
        trim((string)($background['hobbies'] ?? '')),
        trim((string)($background['smoking'] ?? '')),
        trim((string)($background['drinking'] ?? '')),
        trim((string)($background['organizations'] ?? '')),
        trim((string)($background['leisure'] ?? '')),
    ]);

    $stmt = $pdo->prepare('INSERT INTO payments (reservation_id, method, amount, status, date) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$reservationId, $paymentMethod, $amount, $paymentStatus, $today]);

    if ($type === 'Dormitory') {
        $stmt = $pdo->prepare('UPDATE dormitories SET status = \'Occupied\' WHERE id = ?');
        $stmt->execute([$assetId]);
    } else {
        $stmt = $pdo->prepare('UPDATE cottages SET availability = \'Booked\' WHERE id = ?');
        $stmt->execute([$assetId]);
    }

    $msg = "Your reservation #$reservationId has been submitted and is pending approval.";
    $stmt = $pdo->prepare('INSERT INTO notifications (student_id, message) VALUES (?, ?)');
    $stmt->execute([$studentId, $msg]);

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fail($e->getMessage() ?: 'Could not submit reservation.', 409);
}

respond(['ok' => true, 'reservation' => fetch_reservation($pdo, $reservationId)]);
