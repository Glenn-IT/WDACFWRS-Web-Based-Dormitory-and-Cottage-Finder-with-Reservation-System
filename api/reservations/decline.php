<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

require_role('admin');
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
if ($row['approval_status'] !== 'Pending') {
    fail('Only pending reservations can be declined.');
}

$pdo->beginTransaction();
try {
    $pdo->prepare('UPDATE reservations SET approval_status = \'Declined\' WHERE id = ?')->execute([$id]);

    if ($row['type'] === 'Dormitory' && $row['dorm_id']) {
        $pdo->prepare('UPDATE dormitories SET status = \'Available\' WHERE id = ?')->execute([$row['dorm_id']]);
    } elseif ($row['cottage_id']) {
        $pdo->prepare('UPDATE cottages SET availability = \'Available\' WHERE id = ?')->execute([$row['cottage_id']]);
    }

    $pdo->prepare('INSERT INTO notifications (student_id, message) VALUES (?, ?)')
        ->execute([$row['student_id'], "Your reservation #$id has been declined."]);

    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    fail('Could not decline reservation.', 500);
}

respond(['ok' => true, 'reservation' => fetch_reservation($pdo, $id)]);
