<?php
declare(strict_types=1);

/** Nama tampilan dari input bebas, mis. "fajar@gmail.com" → "Fajar". */
function display_name(string $identifier, string $provided = ''): string
{
    $provided = trim($provided);
    if ($provided !== '') {
        return mb_substr($provided, 0, 120);
    }

    $base = explode('@', $identifier)[0];
    $cleaned = preg_replace('/[._-]+/u', ' ', $base) ?? $base;
    $cleaned = preg_replace('/\d+/u', ' ', $cleaned) ?? $cleaned;
    $cleaned = trim(preg_replace('/\s+/u', ' ', $cleaned) ?? $cleaned);
    if ($cleaned === '') {
        return 'Mahasiswa';
    }

    $words = explode(' ', $cleaned);
    $words = array_map(
        static fn (string $word): string => mb_strtoupper(mb_substr($word, 0, 1)) . mb_substr($word, 1),
        $words
    );
    return implode(' ', $words);
}

function auth_response(PDO $pdo, array $user, int $status = 200): never
{
    $token = issue_token($pdo, $user['id']);
    json_response([
        'token' => $token,
        'user' => user_summary($user),
        'profile' => profile_to_dict($user),
    ], $status);
}

/** Buat akun baru beserta data contohnya (registrasi & login pertama). */
function create_user(PDO $pdo, string $email, string $name, string $password): array
{
    $userId = 'user-' . bin2hex(random_bytes(6));

    $pdo->prepare(
        'INSERT INTO users
           (id, name, email, password_hash, nim, prodi, semester, university, preferences, custom_courses)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $userId,
        $name,
        $email,
        password_hash($password, PASSWORD_DEFAULT),
        '',
        clean_text(seed_data()['profile']['prodi'] ?? 'Ilmu Komputer', 80),
        'Semester 5',
        clean_text(seed_data()['profile']['university'] ?? 'Universitas Halu Oleo', 120),
        json_encode(seed_data()['preferences'] ?? [], JSON_UNESCAPED_UNICODE),
        '[]',
    ]);

    seed_user($pdo, $userId);
    return reload_user($pdo, $userId);
}

$method = request_method();

// Semua endpoint auth menerima maupun tidak menerima token, kecuali /me dan /logout.
$action = $segments[2] ?? '';
$pdo = db();

if ($action === 'register') {
    if ($method !== 'POST') {
        method_not_allowed();
    }
    $data = body();
    $name = trim(preg_replace('/\s+/u', ' ', (string) ($data['name'] ?? '')) ?? '');
    $email = mb_strtolower(trim(preg_replace('/\s+/u', ' ', (string) ($data['email'] ?? '')) ?? ''));
    $password = (string) ($data['password'] ?? '');

    if ($name === '') {
        fail('Nama lengkap wajib diisi.');
    }
    if ($email === '') {
        fail('Email atau NIM wajib diisi.');
    }
    if ($password === '') {
        fail('Kata sandi wajib diisi.');
    }

    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $existing = $stmt->fetch();

    if ($existing) {
        // Registrasi ulang tidak mengunci pengguna: perbarui nama lalu masuk.
        $pdo->prepare('UPDATE users SET name = ? WHERE id = ?')
            ->execute([mb_substr($name, 0, 120), $existing['id']]);
        auth_response($pdo, reload_user($pdo, $existing['id']));
    }

    auth_response($pdo, create_user($pdo, $email, display_name($email, $name), $password), 201);
}

if ($action === 'login') {
    if ($method !== 'POST') {
        method_not_allowed();
    }
    $data = body();
    $email = mb_strtolower(trim(preg_replace('/\s+/u', ' ', (string) ($data['email'] ?? '')) ?? ''));
    $password = (string) ($data['password'] ?? '');

    if ($email === '') {
        fail('Email atau NIM wajib diisi.');
    }
    if ($password === '') {
        fail('Kata sandi wajib diisi.');
    }

    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        // Mode demo: akun baru langsung dibuat agar pengguna masuk ke dashboard.
        $user = create_user($pdo, $email, display_name($email, (string) ($data['name'] ?? '')), $password);
    }

    auth_response($pdo, $user);
}

if ($action === 'me') {
    if ($method !== 'GET') {
        method_not_allowed();
    }
    $user = require_user();
    json_response([
        'user' => user_summary($user),
        'profile' => profile_to_dict($user),
    ]);
}

if ($action === 'logout') {
    if ($method !== 'POST') {
        method_not_allowed();
    }
    $token = bearer_token();
    if ($token !== null) {
        revoke_token($pdo, $token);
    }
    json_response(['ok' => true]);
}

fail('Endpoint autentikasi tidak ditemukan.', 404);
