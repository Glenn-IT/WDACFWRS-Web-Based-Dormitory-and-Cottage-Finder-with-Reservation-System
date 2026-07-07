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

if (!empty($_GET['availability'])) {
    $where[] = 'availability = ?';
    $params[] = $_GET['availability'];
}
if (!empty($_GET['search'])) {
    $where[] = '(name LIKE ? OR owner LIKE ?)';
    $params[] = '%' . $_GET['search'] . '%';
    $params[] = '%' . $_GET['search'] . '%';
}

$sql = 'SELECT * FROM cottages';
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= ' ORDER BY name ASC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

respond(['ok' => true, 'cottages' => array_map('map_cottage', $rows)]);
