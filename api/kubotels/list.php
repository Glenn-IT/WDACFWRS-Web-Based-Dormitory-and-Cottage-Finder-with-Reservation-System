<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';
require_once __DIR__ . '/../reservations/_helpers.php';

$session = current_session();
session_write_close();
// Note: Guest access is permitted for browsing kubotels.

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

$sql = 'SELECT * FROM kubotels';
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= ' ORDER BY name ASC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

$reservedIds = ($session && ($session['role'] ?? '') === 'student')
    ? student_reserved_ids($pdo, (int)$session['id'], 'Kubotel')
    : [];

respond(['ok' => true, 'kubotels' => array_map(
    fn($r) => map_kubotel($r, in_array((int)$r['id'], $reservedIds, true)),
    $rows
)]);
