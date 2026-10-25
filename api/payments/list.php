<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

require_role('admin');

$pdo = get_db();

$where = [];
$params = [];

$status = trim((string)($_GET['status'] ?? ''));
if ($status !== '' && $status !== 'All') {
    $where[] = 'p.status = ?';
    $params[] = $status;
}

$refundStatus = trim((string)($_GET['refundStatus'] ?? ''));
if ($refundStatus !== '' && $refundStatus !== 'All') {
    $where[] = 'p.refund_status = ?';
    $params[] = $refundStatus;
}

$method = trim((string)($_GET['method'] ?? ''));
if ($method !== '' && $method !== 'All') {
    $where[] = 'p.method = ?';
    $params[] = $method;
}

$from = trim((string)($_GET['from'] ?? ''));
if ($from !== '') {
    $where[] = 'p.date >= ?';
    $params[] = $from;
}

$to = trim((string)($_GET['to'] ?? ''));
if ($to !== '') {
    $where[] = 'p.date <= ?';
    $params[] = $to;
}

$search = trim((string)($_GET['search'] ?? ''));
if ($search !== '') {
    $where[] = '(CONCAT(s.first_name, " ", s.last_name) LIKE ? OR p.reference_number LIKE ? OR p.refund_reference_number LIKE ? OR CAST(p.reservation_id AS CHAR) LIKE ? OR CAST(p.id AS CHAR) LIKE ?)';
    $like = '%' . $search . '%';
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
}

$sql = '
    SELECT 
        p.*,
        r.type AS res_type,
        s.id AS student_id,
        s.first_name,
        s.last_name,
        s.email,
        s.phone,
        d.room_no AS dorm_room,
        d.image_path AS dorm_image,
        c.name AS cottage_name,
        c.image_path AS cottage_image,
        k.name AS kubotel_name,
        k.image_path AS kubotel_image
    FROM payments p
    JOIN reservations r ON r.id = p.reservation_id
    JOIN students s ON s.id = r.student_id
    LEFT JOIN dormitories d ON d.id = r.dorm_id
    LEFT JOIN cottages c ON c.id = r.cottage_id
    LEFT JOIN kubotels k ON k.id = r.kubotel_id
';

if (!empty($where)) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= ' ORDER BY p.id DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();
$payments = array_map('map_payment', $rows);

// Summary statistics
$statCollected = (float)$pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'Paid'")->fetchColumn();
$statPending = (float)$pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'Pending'")->fetchColumn();
$statRefunded = (float)$pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'Refunded'")->fetchColumn();
$statRefundRequests = (int)$pdo->query("SELECT COUNT(*) FROM payments WHERE refund_status = 'Pending'")->fetchColumn();
$statTotalTransactions = (int)$pdo->query("SELECT COUNT(*) FROM payments")->fetchColumn();

respond([
    'ok' => true,
    'payments' => $payments,
    'stats' => [
        'totalTransactions' => $statTotalTransactions,
        'totalCollected' => $statCollected,
        'totalPending' => $statPending,
        'totalRefunded' => $statRefunded,
        'pendingRefundCount' => $statRefundRequests,
    ]
]);
