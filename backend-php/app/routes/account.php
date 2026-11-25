<?php
declare(strict_types=1);

$pdo = db();
$method = request_method();
$resource = $segments[1] ?? '';
$user = require_user();

const PREFERENCE_KEYS = [
    'pushNotif',
    'emailNotif',
    'weeklySummary',
    'focusTips',
    'compactMode',
];

// ---------------------------------------------------------------------------
// GET /api/bootstrap — semua data setelah login
// ---------------------------------------------------------------------------
if ($resource === 'bootstrap') {
    if ($method !== 'GET') {
        method_not_allowed();
    }
    json_response(bootstrap_payload($pdo, $user));
}

// ---------------------------------------------------------------------------
// PATCH /api/profile
// ---------------------------------------------------------------------------
if ($resource === 'profile') {
    if ($method !== 'PATCH') {
        method_not_allowed();
    }
    $data = body();

    if (array_key_exists('name', $data)) {
        $name = clean_text($data['name'] ?? '', 120);
        if ($name === '') {
            fail('Nama lengkap wajib diisi.');
        }
        $pdo->prepare('UPDATE users SET name = ? WHERE id = ?')->execute([$name, $user['id']]);
    }
    if (array_key_exists('nim', $data)) {
        $pdo->prepare('UPDATE users SET nim = ? WHERE id = ?')
            ->execute([clean_text($data['nim'] ?? '', 40), $user['id']]);
    }
    if (array_key_exists('prodi', $data)) {
        $pdo->prepare('UPDATE users SET prodi = ? WHERE id = ?')
            ->execute([clean_text($data['prodi'] ?? '', 80, $user['prodi']), $user['id']]);
    }
    if (array_key_exists('semester', $data)) {
        $pdo->prepare('UPDATE users SET semester = ? WHERE id = ?')
            ->execute([clean_text($data['semester'] ?? '', 40, $user['semester']), $user['id']]);
    }
    if (array_key_exists('university', $data)) {
        $pdo->prepare('UPDATE users SET university = ? WHERE id = ?')
            ->execute([clean_text($data['university'] ?? '', 120, $user['university']), $user['id']]);
    }
    if (array_key_exists('email', $data)) {
        $email = mb_strtolower(clean_text($data['email'] ?? '', 160));
        if ($email === '') {
            fail('Email atau NIM wajib diisi.');
        }
        if ($email !== $user['email']) {
            $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id <> ?');
            $stmt->execute([$email, $user['id']]);
            if ($stmt->fetch()) {
                fail('Email sudah dipakai akun lain.', 409);
            }
            $pdo->prepare('UPDATE users SET email = ? WHERE id = ?')
                ->execute([$email, $user['id']]);
        }
    }

    $fresh = reload_user($pdo, $user['id']);
    json_response([
        'profile' => profile_to_dict($fresh),
        'user' => user_summary($fresh),
    ]);
}

// ---------------------------------------------------------------------------
// PATCH /api/preferences
// ---------------------------------------------------------------------------
if ($resource === 'preferences') {
    if ($method !== 'PATCH') {
        method_not_allowed();
    }
    $data = body();
    $preferences = preferences_of($user);

    foreach (PREFERENCE_KEYS as $key) {
        if (array_key_exists($key, $data)) {
            $preferences[$key] = bool_value($data[$key]);
        }
    }

    $pdo->prepare('UPDATE users SET preferences = ? WHERE id = ?')
        ->execute([json_encode($preferences, JSON_UNESCAPED_UNICODE), $user['id']]);

    json_response(['preferences' => $preferences]);
}

// ---------------------------------------------------------------------------
// POST /api/reset — kembalikan data contoh, pertahankan identitas akun
// ---------------------------------------------------------------------------
if ($resource === 'reset') {
    if ($method !== 'POST') {
        method_not_allowed();
    }

    $identity = [
        'name' => $user['name'],
        'email' => $user['email'],
        'nim' => $user['nim'],
    ];

    $pdo->beginTransaction();
    try {
        seed_user($pdo, $user['id']);
        $pdo->prepare('UPDATE users SET name = ?, email = ?, nim = ? WHERE id = ?')
            ->execute([$identity['name'], $identity['email'], $identity['nim'], $user['id']]);
        $pdo->commit();
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }

    json_response(bootstrap_payload($pdo, reload_user($pdo, $user['id'])));
}

// ---------------------------------------------------------------------------
// DELETE /api/account — hapus akun beserta seluruh datanya
// ---------------------------------------------------------------------------
if ($resource === 'account' && !isset($segments[2])) {
    if ($method !== 'DELETE') {
        method_not_allowed();
    }
    $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$user['id']]);
    json_response(['ok' => true]);
}

fail('Endpoint tidak ditemukan.', 404);
