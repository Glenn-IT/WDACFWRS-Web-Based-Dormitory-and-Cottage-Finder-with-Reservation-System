<?php
// Shared bootstrap included by every api/**/*.php endpoint.

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

header('Content-Type: application/json; charset=utf-8');

/** Send a JSON response and stop execution. */
function respond($data, int $code = 200): never {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

/** Send a JSON error response and stop execution. */
function fail(string $message, int $code = 400): never {
    respond(['ok' => false, 'message' => $message], $code);
}

/** Decode the JSON request body into an associative array. */
function json_input(): array {
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/** Return the current session array, or null if not logged in. */
function current_session(): ?array {
    return $_SESSION['user'] ?? null;
}

/** Require a logged-in session of the given role ('admin' or 'student'); halts with 401/403 otherwise. */
function require_role(string $role): array {
    $session = current_session();
    if (!$session) {
        fail('Not authenticated.', 401);
    }
    if ($session['role'] !== $role) {
        fail('Forbidden.', 403);
    }
    return $session;
}

/** Only allow POST requests; halts with 405 otherwise. */
function require_post(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        fail('Method not allowed.', 405);
    }
}

/** Generate the next sequential display code, e.g. next_code($pdo, 'students', 'student_no', 'STU'). */
function next_code(PDO $pdo, string $table, string $column, string $prefix): string {
    $stmt = $pdo->query("SELECT $column FROM $table ORDER BY id DESC LIMIT 1");
    $last = $stmt->fetchColumn();
    $n = 1;
    if ($last && preg_match('/(\d+)$/', $last, $m)) {
        $n = (int)$m[1] + 1;
    }
    return $prefix . '-' . str_pad((string)$n, 4, '0', STR_PAD_LEFT);
}
