<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

$session = require_role('student');

$pdo = get_db();
$stmt = $pdo->prepare('SELECT id, message, created_at, is_read FROM notifications WHERE student_id = ? ORDER BY created_at DESC, id DESC');
$stmt->execute([$session['id']]);
$rows = $stmt->fetchAll();

$notifications = array_map(function (array $r): array {
    return [
        'id' => (int)$r['id'],
        'message' => $r['message'],
        'date' => substr($r['created_at'], 0, 10),
        'read' => (bool)$r['is_read'],
    ];
}, $rows);

respond(['ok' => true, 'notifications' => $notifications]);
