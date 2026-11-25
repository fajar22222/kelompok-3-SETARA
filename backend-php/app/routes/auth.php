<?php
declare(strict_types=1);

function auth_response(PDO $pdo, array $user, int $status = 200): never
{
    $token = issue_token($pdo, $user['id']);
    json_response([
        'token' => $token,
        'user' => user_summary($user),
        'profile' => profile_to_dict($user),
    ], $status);
}

/** Buat akun baru beserta data contohnya. */
function create_user(
    PDO $pdo,
    string $email,
    string $name,
    string $password,
    string $prodi
): array {
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
        clean_text($prodi, 80, 'Ilmu Komputer'),
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
    $prodi = clean_text($data['prodi'] ?? '', 80);

    if ($name === '') {
        fail('Nama lengkap wajib diisi.');
    }
    if ($email === '') {
        fail('Email atau NIM wajib diisi.');
    }
    if (!is_email_value($email)) {
        fail('Format email tidak valid.');
    }
    if ($prodi === '') {
        fail('Program studi wajib dipilih.');
    }
    if ($password === '') {
        fail('Kata sandi wajib diisi.');
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        fail('Email sudah terdaftar. Silakan masuk.', 409);
    }

    $user = create_user($pdo, $email, $name, $password, $prodi);
    json_response([
        'user' => user_summary($user),
        'profile' => profile_to_dict($user),
    ], 201);
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

    if (!$user || !password_verify($password, (string) $user['password_hash'])) {
        fail('Email atau password salah.', 401);
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
