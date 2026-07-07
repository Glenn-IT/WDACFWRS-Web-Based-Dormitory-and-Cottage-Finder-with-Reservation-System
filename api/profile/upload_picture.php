<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../_uploads.php';
require_once __DIR__ . '/../users/_helpers.php';

$session = require_role('student');
require_post();

if (!isset($_FILES['image'])) {
    fail('No image uploaded.');
}

$path = save_uploaded_image($_FILES['image'], 'profiles');
if (!$path) {
    fail('No image uploaded.');
}

$pdo = get_db();
$pdo->prepare('UPDATE students SET profile_pic_path = ? WHERE id = ?')->execute([$path, $session['id']]);

$stmt = $pdo->prepare('SELECT * FROM students WHERE id = ?');
$stmt->execute([$session['id']]);

respond(['ok' => true, 'user' => map_student($stmt->fetch())]);
