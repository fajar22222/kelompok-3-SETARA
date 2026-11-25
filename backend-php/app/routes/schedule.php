<?php
declare(strict_types=1);

/** Validasi kolom jadwal mingguan; mengembalikan kolom yang siap disimpan. */
function session_values(array $data, bool $partial): array
{
    $values = [];

    if (!$partial || array_key_exists('course', $data)) {
        $course = clean_text($data['course'] ?? '', 120);
        if ($course === '') {
            fail('Mata kuliah wajib diisi.');
        }
        $values['course'] = $course;
    }

    if (!$partial || array_key_exists('day', $data)) {
        $day = (int) ($data['day'] ?? -1);
        if ($day < 0 || $day > 6) {
            fail('Hari tidak valid.');
        }
        $values['day'] = $day;
    }

    if (!$partial || array_key_exists('start', $data)) {
        $start = clean_text($data['start'] ?? '', 5);
        if (!is_time_value($start)) {
            fail('Waktu mulai tidak valid.');
        }
        $values['start'] = $start;
    }

    if (!$partial || array_key_exists('end', $data)) {
        $end = clean_text($data['end'] ?? '', 5);
        if (!is_time_value($end)) {
            fail('Waktu selesai tidak valid.');
        }
        $values['end'] = $end;
    }

    $start = $values['start'] ?? null;
    $end = $values['end'] ?? null;
    if ($start !== null && $end !== null && strcmp($start, $end) >= 0) {
        fail('Waktu selesai harus setelah waktu mulai.');
    }

    if (!$partial || array_key_exists('room', $data)) {
        $values['room'] = clean_text($data['room'] ?? '', 120);
    }

    if (array_key_exists('status', $data)) {
        $status = clean_text($data['status'] ?? '', 16, 'terjadwal');
        if (!in_array($status, SESSION_STATUSES, true)) {
            fail('Status kelas tidak valid.');
        }
        $values['status'] = $status;
    } elseif (!$partial) {
        $values['status'] = 'terjadwal';
    }

    return $values;
}

/** Simpan mata kuliah baru ke daftar kustom agar pilihan dropdown tetap sinkron. */
function remember_custom_course(PDO $pdo, string $userId, string $course): void
{
    if (in_array($course, BUILTIN_COURSES, true)) {
        return;
    }

    $stmt = $pdo->prepare('SELECT custom_courses FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $custom = custom_courses_of([
        'custom_courses' => (string) $stmt->fetchColumn(),
    ]);

    foreach ($custom as $item) {
        if (mb_strtolower($item) === mb_strtolower($course)) {
            return;
        }
    }

    $custom[] = $course;
    $pdo->prepare('UPDATE users SET custom_courses = ? WHERE id = ?')
        ->execute([json_encode($custom, JSON_UNESCAPED_UNICODE), $userId]);
}

$pdo = db();
$method = request_method();
$resource = $segments[1] ?? '';
$user = require_user();

