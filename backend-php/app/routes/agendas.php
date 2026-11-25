<?php
declare(strict_types=1);

function find_agenda(PDO $pdo, string $userId, string $agendaId): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM agendas WHERE user_id = ? AND id = ?');
    $stmt->execute([$userId, $agendaId]);
    $agenda = $stmt->fetch();
    return $agenda ?: null;
}

function agenda_values(array $data, bool $partial): array
{
    $values = [];

    if (!$partial || array_key_exists('title', $data)) {
        $title = clean_text($data['title'] ?? '', 200);
        if ($title === '') {
            fail('Judul agenda wajib diisi.');
        }
        $values['title'] = $title;
    }

    if (!$partial || array_key_exists('date', $data)) {
        $date = clean_text($data['date'] ?? '', 10);
        if (!is_date_value($date)) {
            fail('Tanggal agenda tidak valid.');
        }
        $values['date'] = $date;
    }

    if (!$partial || array_key_exists('time', $data)) {
        $time = clean_text($data['time'] ?? '', 5);
        if (!is_time_value($time)) {
            fail('Waktu mulai tidak valid.');
        }
        $values['time'] = $time;
    }

    if (array_key_exists('endTime', $data)) {
        $endTime = clean_text($data['endTime'] ?? '', 5);
        if ($endTime !== '' && !is_time_value($endTime)) {
            fail('Waktu selesai tidak valid.');
        }
        $values['end_time'] = $endTime === '' ? null : $endTime;
    } elseif (!$partial) {
        $values['end_time'] = null;
    }

    if (array_key_exists('type', $data)) {
        $type = clean_text($data['type'] ?? '', 16, 'lainnya');
        if (!in_array($type, AGENDA_TYPES, true)) {
            fail('Kategori agenda tidak valid.');
        }
        $values['type'] = $type;
    } elseif (!$partial) {
        $values['type'] = 'lainnya';
    }

    if (array_key_exists('location', $data)) {
        $values['location'] = clean_location($data['location'] ?? null);
    } elseif (!$partial) {
        $values['location'] = null;
    }

    return $values;
}

$pdo = db();
$method = request_method();
$agendaId = $segments[2] ?? null;
$user = require_user();

if ($agendaId === null) {
    if ($method === 'GET') {
        $stmt = $pdo->prepare(
            'SELECT * FROM agendas WHERE user_id = ? ORDER BY date ASC, `time` ASC'
        );
        $stmt->execute([$user['id']]);
        json_response(array_map('agenda_to_dict', $stmt->fetchAll()));
    }

    if ($method === 'POST') {
        $data = body();
        $id = clean_text($data['id'] ?? '', 80) ?: new_id('agenda');
        if (find_agenda($pdo, $user['id'], $id) !== null) {
            fail('ID agenda sudah dipakai.', 409);
        }

        $values = agenda_values($data, false);
        $values['id'] = $id;
        $values['user_id'] = $user['id'];

        $columns = array_keys($values);
        $sql = 'INSERT INTO agendas (`' . implode('`, `', $columns) . '`) VALUES ('
            . implode(', ', array_fill(0, count($columns), '?')) . ')';
        $pdo->prepare($sql)->execute(array_values($values));

        json_response(agenda_to_dict(find_agenda($pdo, $user['id'], $id)), 201);
    }

    method_not_allowed();
}

$agenda = find_agenda($pdo, $user['id'], $agendaId);

if ($method === 'PATCH') {
    if ($agenda === null) {
        fail('Agenda tidak ditemukan.', 404);
    }
    $values = agenda_values(body(), true);

    if ($values !== []) {
        $sets = [];
        $params = [];
        foreach ($values as $column => $value) {
            $sets[] = "`{$column}` = ?";
            $params[] = $value;
        }
        $params[] = $agenda['pk'];
        $pdo->prepare('UPDATE agendas SET ' . implode(', ', $sets) . ' WHERE pk = ?')
            ->execute($params);
    }

    json_response(agenda_to_dict(find_agenda($pdo, $user['id'], $agendaId)));
}

if ($method === 'PUT') {
    $data = body();
    $created = $agenda === null;

    if ($created) {
        $values = agenda_values($data, false);
        $values['id'] = $agendaId;
        $values['user_id'] = $user['id'];

        $columns = array_keys($values);
        $sql = 'INSERT INTO agendas (`' . implode('`, `', $columns) . '`) VALUES ('
            . implode(', ', array_fill(0, count($columns), '?')) . ')';
        $pdo->prepare($sql)->execute(array_values($values));
    } else {
        $values = agenda_values($data, true);
        if ($values !== []) {
            $sets = [];
            $params = [];
            foreach ($values as $column => $value) {
                $sets[] = "`{$column}` = ?";
                $params[] = $value;
            }
            $params[] = $agenda['pk'];
            $pdo->prepare('UPDATE agendas SET ' . implode(', ', $sets) . ' WHERE pk = ?')
                ->execute($params);
        }
    }

    json_response(
        agenda_to_dict(find_agenda($pdo, $user['id'], $agendaId)),
        $created ? 201 : 200
    );
}

if ($method === 'DELETE') {
    if ($agenda === null) {
        fail('Agenda tidak ditemukan.', 404);
    }
    $pdo->prepare('DELETE FROM agendas WHERE pk = ?')->execute([$agenda['pk']]);
    json_response(['ok' => true]);
}

method_not_allowed();
