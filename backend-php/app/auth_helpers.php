<?php
declare(strict_types=1);

/**
 * Token akses opaque: nilai asli hanya dikirim sekali ke klien,
 * yang disimpan di database hanyalah hash SHA-256 agar bocoran tabel
 * tidak langsung memberi akses.
 */

function bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';

    if ($header === '' && function_exists('apache_request_headers')) {
        foreach (apache_request_headers() as $name => $value) {
            if (strcasecmp((string) $name, 'Authorization') === 0) {
                $header = (string) $value;
                break;
            }
        }
    }

    if (preg_match('/^Bearer\s+([A-Za-z0-9._\-]{20,})$/', trim($header), $matches)) {
        return $matches[1];
    }
    return null;
}

function issue_token(PDO $pdo, string $userId): string
{
    $config = require __DIR__ . '/config.php';
    $days = max(1, (int) $config['token_ttl_days']);
    $token = bin2hex(random_bytes(32));

    // Bersihkan token kedaluwarsa agar tabel tidak menumpuk.
    $pdo->prepare('DELETE FROM auth_tokens WHERE expires_at < NOW()')->execute();

    $pdo->prepare(
        "INSERT INTO auth_tokens (token_hash, user_id, expires_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL {$days} DAY))"
    )->execute([hash('sha256', $token), $userId]);

    return $token;
}

function revoke_token(PDO $pdo, string $token): void
{
    $pdo->prepare('DELETE FROM auth_tokens WHERE token_hash = ?')
        ->execute([hash('sha256', $token)]);
}

function current_user(): ?array
{
    $token = bearer_token();
    if ($token === null) {
        return null;
    }

    $stmt = db()->prepare(
        'SELECT u.* FROM auth_tokens t
         JOIN users u ON u.id = t.user_id
         WHERE t.token_hash = ? AND t.expires_at > NOW()'
    );
    $stmt->execute([hash('sha256', $token)]);
    $user = $stmt->fetch();
    return $user ?: null;
}

/** Ambil pengguna aktif atau hentikan request dengan 401. */
function require_user(): array
{
    $user = current_user();
    if ($user === null) {
        fail('Sesi tidak valid. Silakan masuk kembali.', 401);
    }
    return $user;
}

/** Muat ulang baris pengguna dari database (setelah update). */
function reload_user(PDO $pdo, string $userId): array
{
    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    return $stmt->fetch() ?: [];
}
