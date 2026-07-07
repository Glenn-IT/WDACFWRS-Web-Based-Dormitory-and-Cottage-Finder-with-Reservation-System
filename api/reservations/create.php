<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

$session = require_role('student');
require_post();
$in = json_input();

$type = ($in['type'] ?? '') === 'Cottage' ? 'Cottage' : 'Dormitory';
$assetId = (int)($in['assetId'] ?? 0);
$paymentMethod = trim((string)($in['paymentMethod'] ?? ''));
$parent = is_array($in['parentInfo'] ?? null) ? $in['parentInfo'] : [];
$background = is_array($in['background'] ?? null) ? $in['background'] : [];

if (!$assetId || $paymentMethod === '') {
    fail('Missing required reservation details.');
}

$pdo = get_db();
$pdo->beginTransaction();

try {
    if ($type === 'Dormitory') {
        $stmt = $pdo->prepare('SELECT id, price, status FROM dormitories WHERE id = ? FOR UPDATE');
        $stmt->execute([$assetId]);
        $asset = $stmt->fetch();
        if (!$asset) {
            throw new RuntimeException('Room not found.');
        }
        if ($asset['status'] !== 'Available') {
            throw new RuntimeException('This room is no longer available.');
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
        $session['id'],
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
        trim((string)($parent['phone'] ?? '')),
        trim((string)($parent['emergencyContact'] ?? '')),
        trim((string)($parent['relationship'] ?? '')),
        trim((string)($parent['emergencyNumber'] ?? '')),
    ]);

    $stmt = $pdo->prepare('INSERT INTO reservation_backgrounds
        (reservation_id, appliances, friends_at_dorm, friends_relationship, reason, medical_conditions,
         severe_illness, hobbies, smoking, drinking, organizations, leisure)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $reservationId,
        trim((string)($background['appliances'] ?? '')),
        trim((string)($background['friendsAtDorm'] ?? '')),
        trim((string)($background['relationship'] ?? '')),
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

    $stmt = $pdo->prepare('INSERT INTO notifications (student_id, message) VALUES (?, ?)');
    $stmt->execute([$session['id'], "Your reservation #$reservationId has been submitted and is pending approval."]);

    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    fail($e->getMessage() ?: 'Could not submit reservation.', 409);
}

respond(['ok' => true, 'reservation' => fetch_reservation($pdo, $reservationId)]);
