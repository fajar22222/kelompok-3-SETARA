<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/serializers.php';
require_once __DIR__ . '/seed.php';
require_once __DIR__ . '/auth_helpers.php';

/** Segmen URL tanpa leading/trailing slash, mis. /api/tasks/x → [api, tasks, x]. */
function path_segments(): array
{
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    return array_values(array_filter(explode('/', $path), static fn (string $part): bool => $part !== ''));
}

function request_method(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function method_not_allowed(): never
{
    fail('Metode HTTP tidak didukung.', 405);
}
