<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

$session = require_role('student');
$studentId = (int)$session['id'];

require_post();
$in = json_input();
$id = (int)($in['id'] ?? 0);
$reason = trim((string)($in['reason'] ?? ''));
$refundMethod = trim((string)($in['refundMethod'] ?? 'GCash'));
$accountName = trim((string)($in['refundAccountName'] ?? ''));
$accountNumber = trim((string)($in['refundAccountNumber'] ?? ''));

if (!$id) {
    fail('Missing reservation ID.');
}
if ($reason === '') {
    fail('Please provide a reason for your cancellation and refund request.');
}
if ($accountName === '' || $accountNumber === '') {
    fail('Please provide your complete payout account name and account/mobile number so the administrator can send your refund.');
}

$pdo = get_db();
$stmt = $pdo->prepare('SELECT id, student_id, type, dorm_id, cottage_id, kubotel_id, amount, payment_status, approval_status, refund_status FROM reservations WHERE id = ?');
$stmt->execute([$id]);
$res = $stmt->fetch();

if (!$res) {
    fail('Reservation not found.', 404);
}
if ((int)$res['student_id'] !== $studentId) {
    fail('Forbidden.', 403);
}

if ($res['payment_status'] !== 'Paid' && $res['payment_status'] !== 'Refund Requested') {
    fail('Refund requests can only be submitted for reservations with verified/paid transactions.');
}

if ($res['refund_status'] === 'Pending') {
    fail('A refund request for this reservation is already pending administrator review.');
}
if ($res['refund_status'] === 'Approved') {
    fail('This reservation has already been refunded.');
}

$pdo->beginTransaction();
try {
    $now = date('Y-m-d H:i:s');

    // Update reservation
    $updRes = $pdo->prepare('UPDATE reservations SET 
        payment_status = \'Refund Requested\',
        refund_status = \'Pending\',
        refund_reason = ?,
        refund_method = ?,
        refund_account_name = ?,
        refund_account_number = ?,
        refund_request_date = ?
        WHERE id = ?');
    $updRes->execute([$reason, $refundMethod, $accountName, $accountNumber, $now, $id]);

    // Update matching payment record
    $updPay = $pdo->prepare('UPDATE payments SET 
        status = \'Refund Requested\',
        refund_status = \'Pending\',
        refund_reason = ?,
        refund_method = ?,
        refund_account_name = ?,
        refund_account_number = ?,
        refund_request_date = ?
        WHERE reservation_id = ?');
    $updPay->execute([$reason, $refundMethod, $accountName, $accountNumber, $now, $id]);

    // Student notification
    $msg = "Your refund request for reservation #$id (₱" . number_format((float)$res['amount'], 2) . ") has been submitted. The admin will verify and resend the funds to your $refundMethod account.";
    $stmtNotif = $pdo->prepare('INSERT INTO notifications (student_id, message) VALUES (?, ?)');
    $stmtNotif->execute([$studentId, $msg]);

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fail('Failed to submit refund request: ' . $e->getMessage(), 500);
}

respond(['ok' => true, 'reservation' => fetch_reservation($pdo, $id), 'message' => 'Refund request submitted successfully.']);
