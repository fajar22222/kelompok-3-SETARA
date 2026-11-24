<?php
declare(strict_types=1);

const PRIORITIES = ['Tinggi', 'Sedang', 'Rendah'];
const TASK_STATUSES = ['belum', 'dikerjakan', 'selesai', 'review'];
const AGENDA_TYPES = ['kelas', 'deadline', 'lainnya'];
const REMINDER_KINDS = ['harian', 'tugas', 'kelas', 'pribadi'];
const SESSION_STATUSES = ['terjadwal', 'berlangsung', 'selesai', 'berikutnya'];
const BUILTIN_COURSES = [
    'Rekayasa Perangkat Lunak',
    'Kecerdasan Buatan',
    'Manajemen Proyek TI',
    'Interaksi Manusia dan Komputer',
    'Komputasi Awan',
];

/** Kirim respons JSON lalu hentikan eksekusi. */
function json_response(mixed $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Respons error standar: { "message": "..." }. */
function fail(string $message, int $status = 400): never
{
    json_response(['message' => $message], $status);
}

/** Body JSON request (array kosong bila tidak valid). */
function body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

/** Teks satu baris: rapikan spasi, potong sesuai batas kolom. */
function clean_text(mixed $value, int $max = 200, string $default = ''): string
{
    $text = trim((string) ($value ?? ''));
    if ($text === '') {
        return $default;
    }
    $text = preg_replace('/\s+/u', ' ', $text) ?? $text;
    return mb_substr($text, 0, $max);
}

/** Teks panjang (catatan) yang mempertahankan baris baru. */
function long_text(mixed $value, int $max = 5000, string $default = ''): string
{
    $text = trim((string) ($value ?? ''));
    if ($text === '') {
        return $default;
    }
    return mb_substr($text, 0, $max);
}

/** Lokasi opsional: null jika kosong. */
function clean_location(mixed $value, int $max = 160): ?string
{
    $text = clean_text($value, $max);
    return $text === '' ? null : $text;
}

function is_date_value(string $value): bool
{
    if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $value, $matches)) {
        return false;
    }
    return checkdate((int) $matches[2], (int) $matches[3], (int) $matches[1]);
}

function is_time_value(string $value): bool
{
    if (!preg_match('/^(\d{2})\.(\d{2})$/', $value, $matches)) {
        return false;
    }
    return (int) $matches[1] < 24 && (int) $matches[2] < 60;
}

function bool_value(mixed $value): bool
{
    if (is_bool($value)) {
        return $value;
    }
    if (is_int($value) || is_float($value)) {
        return $value !== 0;
    }
    $text = strtolower(trim((string) $value));
    return in_array($text, ['1', 'true', 'ya', 'yes', 'on'], true);
}

function new_id(string $prefix): string
{
    return $prefix . '-' . bin2hex(random_bytes(6));
}

/** CORS untuk pemanggilan langsung dari Vite (tanpa proxy). */
function apply_cors(): void
{
    $config = require __DIR__ . '/config.php';
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if ($origin !== '' && in_array($origin, $config['cors_origins'], true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Max-Age: 86400');

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
