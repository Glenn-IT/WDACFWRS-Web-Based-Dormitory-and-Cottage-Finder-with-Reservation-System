<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';
require_once __DIR__ . '/../reservations/_helpers.php';

$session = current_session();
session_write_close();
// Note: Guest access is permitted for viewing kubotel details.

$id = (int)($_GET['id'] ?? 0);
if (!$id) {
    fail('Missing kubotel id.');
}

$pdo = get_db();
$stmt = $pdo->prepare('SELECT * FROM kubotels WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();

if (!$row) {
    fail('Kubotel unit not found.', 404);
}

$reservedByMe = ($session && ($session['role'] ?? '') === 'student')
    && in_array($id, student_reserved_ids($pdo, (int)$session['id'], 'Kubotel'), true);

respond(['ok' => true, 'kubotel' => map_kubotel($row, $reservedByMe)]);
