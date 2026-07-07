<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../reservations/_helpers.php';
require_once __DIR__ . '/../dorms/_helpers.php';
require_once __DIR__ . '/../cottages/_helpers.php';

require_role('admin');

$type = $_GET['type'] ?? 'reservations';
$from = $_GET['from'] ?? '';
$to = $_GET['to'] ?? '';
$resType = $_GET['resType'] ?? '';
$status = $_GET['status'] ?? '';

$pdo = get_db();

if ($type === 'dorm-occupancy') {
    $rows = array_map('map_dorm', $pdo->query('SELECT * FROM dormitories ORDER BY room_no')->fetchAll());
    $available = count(array_filter($rows, fn($d) => $d['status'] === 'Available'));
    respond([
        'ok' => true,
        'type' => $type,
        'rows' => $rows,
        'total' => count($rows),
        'available' => $available,
        'occupiedOrFull' => count($rows) - $available,
    ]);
}

if ($type === 'cottage-occupancy') {
    $rows = array_map('map_cottage', $pdo->query('SELECT * FROM cottages ORDER BY name')->fetchAll());
    $available = count(array_filter($rows, fn($c) => $c['availability'] === 'Available'));
    respond([
        'ok' => true,
        'type' => $type,
        'rows' => $rows,
        'total' => count($rows),
        'available' => $available,
        'booked' => count($rows) - $available,
    ]);
}

if ($type === 'revenue') {
    $where = [];
    $params = [];
    if ($from) { $where[] = 'date >= ?'; $params[] = $from; }
    if ($to) { $where[] = 'date <= ?'; $params[] = $to; }
    $sql = 'SELECT * FROM payments';
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY date DESC, id DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $payments = $stmt->fetchAll();

    $rows = array_map(function (array $p): array {
        return [
            'id' => (int)$p['id'],
            'reservationId' => (int)$p['reservation_id'],
            'method' => $p['method'],
            'amount' => (float)$p['amount'],
            'date' => $p['date'],
            'status' => $p['status'],
        ];
    }, $payments);

    $total = array_sum(array_map(fn($p) => $p['status'] === 'Paid' ? $p['amount'] : 0, $rows));
    $pending = array_sum(array_map(fn($p) => $p['status'] === 'Pending' ? $p['amount'] : 0, $rows));

    respond(['ok' => true, 'type' => $type, 'rows' => $rows, 'total' => $total, 'pending' => $pending, 'transactions' => count($rows)]);
}

if ($type === 'registrations') {
    $where = [];
    $params = [];
    if ($from) { $where[] = 'date_registered >= ?'; $params[] = $from; }
    if ($to) { $where[] = 'date_registered <= ?'; $params[] = $to . ' 23:59:59'; }
    $sql = 'SELECT * FROM students';
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY date_registered DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $rows = array_map(function (array $u): array {
        return [
            'firstName' => $u['first_name'],
            'lastName' => $u['last_name'],
            'email' => $u['email'],
            'course' => $u['course'],
            'dateRegistered' => substr($u['date_registered'], 0, 10),
            'status' => $u['status'],
        ];
    }, $stmt->fetchAll());

    respond(['ok' => true, 'type' => $type, 'rows' => $rows, 'total' => count($rows)]);
}

// default: reservations
$where = [];
$params = [];
if ($from) { $where[] = 'r.reservation_date >= ?'; $params[] = $from; }
if ($to) { $where[] = 'r.reservation_date <= ?'; $params[] = $to; }
if ($resType) { $where[] = 'r.type = ?'; $params[] = $resType; }
if ($status) { $where[] = 'r.approval_status = ?'; $params[] = $status; }

$sql = 'SELECT ' . RESERVATION_SELECT . RESERVATION_JOINS;
if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
$sql .= ' ORDER BY r.reservation_date DESC, r.id DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = array_map('map_reservation', $stmt->fetchAll());

respond(['ok' => true, 'type' => 'reservations', 'rows' => $rows, 'total' => count($rows)]);
