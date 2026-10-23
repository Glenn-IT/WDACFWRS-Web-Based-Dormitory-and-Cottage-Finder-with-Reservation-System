<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

require_role('admin');
require_post();

$in = json_input();
$id = (int)($in['id'] ?? 0);
if (!$id) {
    fail('Missing kubotel id.');
}

$pdo = get_db();

// Check if active reservations exist
$chk = $pdo->prepare("SELECT COUNT(*) FROM reservations WHERE kubotel_id = ? AND approval_status IN ('Pending', 'Approved')");
$chk->execute([$id]);
if ((int)$chk->fetchColumn() > 0) {
    fail('Cannot delete this Kubotel unit because it has active (Pending or Approved) reservations.');
}

$stmt = $pdo->prepare('DELETE FROM kubotels WHERE id = ?');
$stmt->execute([$id]);

respond(['ok' => true]);
