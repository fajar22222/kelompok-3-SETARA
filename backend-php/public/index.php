<?php
declare(strict_types=1);

require __DIR__ . '/../app/bootstrap.php';

apply_cors();

$segments = path_segments();
$resource = $segments[1] ?? '';

if (($segments[0] ?? '') !== 'api') {
    json_response([
        'service' => 'setara-api-php',
        'message' => 'API SETARA aktif. Gunakan endpoint /api/...',
    ]);
}

if ($resource === 'health') {
    json_response(['status' => 'ok', 'service' => 'setara-api-php']);
}

$routes = [
    'auth' => 'auth.php',
    'tasks' => 'tasks.php',
    'sessions' => 'schedule.php',
    'session-overrides' => 'schedule.php',
    'courses' => 'schedule.php',
    'agendas' => 'agendas.php',
    'reminders' => 'reminders.php',
    'calendar-reminders' => 'reminders.php',
    'bootstrap' => 'account.php',
    'profile' => 'account.php',
    'preferences' => 'account.php',
    'reset' => 'account.php',
    'account' => 'account.php',
];

if (isset($routes[$resource])) {
    require __DIR__ . '/../app/routes/' . $routes[$resource];
}

fail('Endpoint tidak ditemukan.', 404);
