<?php
declare(strict_types=1);

const RESERVATION_SELECT = '
  r.id, r.type, r.dorm_id, r.cottage_id, r.kubotel_id, r.payment_method, r.amount, r.reservation_date,
  r.payment_status, r.approval_status, r.reference_number, r.receipt_image, r.created_at,
  r.student_id, s.first_name, s.last_name,
  d.room_no, d.gender AS dorm_gender, d.capacity AS dorm_capacity, d.image_path AS dorm_image,
  d.owner_name AS dorm_owner, d.owner_phone AS dorm_owner_phone, d.payment_qr AS dorm_payment_qr,
  d.payment_account_name AS dorm_payment_account_name, d.payment_account_number AS dorm_payment_account_number,
  c.name AS cottage_name, c.owner AS cottage_owner, c.owner_photo AS cottage_owner_photo,
  c.owner_phone AS cottage_owner_phone, c.owner_email AS cottage_owner_email, c.owner_bio AS cottage_owner_bio,
  c.rooms AS cottage_rooms, c.image_path AS cottage_image, c.payment_qr AS cottage_payment_qr,
  c.payment_account_name AS cottage_payment_account_name, c.payment_account_number AS cottage_payment_account_number,
  k.name AS kubotel_name, k.owner AS kubotel_owner, k.owner_photo AS kubotel_owner_photo,
  k.owner_phone AS kubotel_owner_phone, k.owner_email AS kubotel_owner_email, k.owner_bio AS kubotel_owner_bio,
  k.rooms AS kubotel_rooms, k.image_path AS kubotel_image, k.payment_qr AS kubotel_payment_qr,
  k.payment_account_name AS kubotel_payment_account_name, k.payment_account_number AS kubotel_payment_account_number,
  pi.father_name, pi.mother_name, pi.occupation, pi.education, pi.address AS pi_address, pi.phone AS pi_phone,
  pi.emergency_contact, pi.relationship AS pi_relationship, pi.emergency_number,
  bg.appliances, bg.friends_at_dorm, bg.friends_relationship, bg.reason, bg.medical_conditions,
  bg.severe_illness, bg.hobbies, bg.smoking, bg.drinking, bg.organizations, bg.leisure
';

const RESERVATION_JOINS = '
  FROM reservations r
  JOIN students s ON s.id = r.student_id
  LEFT JOIN dormitories d ON d.id = r.dorm_id
  LEFT JOIN cottages c ON c.id = r.cottage_id
  LEFT JOIN kubotels k ON k.id = r.kubotel_id
  LEFT JOIN reservation_parent_info pi ON pi.reservation_id = r.id
  LEFT JOIN reservation_backgrounds bg ON bg.reservation_id = r.id
';