// ---------------------------------------------------------------------------
// Jadwal kelas mingguan: GET daftar, POST tambah, PATCH ubah, DELETE hapus
// ---------------------------------------------------------------------------
if ($resource === 'sessions') {
    $sessionId = $segments[2] ?? null;

    $findById = static function (string $id) use ($pdo, $user): ?array {
        $stmt = $pdo->prepare('SELECT * FROM class_sessions WHERE user_id = ? AND id = ?');
        $stmt->execute([$user['id'], $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    };

    $findSession = static function () use ($findById, $sessionId): ?array {
        return $sessionId === null ? null : $findById($sessionId);
    };

    if ($sessionId === null && $method === 'GET') {
        $stmt = $pdo->prepare(
            'SELECT * FROM class_sessions WHERE user_id = ? ORDER BY day ASC, `start` ASC'
        );
        $stmt->execute([$user['id']]);
        json_response(array_map('session_to_dict', $stmt->fetchAll()));
    }

    if ($sessionId === null && $method === 'POST') {
        $data = body();
        $values = session_values($data, false);
        $id = clean_text($data['id'] ?? '', 80) ?: new_id('ses');

        $stmt = $pdo->prepare('SELECT 1 FROM class_sessions WHERE user_id = ? AND id = ?');
        $stmt->execute([$user['id'], $id]);
        if ($stmt->fetchColumn()) {
            // Gunakan id unik lain bila klien mengirim id yang sudah dipakai.
            $id = new_id('ses');
        }

        $values['id'] = $id;
        $values['user_id'] = $user['id'];

        $columns = array_keys($values);
        $sql = 'INSERT INTO class_sessions (`' . implode('`, `', $columns) . '`) VALUES ('
            . implode(', ', array_fill(0, count($columns), '?')) . ')';
        $pdo->prepare($sql)->execute(array_values($values));

        remember_custom_course($pdo, $user['id'], $values['course']);
        json_response(session_to_dict($findById($id)), 201);
    }

    if ($sessionId !== null && $method === 'PATCH') {
        $session = $findSession();
        if ($session === null) {
            fail('Jadwal kelas tidak ditemukan.', 404);
        }

        $values = session_values(body(), true);
        if ($values !== []) {
            $sets = [];
            $params = [];
            foreach ($values as $column => $value) {
                $sets[] = "`{$column}` = ?";
                $params[] = $value;
            }
            $params[] = $session['pk'];
            $pdo->prepare(
                'UPDATE class_sessions SET ' . implode(', ', $sets) . ' WHERE pk = ?'
            )->execute($params);

            if (isset($values['course'])) {
                remember_custom_course($pdo, $user['id'], $values['course']);
            }
        }

        json_response(session_to_dict($findSession()));
    }

    if ($sessionId !== null && $method === 'DELETE') {
        $session = $findSession();
        if ($session === null) {
            fail('Jadwal kelas tidak ditemukan.', 404);
        }

        $pdo->prepare(
            'DELETE FROM session_overrides WHERE user_id = ? AND session_id = ?'
        )->execute([$user['id'], $sessionId]);
        $pdo->prepare('DELETE FROM class_sessions WHERE pk = ?')->execute([$session['pk']]);

        json_response(['ok' => true]);
    }

    method_not_allowed();
}

// ---------------------------------------------------------------------------
// Override sesi: PUT/DELETE /api/session-overrides/{sessionId}/{date}
// ---------------------------------------------------------------------------
if ($resource === 'session-overrides') {
    $sessionId = $segments[2] ?? '';
    $date = $segments[3] ?? '';

    $findOverride = static function () use ($pdo, $user, $sessionId, $date): ?array {
        $stmt = $pdo->prepare(
            'SELECT * FROM session_overrides WHERE user_id = ? AND session_id = ? AND date = ?'
        );
        $stmt->execute([$user['id'], $sessionId, $date]);
        $row = $stmt->fetch();
        return $row ?: null;
    };

    if ($method === 'DELETE') {
        $pdo->prepare(
            'DELETE FROM session_overrides WHERE user_id = ? AND session_id = ? AND date = ?'
        )->execute([$user['id'], $sessionId, $date]);
        json_response(['ok' => true]);
    }

    if ($method !== 'PUT') {
        method_not_allowed();
    }

    $stmt = $pdo->prepare('SELECT * FROM class_sessions WHERE user_id = ? AND id = ?');
    $stmt->execute([$user['id'], $sessionId]);
    if (!$stmt->fetch()) {
        fail('Jadwal kelas tidak ditemukan.', 404);
    }
    if (!is_date_value($date)) {
        fail('Tanggal override tidak valid.');
    }

    $data = body();
    $values = [];

    if (array_key_exists('title', $data)) {
        $title = clean_text($data['title'] ?? '', 200);
        if ($title === '') {
            fail('Judul kelas wajib diisi.');
        }
        $values['title'] = $title;
    }
    if (array_key_exists('start', $data)) {
        $start = clean_text($data['start'] ?? '', 5);
        if (!is_time_value($start)) {
            fail('Waktu mulai tidak valid.');
        }
        $values['start'] = $start;
    }
    if (array_key_exists('end', $data)) {
        $end = clean_text($data['end'] ?? '', 5);
        if (!is_time_value($end)) {
            fail('Waktu selesai tidak valid.');
        }
        $values['end'] = $end;
    }
    if (array_key_exists('room', $data)) {
        $values['room'] = clean_location($data['room'] ?? null);
    }
    if (array_key_exists('type', $data)) {
        $type = clean_text($data['type'] ?? '', 16);
        if (!in_array($type, AGENDA_TYPES, true)) {
            fail('Kategori kelas tidak valid.');
        }
        $values['type'] = $type;
    }
    if (array_key_exists('hidden', $data)) {
        $values['hidden'] = bool_value($data['hidden']) ? 1 : 0;
    }

    $override = $findOverride();
    $created = $override === null;

    if ($created) {
        $pdo->prepare(
            'INSERT INTO session_overrides (user_id, session_id, date, hidden) VALUES (?, ?, ?, 0)'
        )->execute([$user['id'], $sessionId, $date]);
    }

    if ($values !== []) {
        $sets = [];
        $params = [];
        foreach ($values as $column => $value) {
            $sets[] = "`{$column}` = ?";
            $params[] = $value;
        }
        $params[] = $user['id'];
        $params[] = $sessionId;
        $params[] = $date;
        $pdo->prepare(
            'UPDATE session_overrides SET ' . implode(', ', $sets)
            . ' WHERE user_id = ? AND session_id = ? AND date = ?'
        )->execute($params);
    }

    json_response(override_to_dict($findOverride()), $created ? 201 : 200);
}

// ---------------------------------------------------------------------------
// Mata kuliah: GET/POST /api/courses
// ---------------------------------------------------------------------------
if ($resource === 'courses') {
    if ($method === 'GET') {
        json_response([
            'builtin' => BUILTIN_COURSES,
            'custom' => custom_courses_of($user),
        ]);
    }

    if ($method !== 'POST') {
        method_not_allowed();
    }

    $data = body();
    $name = trim(preg_replace('/\s+/u', ' ', (string) ($data['name'] ?? '')) ?? '');
    $name = mb_substr($name, 0, 120);
    if ($name === '') {
        fail('Nama mata kuliah wajib diisi.');
    }

    $lowered = mb_strtolower($name);

    foreach (BUILTIN_COURSES as $course) {
        if (mb_strtolower($course) === $lowered) {
            json_response(['name' => $course, 'created' => false]);
        }
    }

    $custom = custom_courses_of($user);
    foreach ($custom as $course) {
        if (mb_strtolower($course) === $lowered) {
            json_response(['name' => $course, 'created' => false]);
        }
    }

    $custom[] = $name;
    $pdo->prepare('UPDATE users SET custom_courses = ? WHERE id = ?')
        ->execute([json_encode($custom, JSON_UNESCAPED_UNICODE), $user['id']]);

    json_response(['name' => $name, 'created' => true], 201);
}

fail('Endpoint tidak ditemukan.', 404);
