<?php
declare(strict_types=1);

function map_payment(array $p): array {
    $isDorm = ($p['res_type'] ?? '') === 'Dormitory';
    $isCottage = ($p['res_type'] ?? '') === 'Cottage';
    $isKubotel = ($p['res_type'] ?? '') === 'Kubotel';

    $assetLabel = $isDorm ? ($p['dorm_room'] ?? '') : ($isCottage ? ($p['cottage_name'] ?? '') : ($p['kubotel_name'] ?? ''));
    $assetImage = ($isDorm ? ($p['dorm_image'] ?? '') : ($isCottage ? ($p['cottage_image'] ?? '') : ($p['kubotel_image'] ?? ''))) ?: '';

    return [
        'id' => (int)$p['id'],
        'reservationId' => (int)$p['reservation_id'],
        'studentId' => (int)($p['student_id'] ?? 0),
        'studentName' => trim(($p['first_name'] ?? '') . ' ' . ($p['last_name'] ?? '')),
        'studentEmail' => $p['email'] ?? '',
        'studentPhone' => $p['phone'] ?? '',
        'assetType' => $p['res_type'] ?? '',
        'assetLabel' => $assetLabel,
        'assetImage' => $assetImage,
        'method' => $p['method'],
        'amount' => (float)$p['amount'],
        'status' => $p['status'],
        'date' => $p['date'],
        'referenceNumber' => $p['reference_number'] ?? '',
        'receiptImage' => $p['receipt_image'] ?: '',
        'refundStatus' => $p['refund_status'] ?? 'None',
        'refundReason' => $p['refund_reason'] ?? '',
        'refundMethod' => $p['refund_method'] ?? '',
        'refundAccountName' => $p['refund_account_name'] ?? '',
        'refundAccountNumber' => $p['refund_account_number'] ?? '',
        'refundRequestDate' => $p['refund_request_date'] ?? '',
        'refundProcessedDate' => $p['refund_processed_date'] ?? '',
        'refundReferenceNumber' => $p['refund_reference_number'] ?? '',
        'refundReceiptImage' => $p['refund_receipt_image'] ?: '',
        'refundAdminNotes' => $p['refund_admin_notes'] ?? '',
    ];
}
