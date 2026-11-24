<?php
declare(strict_types=1);

function find_task(PDO $pdo, string $userId, string $taskId): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM tasks WHERE user_id = ? AND id = ?');
    $stmt->execute([$userId, $taskId]);
    $task = $stmt->fetch();
    return $task ?: null;
}

/** Tugas baru diletakkan di urutan paling atas (sama seperti backend Flask). */
function first_task_position(PDO $pdo, string $userId): int
{
    $stmt = $pdo->prepare('SELECT MIN(position) FROM tasks WHERE user_id = ?');
    $stmt->execute([$userId]);
    $value = $stmt->fetchColumn();
    return $value === null || $value === false ? 0 : ((int) $value) - 1;
}

function replace_subtasks(PDO $pdo, int $taskPk, mixed $raw): void
{
    $pdo->prepare('DELETE FROM subtasks WHERE task_pk = ?')->execute([$taskPk]);
    if (!is_array($raw)) {
        return;
    }

    $insert = $pdo->prepare(
        'INSERT INTO subtasks (id, task_pk, title, done, position) VALUES (?, ?, ?, ?, ?)'
    );

    $index = 0;
    foreach ($raw as $item) {
        if (!is_array($item)) {
            continue;
        }
        $title = clean_text($item['title'] ?? '', 200);
        if ($title === '') {
            continue;
        }
        $id = clean_text($item['id'] ?? '', 80) ?: new_id('sub');
        $insert->execute([
            $id,
            $taskPk,
            $title,
            bool_value($item['done'] ?? false) ? 1 : 0,
            $index,
        ]);
        $index++;
    }
}

function recalc_task_status(PDO $pdo, int $taskPk): void
{
    $stmt = $pdo->prepare(
        'SELECT t.`status`, COUNT(s.pk) AS total, COALESCE(SUM(s.done), 0) AS done_count
         FROM tasks t LEFT JOIN subtasks s ON s.task_pk = t.pk
         WHERE t.pk = ? GROUP BY t.pk'
    );
    $stmt->execute([$taskPk]);
    $row = $stmt->fetch();
    if (!$row) {
        return;
    }

    $total = (int) $row['total'];
    $done = (int) $row['done_count'];
    $current = (string) $row['status'];

    if ($total > 0 && $done === $total) {
        $status = 'selesai';
    } elseif ($done > 0) {
        $status = 'dikerjakan';
    } elseif ($current === 'selesai' || $current === 'dikerjakan') {
        $status = 'belum';
    } else {
        return;
    }

    if ($status !== $current) {
        $pdo->prepare('UPDATE tasks SET `status` = ? WHERE pk = ?')->execute([$status, $taskPk]);
    }
}

/** Validasi field tugas. Mengembalikan array kolom yang siap disimpan. */
function task_values(array $data, bool $partial): array
{
    $values = [];

    if (!$partial || array_key_exists('title', $data)) {
        $title = clean_text($data['title'] ?? '', 200);
        if ($title === '') {
            fail('Nama tugas wajib diisi.');
        }
        $values['title'] = $title;
    }

    if (!$partial || array_key_exists('course', $data)) {
        $course = clean_text($data['course'] ?? '', 120);
        if ($course === '') {
            fail('Mata kuliah wajib dipilih.');
        }
        $values['course'] = $course;
    }

    if (!$partial || array_key_exists('deadline', $data)) {
        $deadline = clean_text($data['deadline'] ?? '', 10);
        if (!is_date_value($deadline)) {
            fail('Tanggal tenggat tidak valid.');
        }
        $values['deadline'] = $deadline;
    }

    if (array_key_exists('time', $data)) {
        $time = clean_text($data['time'] ?? '', 5, '23.59');
        if (!is_time_value($time)) {
            fail('Format waktu tidak valid.');
        }
        $values['time'] = $time;
    } elseif (!$partial) {
        $values['time'] = '23.59';
    }

    if (array_key_exists('priority', $data)) {
        $priority = clean_text($data['priority'] ?? '', 16, 'Sedang');
        if (!in_array($priority, PRIORITIES, true)) {
            fail('Prioritas tidak valid.');
        }
        $values['priority'] = $priority;
    } elseif (!$partial) {
        $values['priority'] = 'Sedang';
    }

    if (array_key_exists('status', $data)) {
        $status = clean_text($data['status'] ?? '', 16, 'belum');
        if (!in_array($status, TASK_STATUSES, true)) {
            fail('Status tugas tidak valid.');
        }
        $values['status'] = $status;
    } elseif (!$partial) {
        $values['status'] = 'belum';
    }

    if (array_key_exists('notes', $data)) {
        $values['notes'] = long_text($data['notes'] ?? '', 5000);
    } elseif (!$partial) {
        $values['notes'] = '';
    }

    if (array_key_exists('reminder', $data)) {
        $values['reminder'] = clean_text($data['reminder'] ?? '', 80, 'H-1 · 08.00');
    } elseif (!$partial) {
        $values['reminder'] = 'H-1 · 08.00';
    }

    return $values;
}

