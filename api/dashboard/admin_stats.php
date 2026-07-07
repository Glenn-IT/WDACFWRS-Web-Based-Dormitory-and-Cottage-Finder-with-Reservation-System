<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

require_role('admin');
$pdo = get_db();

$totalUsers = (int)$pdo->query('SELECT COUNT(*) FROM students')->fetchColumn();
$totalDorms = (int)$pdo->query('SELECT COUNT(*) FROM dormitories')->fetchColumn();
$totalCottages = (int)$pdo->query('SELECT COUNT(*) FROM cottages')->fetchColumn();

$statusCounts = ['Pending' => 0, 'Approved' => 0, 'Declined' => 0, 'Cancelled' => 0];
foreach ($pdo->query('SELECT approval_status, COUNT(*) c FROM reservations GROUP BY approval_status') as $row) {
    $statusCounts[$row['approval_status']] = (int)$row['c'];
}

$dormStatusCounts = ['Available' => 0, 'Occupied' => 0, 'Full' => 0];
foreach ($pdo->query('SELECT status, COUNT(*) c FROM dormitories GROUP BY status') as $row) {
    $dormStatusCounts[$row['status']] = (int)$row['c'];
}

$cottageStatusCounts = ['Available' => 0, 'Booked' => 0];
foreach ($pdo->query('SELECT availability, COUNT(*) c FROM cottages GROUP BY availability') as $row) {
    $cottageStatusCounts[$row['availability']] = (int)$row['c'];
}

$revenue = (float)$pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'Paid'")->fetchColumn();

$monthly = [];
for ($i = 5; $i >= 0; $i--) {
    $ts = strtotime("first day of -$i months");
    $ym = date('Y-m', $ts);
    $label = date('M y', $ts);
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM reservations WHERE DATE_FORMAT(reservation_date, '%Y-%m') = ?");
    $stmt->execute([$ym]);
    $monthly[] = ['label' => $label, 'count' => (int)$stmt->fetchColumn()];
}

respond([
    'ok' => true,
    'totalUsers' => $totalUsers,
    'totalDorms' => $totalDorms,
    'totalCottages' => $totalCottages,
    'pendingReservations' => $statusCounts['Pending'],
    'approvedReservations' => $statusCounts['Approved'],
    'availableRooms' => $dormStatusCounts['Available'],
    'occupiedRooms' => $dormStatusCounts['Occupied'] + $dormStatusCounts['Full'],
    'revenue' => $revenue,
    'statusCounts' => $statusCounts,
    'dormStatusCounts' => $dormStatusCounts,
    'cottageStatusCounts' => $cottageStatusCounts,
    'monthly' => $monthly,
]);
