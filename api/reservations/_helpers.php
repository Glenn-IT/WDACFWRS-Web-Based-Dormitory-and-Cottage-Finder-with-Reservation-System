<?php
declare(strict_types=1);

const RESERVATION_SELECT = '
  r.id, r.type, r.dorm_id, r.cottage_id, r.payment_method, r.amount, r.reservation_date,
  r.payment_status, r.approval_status, r.created_at,
  r.student_id, s.first_name, s.last_name,
  d.room_no, d.gender AS dorm_gender, d.capacity AS dorm_capacity, d.image_path AS dorm_image,
  c.name AS cottage_name, c.owner AS cottage_owner, c.rooms AS cottage_rooms, c.image_path AS cottage_image,
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
  LEFT JOIN reservation_parent_info pi ON pi.reservation_id = r.id
  LEFT JOIN reservation_backgrounds bg ON bg.reservation_id = r.id
';

function map_reservation(array $r): array {
    $isDorm = $r['type'] === 'Dormitory';
    return [
        'id' => (int)$r['id'],
        'studentId' => (int)$r['student_id'],
        'studentName' => trim($r['first_name'] . ' ' . $r['last_name']),
        'type' => $r['type'],
        'assetId' => $isDorm ? (int)$r['dorm_id'] : (int)$r['cottage_id'],
        'assetLabel' => $isDorm ? ('Room ' . $r['room_no']) : $r['cottage_name'],
        'image' => ($isDorm ? $r['dorm_image'] : $r['cottage_image']) ?: '',
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
