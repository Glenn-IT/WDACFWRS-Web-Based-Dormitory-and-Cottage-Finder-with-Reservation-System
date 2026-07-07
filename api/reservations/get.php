<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/_helpers.php';

$session = current_session();
if (!$session) {
    fail('Not authenticated.', 401);
}

$id = (int)($_GET['id'] ?? 0);
if (!$id) {
    fail('Missing reservation id.');
}

$pdo = get_db();
$reservation = fetch_reservation($pdo, $id);

if (!$reservation) {
    fail('Reservation not found.', 404);
}
if ($session['role'] !== 'admin' && $reservation['studentId'] !== (int)$session['id']) {
    fail('Forbidden.', 403);
}

respond(['ok' => true, 'reservation' => $reservation]);