$pdo = db();
$method = request_method();
$taskId = $segments[2] ?? null;
$isSubtaskRoute = ($segments[3] ?? '') === 'subtasks';

// ---------------------------------------------------------------------------
// Koleksi tugas: GET /api/tasks, POST /api/tasks
// ---------------------------------------------------------------------------
if ($taskId === null) {
    $user = require_user();

    if ($method === 'GET') {
        $stmt = $pdo->prepare(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY position ASC, pk ASC'
        );
        $stmt->execute([$user['id']]);
        json_response(tasks_to_list($pdo, $stmt->fetchAll()));
    }

    if ($method === 'POST') {
        $data = body();
        $values = task_values($data, false);
        $id = clean_text($data['id'] ?? '', 80) ?: new_id('task');

        if (find_task($pdo, $user['id'], $id) !== null) {
            fail('ID tugas sudah dipakai.', 409);
        }

        $values['id'] = $id;
        $values['user_id'] = $user['id'];
        $values['position'] = first_task_position($pdo, $user['id']);

        $columns = array_keys($values);
        $sql = 'INSERT INTO tasks (`' . implode('`, `', $columns) . '`) VALUES ('
            . implode(', ', array_fill(0, count($columns), '?')) . ')';
        $pdo->prepare($sql)->execute(array_values($values));
        $taskPk = (int) $pdo->lastInsertId();

        if (array_key_exists('subtasks', $data)) {
            replace_subtasks($pdo, $taskPk, $data['subtasks']);
        }

        json_response(task_to_dict($pdo, find_task($pdo, $user['id'], $id) ?? []), 201);
    }

    method_not_allowed();
}

// ---------------------------------------------------------------------------
// Subtugas: /api/tasks/{id}/subtasks[/{subtaskId}]
// ---------------------------------------------------------------------------
if ($isSubtaskRoute) {
    $user = require_user();
    $task = find_task($pdo, $user['id'], $taskId);
    if ($task === null) {
        fail('Tugas tidak ditemukan.', 404);
    }
    $taskPk = (int) $task['pk'];
    $subtaskId = $segments[4] ?? null;

    $findSubtask = static function () use ($pdo, $taskPk, $subtaskId): ?array {
        $stmt = $pdo->prepare('SELECT * FROM subtasks WHERE task_pk = ? AND id = ?');
        $stmt->execute([$taskPk, $subtaskId]);
        $row = $stmt->fetch();
        return $row ?: null;
    };

    if ($subtaskId === null) {
        if ($method !== 'POST') {
            method_not_allowed();
        }
        $data = body();
        $title = clean_text($data['title'] ?? '', 200);
        if ($title === '') {
            fail('Nama subtugas wajib diisi.');
        }

        $stmt = $pdo->prepare('SELECT COUNT(*) FROM subtasks WHERE task_pk = ?');
        $stmt->execute([$taskPk]);

        $pdo->prepare(
            'INSERT INTO subtasks (id, task_pk, title, done, position) VALUES (?, ?, ?, ?, ?)'
        )->execute([
            clean_text($data['id'] ?? '', 80) ?: new_id('sub'),
            $taskPk,
            $title,
            bool_value($data['done'] ?? false) ? 1 : 0,
            (int) $stmt->fetchColumn(),
        ]);

        json_response(task_to_dict($pdo, $task), 201);
    }

    $subtask = $findSubtask();
    if ($subtask === null) {
        fail('Subtugas tidak ditemukan.', 404);
    }

    if ($method === 'PATCH') {
        $data = body();
        if (array_key_exists('title', $data)) {
            $title = clean_text($data['title'] ?? '', 200);
            if ($title === '') {
                fail('Nama subtugas wajib diisi.');
            }
            $pdo->prepare('UPDATE subtasks SET title = ? WHERE pk = ?')
                ->execute([$title, $subtask['pk']]);
        }
        if (array_key_exists('done', $data)) {
            $pdo->prepare('UPDATE subtasks SET done = ? WHERE pk = ?')
                ->execute([bool_value($data['done']) ? 1 : 0, $subtask['pk']]);
            recalc_task_status($pdo, $taskPk);
        }
        json_response(task_to_dict($pdo, find_task($pdo, $user['id'], $taskId)));
    }

    if ($method === 'DELETE') {
        $pdo->prepare('DELETE FROM subtasks WHERE pk = ?')->execute([$subtask['pk']]);
        json_response(task_to_dict($pdo, find_task($pdo, $user['id'], $taskId)));
    }

    method_not_allowed();
}

