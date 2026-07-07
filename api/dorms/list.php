<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

if (!current_session()) {
    fail('Not authenticated.', 401);
}

$pdo = get_db();

$where = [];
$params = [];

if (!empty($_GET['gender'])) {
    $where[] = 'gender = ?';
    $params[] = $_GET['gender'];
}
if (!empty($_GET['status'])) {
    $where[] = 'status = ?';
    $params[] = $_GET['status'];
}
if (!empty($_GET['search'])) {
    $where[] = 'room_no LIKE ?';
    $params[] = '%' . $_GET['search'] . '%';
}

$sql = 'SELECT * FROM dormitories';
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= ' ORDER BY room_no ASC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

respond(['ok' => true, 'dorms' => array_map('map_dorm', $rows)]);
