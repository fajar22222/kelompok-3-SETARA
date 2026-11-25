<?php
declare(strict_types=1);

function find_reminder(PDO $pdo, string $userId, string $reminderId): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM reminders WHERE user_id = ? AND id = ?');
    $stmt->execute([$userId, $reminderId]);
    $reminder = $stmt->fetch();
    return $reminder ?: null;
}

function reminder_values(array $data, bool $partial): array
{
    $values = [];

    if (!$partial || array_key_exists('title', $data)) {
        $title = clean_text($data['title'] ?? '', 200);
        if ($title === '') {
            fail('Judul pengingat wajib diisi.');
        }
        $values['title'] = $title;
    }

    if (array_key_exists('detail', $data)) {
        $values['detail'] = long_text($data['detail'] ?? '', 2000);
    } elseif (!$partial) {
        $values['detail'] = '';
    }

    if (!$partial || array_key_exists('date', $data)) {
        $date = clean_text($data['date'] ?? '', 10);
        if (!is_date_value($date)) {
            fail('Tanggal pengingat tidak valid.');
        }
        $values['date'] = $date;
    }

    if (!$partial || array_key_exists('time', $data)) {
        $time = clean_text($data['time'] ?? '', 5);
        if (!is_time_value($time)) {
            fail('Waktu pengingat tidak valid.');
        }
        $values['time'] = $time;
    }

    if (array_key_exists('kind', $data)) {
        $kind = clean_text($data['kind'] ?? '', 16, 'harian');
        if (!in_array($kind, REMINDER_KINDS, true)) {
            fail('Jenis pengingat tidak valid.');
        }
        $values['kind'] = $kind;
    } elseif (!$partial) {
        $values['kind'] = 'harian';
    }

    if (array_key_exists('enabled', $data)) {
        $values['enabled'] = bool_value($data['enabled']) ? 1 : 0;
    } elseif (!$partial) {
        $values['enabled'] = 1;
    }

    return $values;
}

$pdo = db();
$method = request_method();
$user = require_user();

// ---------------------------------------------------------------------------
// Pengingat kalender: PATCH /api/calendar-reminders/{id}
// ---------------------------------------------------------------------------
if (($segments[1] ?? '') === 'calendar-reminders') {
    $reminderId = $segments[2] ?? '';
    if ($method !== 'PATCH') {
        method_not_allowed();
    }

    $stmt = $pdo->prepare('SELECT * FROM calendar_reminders WHERE user_id = ? AND id = ?');
    $stmt->execute([$user['id'], $reminderId]);
    $reminder = $stmt->fetch();
    if (!$reminder) {
        fail('Pengingat kalender tidak ditemukan.', 404);
    }

    $data = body();
    $values = [];
    if (array_key_exists('enabled', $data)) {
        $values['enabled'] = bool_value($data['enabled']) ? 1 : 0;
    }
    if (array_key_exists('time', $data)) {
        $time = clean_text($data['time'] ?? '', 5);
        if (!is_time_value($time)) {
            fail('Waktu pengingat tidak valid.');
        }
        $values['time'] = $time;
    }
    if (array_key_exists('label', $data)) {
        $label = clean_text($data['label'] ?? '', 200);
        if ($label === '') {
            fail('Label pengingat wajib diisi.');
        }
        $values['label'] = $label;
    }

    if ($values !== []) {
        $sets = [];
        $params = [];
        foreach ($values as $column => $value) {
            $sets[] = "`{$column}` = ?";
            $params[] = $value;
        }
        $params[] = $reminder['pk'];
        $pdo->prepare('UPDATE calendar_reminders SET ' . implode(', ', $sets) . ' WHERE pk = ?')
            ->execute($params);
    }

    $stmt->execute([$user['id'], $reminderId]);
    json_response(calendar_reminder_to_dict($stmt->fetch()));
}

// ---------------------------------------------------------------------------
// Pengingat: /api/reminders[/{id}]
// ---------------------------------------------------------------------------
$reminderId = $segments[2] ?? null;

if ($reminderId === null) {
    if ($method === 'GET') {
        $stmt = $pdo->prepare(
            'SELECT * FROM reminders WHERE user_id = ? ORDER BY `time` ASC'
        );
        $stmt->execute([$user['id']]);
        json_response(array_map('reminder_to_dict', $stmt->fetchAll()));
    }

    if ($method === 'POST') {
        $data = body();
        $id = clean_text($data['id'] ?? '', 80) ?: new_id('rem');
        if (find_reminder($pdo, $user['id'], $id) !== null) {
            fail('ID pengingat sudah dipakai.', 409);
        }

        $values = reminder_values($data, false);
        $values['id'] = $id;
        $values['user_id'] = $user['id'];

        $columns = array_keys($values);
        $sql = 'INSERT INTO reminders (`' . implode('`, `', $columns) . '`) VALUES ('
            . implode(', ', array_fill(0, count($columns), '?')) . ')';
        $pdo->prepare($sql)->execute(array_values($values));

        json_response(reminder_to_dict(find_reminder($pdo, $user['id'], $id)), 201);
    }

    method_not_allowed();
}

$reminder = find_reminder($pdo, $user['id'], $reminderId);

if ($method === 'PATCH') {
    if ($reminder === null) {
        fail('Pengingat tidak ditemukan.', 404);
    }
    $values = reminder_values(body(), true);

    if ($values !== []) {
        $sets = [];
        $params = [];
        foreach ($values as $column => $value) {
            $sets[] = "`{$column}` = ?";
            $params[] = $value;
        }
        $params[] = $reminder['pk'];
        $pdo->prepare('UPDATE reminders SET ' . implode(', ', $sets) . ' WHERE pk = ?')
            ->execute($params);
    }

    json_response(reminder_to_dict(find_reminder($pdo, $user['id'], $reminderId)));
}

if ($method === 'PUT') {
    $data = body();
    $created = $reminder === null;

    if ($created) {
        $values = reminder_values($data, false);
        $values['id'] = $reminderId;
        $values['user_id'] = $user['id'];

        $columns = array_keys($values);
        $sql = 'INSERT INTO reminders (`' . implode('`, `', $columns) . '`) VALUES ('
            . implode(', ', array_fill(0, count($columns), '?')) . ')';
        $pdo->prepare($sql)->execute(array_values($values));
    } else {
        $values = reminder_values($data, true);
        if ($values !== []) {
            $sets = [];
            $params = [];
            foreach ($values as $column => $value) {
                $sets[] = "`{$column}` = ?";
                $params[] = $value;
            }
            $params[] = $reminder['pk'];
            $pdo->prepare('UPDATE reminders SET ' . implode(', ', $sets) . ' WHERE pk = ?')
                ->execute($params);
        }
    }

    json_response(
        reminder_to_dict(find_reminder($pdo, $user['id'], $reminderId)),
        $created ? 201 : 200
    );
}

if ($method === 'DELETE') {
    if ($reminder === null) {
        fail('Pengingat tidak ditemukan.', 404);
    }
    $pdo->prepare('DELETE FROM reminders WHERE pk = ?')->execute([$reminder['pk']]);
    json_response(['ok' => true]);
}

method_not_allowed();
