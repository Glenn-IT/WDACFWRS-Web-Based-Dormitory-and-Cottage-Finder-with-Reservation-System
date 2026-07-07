<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

$session = current_session();
if (!$session) {
    fail('Not authenticated.', 401);
}

$pdo = get_db();
$where = [];
$params = [];

if ($session['role'] === 'admin') {
    if (!empty($_GET['type'])) {
        $where[] = 'r.type = ?';
        $params[] = $_GET['type'];
    }
    if (!empty($_GET['approvalStatus'])) {
        $where[] = 'r.approval_status = ?';
        $params[] = $_GET['approvalStatus'];
    }
    if (!empty($_GET['paymentStatus'])) {
        $where[] = 'r.payment_status = ?';
        $params[] = $_GET['paymentStatus'];
    }
    if (!empty($_GET['search'])) {
        $where[] = "CONCAT(s.first_name, ' ', s.last_name) LIKE ?";
        $params[] = '%' . $_GET['search'] . '%';
    }
} else {
    $where[] = 'r.student_id = ?';
    $params[] = $session['id'];
}

$sql = 'SELECT ' . RESERVATION_SELECT . RESERVATION_JOINS;
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= ' ORDER BY r.reservation_date DESC, r.id DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

respond(['ok' => true, 'reservations' => array_map('map_reservation', $rows)]);
