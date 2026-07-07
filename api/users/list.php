<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

require_role('admin');
$pdo = get_db();

$where = [];
$params = [];

if (!empty($_GET['search'])) {
    $where[] = "(CONCAT(first_name, ' ', last_name) LIKE ? OR email LIKE ?)";
    $params[] = '%' . $_GET['search'] . '%';
    $params[] = '%' . $_GET['search'] . '%';
}
if (!empty($_GET['status'])) {
    $where[] = 'status = ?';
    $params[] = $_GET['status'];
}

$sortMap = [
    'dateRegistered' => 'date_registered DESC',
    'course' => 'course ASC',
    'name' => 'first_name ASC, last_name ASC',
];
$sort = $sortMap[$_GET['sortBy'] ?? ''] ?? $sortMap['name'];

$sql = 'SELECT * FROM students';
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= ' ORDER BY ' . $sort;

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

respond(['ok' => true, 'users' => array_map('map_student', $rows)]);
