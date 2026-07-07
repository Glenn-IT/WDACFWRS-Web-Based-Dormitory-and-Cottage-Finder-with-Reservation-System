<?php
declare(strict_types=1);
require_once __DIR__ . '/../_bootstrap.php';

$session = current_session();
respond(['ok' => true, 'user' => $session]);
