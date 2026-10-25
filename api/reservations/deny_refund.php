<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

require_role('admin');
require_post();

$in = json_input();
$id = (int)($in['id'] ?? 0);
$reason = trim((string)($in['reason'] ?? $in['adminNotes'] ?? ''));

if (!$id) {
    fail('Missing reservation ID.');
}
if ($reason === '') {
    fail('Please provide a reason for denying the refund request.');
}

$pdo = get_db();
$pdo->beginTransaction();

try {
    $stmt = $pdo->prepare('SELECT * FROM reservations WHERE id = ? FOR UPDATE');
    $stmt->execute([$id]);
    $res = $stmt->fetch();

    if (!$res) {
        throw new RuntimeException('Reservation not found.');
    }

    if ($res['refund_status'] !== 'Pending') {
        throw new RuntimeException('This reservation does not have a pending refund request.');
    }

    $now = date('Y-m-d H:i:s');

    // Update reservation: revert payment_status to Paid, set refund_status to Denied
    $updRes = $pdo->prepare('UPDATE reservations SET 
        payment_status = \'Paid\',
        refund_status = \'Denied\',
        refund_processed_date = ?,
        refund_admin_notes = ?
        WHERE id = ?');
    $updRes->execute([$now, $reason, $id]);

    // Update payment
    $updPay = $pdo->prepare('UPDATE payments SET 
        status = \'Paid\',
        refund_status = \'Denied\',
        refund_processed_date = ?,
        refund_admin_notes = ?
        WHERE reservation_id = ?');
    $updPay->execute([$now, $reason, $id]);

    // Notify student
    $msg = "Your refund request for reservation #{$id} has been DENIED by the administrator. Reason: {$reason}";
    $stmtNotif = $pdo->prepare('INSERT INTO notifications (student_id, message) VALUES (?, ?)');
    $stmtNotif->execute([(int)$res['student_id'], $msg]);

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fail($e->getMessage() ?: 'Failed to deny refund.', 500);
}

respond(['ok' => true, 'reservation' => fetch_reservation($pdo, $id), 'message' => 'Refund request denied.']);
