<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';
require_once __DIR__ . '/../reservations/_helpers.php';

$session = current_session();
if (!$session) {
    fail('Not authenticated.', 401);
}

$id = (int)($_GET['id'] ?? 0);
if (!$id) {
    fail('Missing cottage id.');
}

$pdo = get_db();
$stmt = $pdo->prepare('SELECT * FROM cottages WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();

if (!$row) {
    fail('Cottage not found.', 404);
}

$reservedByMe = $session['role'] === 'student'
    && in_array($id, student_reserved_ids($pdo, (int)$session['id'], 'Cottage'), true);

respond(['ok' => true, 'cottage' => map_cottage($row, $reservedByMe)]);
