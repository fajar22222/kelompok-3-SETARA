<?php
declare(strict_types=1);

/** Muat data contoh dari seed.json (di-cache per request). */
function seed_data(): array
{
    static $seed = null;
    if (is_array($seed)) {
        return $seed;
    }
    $path = __DIR__ . '/seed.json';
    $raw = file_get_contents($path);
    $seed = $raw === false ? [] : (json_decode($raw, true) ?: []);
    return $seed;
}

/** Hapus seluruh data akademik milik satu akun (bukan akunnya). */
function wipe_user_data(PDO $pdo, string $userId): void
{
    $pdo->prepare(
        'DELETE s FROM subtasks s JOIN tasks t ON t.pk = s.task_pk WHERE t.user_id = ?'
    )->execute([$userId]);

    foreach ([
        'tasks',
        'class_sessions',
        'agendas',
        'session_overrides',
        'reminders',
        'calendar_reminders',
    ] as $table) {
        $pdo->prepare("DELETE FROM {$table} WHERE user_id = ?")->execute([$userId]);
    }
}

/**
 * Isi akun dengan data contoh. Tidak melakukan commit; pemanggil yang mengatur
 * transaksi agar registrasi + seed bersifat atomik.
 */
function seed_user(PDO $pdo, string $userId, bool $academicFromSeed = false): void
{
    $seed = seed_data();
    $profile = $seed['profile'] ?? [];

    if ($academicFromSeed) {
        $pdo->prepare(
            'UPDATE users SET name = ?, nim = ?, prodi = ?, semester = ?, university = ? WHERE id = ?'
        )->execute([
            clean_text($profile['name'] ?? 'La Ode Elung', 120),
            clean_text($profile['nim'] ?? 'F1G125077', 40),
            clean_text($profile['prodi'] ?? 'Ilmu Komputer', 80),
            clean_text($profile['semester'] ?? 'Semester 5', 40),
            clean_text($profile['university'] ?? 'Universitas Halu Oleo', 120),
            $userId,
        ]);
    }

    wipe_user_data($pdo, $userId);

    $pdo->prepare('UPDATE users SET preferences = ?, custom_courses = ? WHERE id = ?')
        ->execute([
            json_encode($seed['preferences'] ?? [], JSON_UNESCAPED_UNICODE),
            json_encode([], JSON_UNESCAPED_UNICODE),
            $userId,
        ]);

    $insertTask = $pdo->prepare(
        'INSERT INTO tasks (id, user_id, title, course, deadline, time, priority, status, notes, reminder, position)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $insertSubtask = $pdo->prepare(
        'INSERT INTO subtasks (id, task_pk, title, done, position) VALUES (?, ?, ?, ?, ?)'
    );

    foreach (($seed['tasks'] ?? []) as $index => $item) {
        $insertTask->execute([
            clean_text($item['id'] ?? new_id('task'), 80),
            $userId,
            clean_text($item['title'] ?? 'Tugas', 200),
            clean_text($item['course'] ?? 'Rekayasa Perangkat Lunak', 120),
            clean_text($item['deadline'] ?? '2026-11-12', 10),
            clean_text($item['time'] ?? '23.59', 5),
            clean_text($item['priority'] ?? 'Sedang', 16),
            clean_text($item['status'] ?? 'belum', 16),
            long_text($item['notes'] ?? '', 5000),
            clean_text($item['reminder'] ?? 'H-1 · 08.00', 80),
            (int) $index,
        ]);
        $taskPk = (int) $pdo->lastInsertId();

        foreach (($item['subtasks'] ?? []) as $subIndex => $subtask) {
            $insertSubtask->execute([
                clean_text($subtask['id'] ?? new_id('sub'), 80),
                $taskPk,
                clean_text($subtask['title'] ?? 'Subtugas', 200),
                bool_value($subtask['done'] ?? false) ? 1 : 0,
                (int) $subIndex,
            ]);
        }
    }

    $insertSession = $pdo->prepare(
        'INSERT INTO class_sessions (id, user_id, course, day, start, end, room, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    foreach (($seed['sessions'] ?? []) as $item) {
        $insertSession->execute([
            clean_text($item['id'] ?? new_id('ses'), 80),
            $userId,
            clean_text($item['course'] ?? '', 120),
            (int) ($item['day'] ?? 1),
            clean_text($item['start'] ?? '08.00', 5),
            clean_text($item['end'] ?? '09.40', 5),
            clean_text($item['room'] ?? '', 120),
            clean_text($item['status'] ?? 'terjadwal', 16),
        ]);
    }

    $insertAgenda = $pdo->prepare(
        'INSERT INTO agendas (id, user_id, title, date, time, end_time, type, location)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    foreach (($seed['agendas'] ?? []) as $item) {
        $insertAgenda->execute([
            clean_text($item['id'] ?? new_id('agenda'), 80),
            $userId,
            clean_text($item['title'] ?? '', 200),
            clean_text($item['date'] ?? '2026-11-12', 10),
            clean_text($item['time'] ?? '08.00', 5),
            isset($item['endTime']) ? clean_text($item['endTime'], 5) : null,
            clean_text($item['type'] ?? 'lainnya', 16),
            clean_location($item['location'] ?? null),
        ]);
    }

    $insertReminder = $pdo->prepare(
        'INSERT INTO reminders (id, user_id, title, detail, date, time, enabled, kind)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    foreach (($seed['reminders'] ?? []) as $item) {
        $insertReminder->execute([
            clean_text($item['id'] ?? new_id('rem'), 80),
            $userId,
            clean_text($item['title'] ?? '', 200),
            long_text($item['detail'] ?? '', 2000),
            clean_text($item['date'] ?? '2026-11-12', 10),
            clean_text($item['time'] ?? '08.00', 5),
            bool_value($item['enabled'] ?? true) ? 1 : 0,
            clean_text($item['kind'] ?? 'harian', 16),
        ]);
    }

    $insertCalendarReminder = $pdo->prepare(
        'INSERT INTO calendar_reminders (id, user_id, time, label, enabled) VALUES (?, ?, ?, ?, ?)'
    );
    foreach (($seed['calendarReminders'] ?? []) as $item) {
        $insertCalendarReminder->execute([
            clean_text($item['id'] ?? new_id('cal'), 80),
            $userId,
            clean_text($item['time'] ?? '08.00', 5),
            clean_text($item['label'] ?? '', 200),
            bool_value($item['enabled'] ?? true) ? 1 : 0,
        ]);
    }
}

/** Pastikan akun demo tersedia (dipakai CLI seed dan login demo). */
function ensure_demo_user(PDO $pdo): array
{
    $config = require __DIR__ . '/config.php';
    $email = strtolower($config['demo_email']);

    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if ($user) {
        return $user;
    }

    $profile = seed_data()['profile'] ?? [];
    $userId = 'user-demo';
    $pdo->prepare(
        'INSERT INTO users (id, name, email, password_hash, nim, prodi, semester, university, preferences, custom_courses)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $userId,
        clean_text($profile['name'] ?? 'Aditya Pratama', 120),
        $email,
        password_hash($config['demo_password'], PASSWORD_DEFAULT),
        clean_text($profile['nim'] ?? '', 40),
        clean_text($profile['prodi'] ?? 'Ilmu Komputer', 80),
        clean_text($profile['semester'] ?? 'Semester 5', 40),
        clean_text($profile['university'] ?? 'Universitas Halu Oleo', 120),
        json_encode(seed_data()['preferences'] ?? [], JSON_UNESCAPED_UNICODE),
        json_encode([], JSON_UNESCAPED_UNICODE),
    ]);

    seed_user($pdo, $userId, true);

    $stmt->execute([$email]);
    return $stmt->fetch();
}
