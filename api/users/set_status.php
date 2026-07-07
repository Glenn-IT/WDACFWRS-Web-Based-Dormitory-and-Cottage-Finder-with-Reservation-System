<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

require_role('admin');
require_post();
$in = json_input();

$id = (int)($in['id'] ?? 0);
$status = ($in['status'] ?? '') === 'Active' ? 'Active' : 'Inactive';

if (!$id) {
    fail('Missing user id.');
}

$pdo = get_db();
$stmt = $pdo->prepare('UPDATE students SET status = ? WHERE id = ?');
$stmt->execute([$status, $id]);

respond(['ok' => true]);
