<?php
declare(strict_types=1);

/** Ringkasan akun yang aman dikirim ke frontend. */
function user_summary(array $user): array
{
    return [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
    ];
}

function profile_to_dict(array $user): array
{
    return [
        'name' => $user['name'],
        'nim' => $user['nim'],
        'email' => $user['email'],
        'prodi' => $user['prodi'],
        'semester' => $user['semester'],
        'university' => $user['university'],
    ];
}

function preferences_of(array $user): array
{
    $decoded = json_decode((string) ($user['preferences'] ?? ''), true);
    return is_array($decoded) ? $decoded : [];
}

function custom_courses_of(array $user): array
{
    $decoded = json_decode((string) ($user['custom_courses'] ?? ''), true);
    return is_array($decoded) ? array_values($decoded) : [];
}

/**
 * Ubah daftar baris tabel tasks menjadi payload API.
 * Subtugas diambil sekaligus (bukan per tugas) supaya tetap ringan.
 */
function tasks_to_list(PDO $pdo, array $tasks): array
{
    if ($tasks === []) {
        return [];
    }

    $pks = array_map(static fn (array $task): int => (int) $task['pk'], $tasks);
    $placeholders = implode(',', array_fill(0, count($pks), '?'));
    $stmt = $pdo->prepare(
        "SELECT task_pk, id, title, done FROM subtasks
         WHERE task_pk IN ({$placeholders})
         ORDER BY position ASC, pk ASC"
    );
    $stmt->execute($pks);

    $grouped = [];
    foreach ($stmt->fetchAll() as $row) {
        $grouped[(int) $row['task_pk']][] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'done' => (bool) $row['done'],
        ];
    }

    $payload = [];
    foreach ($tasks as $task) {
        $payload[] = [
            'id' => $task['id'],
            'title' => $task['title'],
            'course' => $task['course'],
            'deadline' => $task['deadline'],
            'time' => $task['time'],
            'priority' => $task['priority'],
            'status' => $task['status'],
            'notes' => $task['notes'],
            'reminder' => $task['reminder'],
            'subtasks' => $grouped[(int) $task['pk']] ?? [],
        ];
    }
    return $payload;
}

/** Satu tugas lengkap dengan subtugasnya. */
function task_to_dict(PDO $pdo, array $task): array
{
    return tasks_to_list($pdo, [$task])[0];
}

function session_to_dict(array $session): array
{
    return [
        'id' => $session['id'],
        'course' => $session['course'],
        'day' => (int) $session['day'],
        'start' => $session['start'],
        'end' => $session['end'],
        'room' => $session['room'],
        'status' => $session['status'],
    ];
}

function agenda_to_dict(array $agenda): array
{
    return [
        'id' => $agenda['id'],
        'title' => $agenda['title'],
        'date' => $agenda['date'],
        'time' => $agenda['time'],
        'endTime' => $agenda['end_time'],
        'type' => $agenda['type'],
        'location' => $agenda['location'],
    ];
}

function override_to_dict(array $override): array
{
    $payload = [
        'sessionId' => $override['session_id'],
        'date' => $override['date'],
        'hidden' => (bool) $override['hidden'],
    ];
    foreach (['title', 'start', 'end', 'room', 'type'] as $key) {
        if ($override[$key] !== null) {
            $payload[$key] = $override[$key];
        }
    }
    return $payload;
}

function reminder_to_dict(array $reminder): array
{
    return [
        'id' => $reminder['id'],
        'title' => $reminder['title'],
        'detail' => $reminder['detail'],
        'date' => $reminder['date'],
        'time' => $reminder['time'],
        'enabled' => (bool) $reminder['enabled'],
        'kind' => $reminder['kind'],
    ];
}

function calendar_reminder_to_dict(array $reminder): array
{
    return [
        'id' => $reminder['id'],
        'time' => $reminder['time'],
        'label' => $reminder['label'],
        'enabled' => (bool) $reminder['enabled'],
    ];
}

/** Semua data yang dibutuhkan dashboard setelah login. */
function bootstrap_payload(PDO $pdo, array $user): array
{
    $userId = $user['id'];

    $tasks = $pdo->prepare(
        'SELECT * FROM tasks WHERE user_id = ? ORDER BY position ASC, pk ASC'
    );
    $tasks->execute([$userId]);

    $sessions = $pdo->prepare(
        'SELECT * FROM class_sessions WHERE user_id = ? ORDER BY day ASC, `start` ASC'
    );
    $sessions->execute([$userId]);

    $agendas = $pdo->prepare(
        'SELECT * FROM agendas WHERE user_id = ? ORDER BY date ASC, `time` ASC'
    );
    $agendas->execute([$userId]);

    $overrides = $pdo->prepare(
        'SELECT * FROM session_overrides WHERE user_id = ? ORDER BY date ASC'
    );
    $overrides->execute([$userId]);

    $reminders = $pdo->prepare(
        'SELECT * FROM reminders WHERE user_id = ? ORDER BY `time` ASC'
    );
    $reminders->execute([$userId]);

    $calendar = $pdo->prepare(
        'SELECT * FROM calendar_reminders WHERE user_id = ? ORDER BY `time` ASC'
    );
    $calendar->execute([$userId]);

    return [
        'tasks' => tasks_to_list($pdo, $tasks->fetchAll()),
        'sessions' => array_map('session_to_dict', $sessions->fetchAll()),
        'agendas' => array_map('agenda_to_dict', $agendas->fetchAll()),
        'sessionOverrides' => array_map('override_to_dict', $overrides->fetchAll()),
        'customCourses' => custom_courses_of($user),
        'reminders' => array_map('reminder_to_dict', $reminders->fetchAll()),
        'calendarReminders' => array_map('calendar_reminder_to_dict', $calendar->fetchAll()),
        'profile' => profile_to_dict($user),
        'preferences' => preferences_of($user),
    ];
}
