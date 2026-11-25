<?php
declare(strict_types=1);

/** Koneksi PDO tunggal (lazy) untuk seluruh request. */
function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = require __DIR__ . '/config.php';
    $db = $config['db'];
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $db['host'],
        $db['port'],
        $db['name']
    );

    try {
        $pdo = new PDO($dsn, $db['user'], $db['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $exception) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'message' => 'Tidak dapat terhubung ke MySQL. Pastikan Laragon (MySQL) sudah berjalan.',
        ], JSON_UNESCAPED_UNICODE);
        error_log('DB connection failed: ' . $exception->getMessage());
        exit;
    }

    return $pdo;
}
