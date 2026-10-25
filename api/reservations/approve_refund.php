<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';
require_once __DIR__ . '/../_uploads.php';

require_role('admin');
require_post();

$in = json_input();
if (empty($in)) {
    $in = $_POST;
}

$id = (int)($in['id'] ?? 0);
$refNumber = trim((string)($in['refundReferenceNumber'] ?? $in['referenceNumber'] ?? ''));
$adminNotes = trim((string)($in['refundAdminNotes'] ?? $in['adminNotes'] ?? ''));

if (!$id) {
    fail('Missing reservation ID.');
}

$refundReceipt = null;
if (isset($_FILES['refundReceipt'])) {
    $refundReceipt = save_uploaded_image($_FILES['refundReceipt'], 'refunds');
} elseif (isset($_FILES['refund_receipt'])) {
    $refundReceipt = save_uploaded_image($_FILES['refund_receipt'], 'refunds');
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

    // Update reservation
    $updRes = $pdo->prepare('UPDATE reservations SET 
        approval_status = \'Cancelled\',
        payment_status = \'Refunded\',
        refund_status = \'Approved\',
        refund_processed_date = ?,
        refund_reference_number = ?,
        refund_receipt_image = COALESCE(?, refund_receipt_image),
        refund_admin_notes = ?
        WHERE id = ?');
    $updRes->execute([$now, $refNumber, $refundReceipt, $adminNotes, $id]);

    // Update payment
    $updPay = $pdo->prepare('UPDATE payments SET 
        status = \'Refunded\',
        refund_status = \'Approved\',
        refund_processed_date = ?,
        refund_reference_number = ?,
        refund_receipt_image = COALESCE(?, refund_receipt_image),
        refund_admin_notes = ?
        WHERE reservation_id = ?');
    $updPay->execute([$now, $refNumber, $refundReceipt, $adminNotes, $id]);

    // Release accommodation unit so others can book
    if ($res['type'] === 'Dormitory' && $res['dorm_id']) {
        $pdo->prepare("UPDATE dormitories SET status = 'Available' WHERE id = ?")->execute([$res['dorm_id']]);
    } elseif ($res['type'] === 'Cottage' && $res['cottage_id']) {
        $pdo->prepare("UPDATE cottages SET availability = 'Available' WHERE id = ?")->execute([$res['cottage_id']]);
    } elseif ($res['type'] === 'Kubotel' && !empty($res['kubotel_id'])) {
        $pdo->prepare("UPDATE kubotels SET availability = 'Available' WHERE id = ?")->execute([$res['kubotel_id']]);
    }

    // Student notification
    $amountStr = number_format((float)$res['amount'], 2);
    $dest = trim($res['refund_method'] . ' ' . $res['refund_account_number']);
    $msg = "Your refund of ₱{$amountStr} for reservation #{$id} has been APPROVED and sent to your {$dest}.";
    if ($refNumber !== '') {
        $msg .= " Transfer Ref #: {$refNumber}.";
    }
    if ($adminNotes !== '') {
        $msg .= " Admin note: {$adminNotes}";
    }

    $stmtNotif = $pdo->prepare('INSERT INTO notifications (student_id, message) VALUES (?, ?)');
    $stmtNotif->execute([(int)$res['student_id'], $msg]);

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fail($e->getMessage() ?: 'Failed to approve refund.', 500);
}

respond(['ok' => true, 'reservation' => fetch_reservation($pdo, $id), 'message' => 'Refund approved and funds marked as resent.']);