// ---------------------------------------------------------------------------
// Satu tugas: PATCH (ubah), PUT (upsert/undo), DELETE
// ---------------------------------------------------------------------------
$user = require_user();
$task = find_task($pdo, $user['id'], $taskId);

if ($method === 'PATCH') {
    if ($task === null) {
        fail('Tugas tidak ditemukan.', 404);
    }
    $data = body();
    $values = task_values($data, true);

    if ($values !== []) {
        $sets = [];
        $params = [];
        foreach ($values as $column => $value) {
            $sets[] = "`{$column}` = ?";
            $params[] = $value;
        }
        $params[] = $task['pk'];
        $pdo->prepare('UPDATE tasks SET ' . implode(', ', $sets) . ' WHERE pk = ?')
            ->execute($params);
    }

    if (array_key_exists('subtasks', $data)) {
        replace_subtasks($pdo, (int) $task['pk'], $data['subtasks']);
    }

    json_response(task_to_dict($pdo, find_task($pdo, $user['id'], $taskId)));
}

if ($method === 'PUT') {
    $data = body();
    $created = $task === null;

    if ($created) {
        $values = task_values($data, false);
        $values['id'] = $taskId;
        $values['user_id'] = $user['id'];
        $values['position'] = first_task_position($pdo, $user['id']);

        $columns = array_keys($values);
        $sql = 'INSERT INTO tasks (`' . implode('`, `', $columns) . '`) VALUES ('
            . implode(', ', array_fill(0, count($columns), '?')) . ')';
        $pdo->prepare($sql)->execute(array_values($values));
    } else {
        $values = task_values($data, true);
        if ($values !== []) {
            $sets = [];
            $params = [];
            foreach ($values as $column => $value) {
                $sets[] = "`{$column}` = ?";
                $params[] = $value;
            }
            $params[] = $task['pk'];
            $pdo->prepare('UPDATE tasks SET ' . implode(', ', $sets) . ' WHERE pk = ?')
                ->execute($params);
        }
        $taskId = $task['id'];
    }

    $saved = find_task($pdo, $user['id'], $taskId);
    if (array_key_exists('subtasks', $data)) {
        replace_subtasks($pdo, (int) $saved['pk'], $data['subtasks']);
    }

    json_response(task_to_dict($pdo, find_task($pdo, $user['id'], $taskId)), $created ? 201 : 200);
}

if ($method === 'DELETE') {
    if ($task === null) {
        fail('Tugas tidak ditemukan.', 404);
    }
    $pdo->prepare('DELETE FROM tasks WHERE pk = ?')->execute([$task['pk']]);
    json_response(['ok' => true]);
}

method_not_allowed();
