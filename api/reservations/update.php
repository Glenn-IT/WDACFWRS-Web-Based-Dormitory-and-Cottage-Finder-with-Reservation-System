<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

require_role('admin');
require_post();
$in = json_input();

$id = (int)($in['id'] ?? 0);
if (!$id) {
    fail('Missing reservation ID.');
}

$pdo = get_db();
$pdo->beginTransaction();

try {
    // Lock current reservation
    $stmt = $pdo->prepare('SELECT * FROM reservations WHERE id = ? FOR UPDATE');
    $stmt->execute([$id]);
    $res = $stmt->fetch();
    if (!$res) {
        throw new RuntimeException('Reservation not found.');
    }

    $oldApproval = $res['approval_status'];
    $newApproval = trim((string)($in['approvalStatus'] ?? $res['approval_status']));
    $allowedApprovals = ['Pending', 'Approved', 'Declined', 'Cancelled'];
    if (!in_array($newApproval, $allowedApprovals, true)) {
        fail('Invalid approval status.');
    }

    $newPaymentStatus = trim((string)($in['paymentStatus'] ?? $res['payment_status']));
    $allowedPaymentStatuses = ['Pending', 'Paid'];
    if (!in_array($newPaymentStatus, $allowedPaymentStatuses, true)) {
        fail('Invalid payment status.');
    }

    $reservationDate = trim((string)($in['reservationDate'] ?? $res['reservation_date']));
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $reservationDate)) {
        fail('Invalid reservation date format (expected YYYY-MM-DD).');
    }

    $amount = isset($in['amount']) ? (float)$in['amount'] : (float)$res['amount'];
    if ($amount < 0) {
        fail('Amount cannot be negative.');
    }

    $paymentMethod = trim((string)($in['paymentMethod'] ?? $res['payment_method']));
    if ($paymentMethod === '') {
        fail('Payment method cannot be empty.');
    }

    // Update reservation record
    $upd = $pdo->prepare('UPDATE reservations SET 
        reservation_date = ?, 
        amount = ?, 
        payment_method = ?, 
        payment_status = ?, 
        approval_status = ? 
        WHERE id = ?');
    $upd->execute([$reservationDate, $amount, $paymentMethod, $newPaymentStatus, $newApproval, $id]);

    // Update or insert matching payment record
    $updPay = $pdo->prepare('UPDATE payments SET 
        amount = ?, 
        method = ?, 
        status = ? 
        WHERE reservation_id = ?');
    $updPay->execute([$amount, $paymentMethod, $newPaymentStatus, $id]);

    // Asset status synchronization if approval status transitioned
    if ($newApproval !== $oldApproval) {
        if ($res['type'] === 'Dormitory' && $res['dorm_id']) {
            if ($newApproval === 'Approved') {
                $pdo->prepare("UPDATE dormitories SET status = 'Occupied' WHERE id = ?")->execute([$res['dorm_id']]);
            } elseif (in_array($newApproval, ['Declined', 'Cancelled'], true)) {
                $pdo->prepare("UPDATE dormitories SET status = 'Available' WHERE id = ?")->execute([$res['dorm_id']]);
            }
        } elseif ($res['type'] === 'Cottage' && $res['cottage_id']) {
            if ($newApproval === 'Approved') {
                $pdo->prepare("UPDATE cottages SET availability = 'Booked' WHERE id = ?")->execute([$res['cottage_id']]);
            } elseif (in_array($newApproval, ['Declined', 'Cancelled'], true)) {
                $pdo->prepare("UPDATE cottages SET availability = 'Available' WHERE id = ?")->execute([$res['cottage_id']]);
            }
        }

        // Notify student of the status change
        $notifMsg = "Your reservation #$id has been updated by the administrator to '$newApproval'.";
        $pdo->prepare('INSERT INTO notifications (student_id, message) VALUES (?, ?)')->execute([$res['student_id'], $notifMsg]);
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fail($e->getMessage() ?: 'Failed to update reservation.', 500);
}

respond(['ok' => true, 'reservation' => fetch_reservation($pdo, $id)]);
