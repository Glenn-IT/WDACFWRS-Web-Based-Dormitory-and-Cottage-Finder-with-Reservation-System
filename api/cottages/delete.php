<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

require_role('admin');
require_post();

$in = json_input();
$id = (int)($in['id'] ?? 0);
if (!$id) {
    fail('Missing cottage id.');
}

$pdo = get_db();
$stmt = $pdo->prepare('DELETE FROM cottages WHERE id = ?');
$stmt->execute([$id]);

respond(['ok' => true]);
