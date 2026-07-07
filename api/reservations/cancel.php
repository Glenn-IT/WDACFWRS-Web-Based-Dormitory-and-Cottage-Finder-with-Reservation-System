<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

$session = require_role('student');
require_post();
$in = json_input();
$id = (int)($in['id'] ?? 0);
if (!$id) {
    fail('Missing reservation id.');
}

$pdo = get_db();
$stmt = $pdo->prepare('SELECT student_id, type, dorm_id, cottage_id, approval_status FROM reservations WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();

if (!$row) {
    fail('Reservation not found.', 404);
}
if ($row['student_id'] !== (int)$session['id']) {
    fail('Forbidden.', 403);
}
if (!in_array($row['approval_status'], ['Pending', 'Approved'], true)) {
    fail('Only pending or approved reservations can be cancelled.');
}

$pdo->beginTransaction();
try {
    $pdo->prepare('UPDATE reservations SET approval_status = \'Cancelled\' WHERE id = ?')->execute([$id]);

    if ($row['type'] === 'Dormitory' && $row['dorm_id']) {
        $pdo->prepare('UPDATE dormitories SET status = \'Available\' WHERE id = ?')->execute([$row['dorm_id']]);
    } elseif ($row['cottage_id']) {
        $pdo->prepare('UPDATE cottages SET availability = \'Available\' WHERE id = ?')->execute([$row['cottage_id']]);
    }

    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    fail('Could not cancel reservation.', 500);
}

respond(['ok' => true, 'reservation' => fetch_reservation($pdo, $id)]);