function map_reservation(array $r): array {
    $isDorm = $r['type'] === 'Dormitory';
    $isCottage = $r['type'] === 'Cottage';
    $isKubotel = $r['type'] === 'Kubotel';

    $assetId = $isDorm ? (int)$r['dorm_id'] : ($isCottage ? (int)$r['cottage_id'] : (int)($r['kubotel_id'] ?? 0));
    $assetLabel = $isDorm ? ($r['room_no'] ?? '') : ($isCottage ? ($r['cottage_name'] ?? '') : ($r['kubotel_name'] ?? ''));
    $assetOwner = $isDorm ? ($r['dorm_owner'] ?? '') : ($isCottage ? ($r['cottage_owner'] ?? '') : ($r['kubotel_owner'] ?? ''));
    $assetOwnerPhoto = $isDorm ? '' : ($isCottage ? ($r['cottage_owner_photo'] ?? '') : ($r['kubotel_owner_photo'] ?? ''));
    $assetOwnerPhone = $isDorm ? ($r['dorm_owner_phone'] ?? '') : ($isCottage ? ($r['cottage_owner_phone'] ?? '') : ($r['kubotel_owner_phone'] ?? ''));
    $assetOwnerEmail = $isDorm ? '' : ($isCottage ? ($r['cottage_owner_email'] ?? '') : ($r['kubotel_owner_email'] ?? ''));

    $paymentQr = ($isDorm ? ($r['dorm_payment_qr'] ?? '') : ($isCottage ? ($r['cottage_payment_qr'] ?? '') : ($r['kubotel_payment_qr'] ?? ''))) ?: '';
    $paymentAccountName = $isDorm ? ($r['dorm_payment_account_name'] ?? '') : ($isCottage ? ($r['cottage_payment_account_name'] ?? '') : ($r['kubotel_payment_account_name'] ?? ''));
    $paymentAccountNumber = $isDorm ? ($r['dorm_payment_account_number'] ?? '') : ($isCottage ? ($r['cottage_payment_account_number'] ?? '') : ($r['kubotel_payment_account_number'] ?? ''));
    $image = ($isDorm ? $r['dorm_image'] : ($isCottage ? $r['cottage_image'] : ($r['kubotel_image'] ?? ''))) ?: '';

    return [
        'id' => (int)$r['id'],
        'studentId' => (int)$r['student_id'],
        'studentName' => trim($r['first_name'] . ' ' . $r['last_name']),
        'type' => $r['type'],
        'assetId' => $assetId,
        'assetLabel' => $assetLabel,
        'assetOwner' => $assetOwner,
        'assetOwnerPhoto' => $assetOwnerPhoto,
        'assetOwnerPhone' => $assetOwnerPhone,
        'assetOwnerEmail' => $assetOwnerEmail,
        'paymentQr' => $paymentQr,
        'paymentAccountName' => $paymentAccountName,
        'paymentAccountNumber' => $paymentAccountNumber,
        'referenceNumber' => $r['reference_number'] ?? '',
        'receiptImage' => $r['receipt_image'] ?: '',
        'image' => $image,
        'paymentMethod' => $r['payment_method'],
        'amount' => (float)$r['amount'],
        'reservationDate' => $r['reservation_date'],
        'paymentStatus' => $r['payment_status'],
        'approvalStatus' => $r['approval_status'],
        'parentInfo' => [
            'fatherName' => $r['father_name'] ?? '',
            'motherName' => $r['mother_name'] ?? '',
            'occupation' => $r['occupation'] ?? '',
            'education' => $r['education'] ?? '',
            'address' => $r['pi_address'] ?? '',
            'phone' => $r['pi_phone'] ?? '',
            'emergencyContact' => $r['emergency_contact'] ?? '',
            'relationship' => $r['pi_relationship'] ?? '',
            'emergencyNumber' => $r['emergency_number'] ?? '',
        ],
        'studentBackground' => [
            'appliances' => $r['appliances'] ?? '',
            'friendsAtDorm' => $r['friends_at_dorm'] ?? '',
            'relationship' => $r['friends_relationship'] ?? '',
            'reason' => $r['reason'] ?? '',
            'medicalConditions' => $r['medical_conditions'] ?? '',
            'severeIllness' => $r['severe_illness'] ?? '',
            'hobbies' => $r['hobbies'] ?? '',
            'smoking' => $r['smoking'] ?? '',
            'drinking' => $r['drinking'] ?? '',
            'organizations' => $r['organizations'] ?? '',
            'leisure' => $r['leisure'] ?? '',
        ],
    ];
}

function fetch_reservation(PDO $pdo, int $id): ?array {
    $stmt = $pdo->prepare('SELECT ' . RESERVATION_SELECT . RESERVATION_JOINS . ' WHERE r.id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ? map_reservation($row) : null;
}

/** Dorm/cottage/kubotel ids the given student currently has a live (Pending/Approved) reservation on. */
function student_reserved_ids(PDO $pdo, int $studentId, string $type): array {
    $col = $type === 'Dormitory' ? 'dorm_id' : ($type === 'Cottage' ? 'cottage_id' : 'kubotel_id');
    $stmt = $pdo->prepare(
        "SELECT $col FROM reservations WHERE student_id = ? AND type = ? AND approval_status IN ('Pending','Approved')"
    );
    $stmt->execute([$studentId, $type]);
    return array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
}
