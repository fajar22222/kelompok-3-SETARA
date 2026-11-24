<?php
declare(strict_types=1);

/**
 * Konfigurasi backend SETARA.
 * Nilai dapat dioverride lewat environment variable agar mudah dipindah
 * antara Laragon lokal, server kampus, atau hosting.
 */
return [
    'db' => [
        'host' => getenv('SETARA_DB_HOST') ?: '127.0.0.1',
        'port' => (int) (getenv('SETARA_DB_PORT') ?: 3306),
        'name' => getenv('SETARA_DB_NAME') ?: 'setara',
        'user' => getenv('SETARA_DB_USER') ?: 'root',
        'pass' => getenv('SETARA_DB_PASS') !== false ? getenv('SETARA_DB_PASS') : '',
    ],
    'demo_email' => getenv('SETARA_DEMO_EMAIL') ?: 'aditya.pratama@kampus.ac.id',
    'demo_password' => getenv('SETARA_DEMO_PASSWORD') ?: 'setara123',
    'token_ttl_days' => 7,
    'cors_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:4173',
        'http://127.0.0.1:4173',
    ],
];
