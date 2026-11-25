<?php
declare(strict_types=1);

/**
 * Siapkan database SETARA:
 *   php bin/init-db.php
 *
 * Langkah:
 *   1. Buat database + tabel dari sql/schema.sql.
 *   2. Pastikan akun demo (aditya.pratama@kampus.ac.id / setara123) tersedia.
 */

if (PHP_SAPI !== 'cli') {
    exit("Skrip ini hanya boleh dijalankan dari terminal.\n");
}

$config = require __DIR__ . '/../app/config.php';
$db = $config['db'];

$dsn = sprintf('mysql:host=%s;port=%d;charset=utf8mb4', $db['host'], $db['port']);

try {
    $root = new PDO($dsn, $db['user'], $db['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $exception) {
    fwrite(STDERR, "Gagal terhubung ke MySQL: {$exception->getMessage()}\n");
    fwrite(STDERR, "Pastikan MySQL Laragon sudah berjalan (Start All).\n");
    exit(1);
}

$schema = file_get_contents(__DIR__ . '/../sql/schema.sql');
if ($schema === false) {
    fwrite(STDERR, "File sql/schema.sql tidak ditemukan.\n");
    exit(1);
}

$root->exec($schema);
echo "Skema database '{$db['name']}' siap.\n";

require __DIR__ . '/../app/bootstrap.php';

$pdo = db();
$user = ensure_demo_user($pdo);
ensure_quick_demo_users($pdo);
echo "Akun demo siap: {$user['email']}\n";
echo "Selesai. Jalankan API dengan: php -S 127.0.0.1:8000 -t public public/router.php\n";
