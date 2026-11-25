<?php
declare(strict_types=1);

/**
 * Uji regresi API PHP terhadap server yang sedang berjalan:
 *   php -S 127.0.0.1:8000 -t public public/router.php
 * Lalu di terminal lain:
 *   php tests/api_test.php
 */

const BASE = 'http://127.0.0.1:8000/api';

$failures = 0;

function api(string $method, string $path, ?array $body = null, ?string $token = null): array
{
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token !== null) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }

    $options = [
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers),
            'ignore_errors' => true,
            'timeout' => 15,
        ],
    ];
    if ($body !== null) {
        $options['http']['content'] = json_encode($body, JSON_UNESCAPED_UNICODE);
    }

    $raw = @file_get_contents(BASE . $path, false, stream_context_create($options));
    $status = 0;
    foreach ($http_response_header ?? [] as $line) {
        if (preg_match('#^HTTP/\S+\s+(\d{3})#', $line, $matches)) {
            $status = (int) $matches[1];
        }
    }

    return [
        'status' => $status,
        'body' => json_decode((string) $raw, true),
        'raw' => (string) $raw,
    ];
}

function check(string $label, bool $condition, string $detail = ''): void
{
    global $failures;
    if ($condition) {
        echo "  ok   {$label}\n";
        return;
    }
    $failures++;
    echo "  FAIL {$label}" . ($detail !== '' ? " — {$detail}" : '') . "\n";
}

echo "== Health & auth demo ==\n";
$health = api('GET', '/health');
check('health 200', $health['status'] === 200, $health['raw']);
check('health body', ($health['body']['status'] ?? '') === 'ok');

$demo = api('POST', '/auth/login', [
    'email' => 'aditya.pratama@kampus.ac.id',
    'password' => 'setara123',
]);
check('login demo 200', $demo['status'] === 200, $demo['raw']);
check('login demo nama', ($demo['body']['profile']['name'] ?? '') === 'Aditya Pratama');
$demoToken = $demo['body']['token'] ?? '';

$bootstrap = api('GET', '/bootstrap', null, $demoToken);
check('bootstrap 200', $bootstrap['status'] === 200, $bootstrap['raw']);
check('bootstrap 30 tugas', count($bootstrap['body']['tasks'] ?? []) === 30);
check('bootstrap 13 sesi', count($bootstrap['body']['sessions'] ?? []) === 13);
check('bootstrap 3 agenda', count($bootstrap['body']['agendas'] ?? []) === 3);
check('bootstrap 7 pengingat', count($bootstrap['body']['reminders'] ?? []) === 7);
check('bootstrap 3 pengingat kalender', count($bootstrap['body']['calendarReminders'] ?? []) === 3);

$unauthorized = api('GET', '/tasks');
check('tanpa token 401', $unauthorized['status'] === 401, $unauthorized['raw']);

$wrong = api('POST', '/auth/login', [
    'email' => 'aditya.pratama@kampus.ac.id',
    'password' => 'salah',
]);
check('password salah 401', $wrong['status'] === 401, $wrong['raw']);

echo "\n== Registrasi & isolasi akun ==\n";
$email = 'uji.' . bin2hex(random_bytes(3)) . '@kampus.ac.id';
$register = api('POST', '/auth/register', [
    'name' => 'Rina Uji',
    'email' => $email,
    'password' => 'rahasia123',
    'prodi' => 'Sistem Informasi',
]);
check('register 201', $register['status'] === 201, $register['raw']);
check('register nama', ($register['body']['profile']['name'] ?? '') === 'Rina Uji');
check('register prodi', ($register['body']['profile']['prodi'] ?? '') === 'Sistem Informasi');
check('register tidak langsung login', !isset($register['body']['token']));

$duplicate = api('POST', '/auth/register', [
    'name' => 'Rina Uji',
    'email' => $email,
    'password' => 'rahasia123',
    'prodi' => 'Sistem Informasi',
]);
check('email duplikat 409', $duplicate['status'] === 409, $duplicate['raw']);

$invalidEmail = api('POST', '/auth/register', [
    'name' => 'Rina Uji',
    'email' => 'bukan-email',
    'password' => 'rahasia123',
    'prodi' => 'Sistem Informasi',
]);
check('email tidak valid 400', $invalidEmail['status'] === 400, $invalidEmail['raw']);

$login = api('POST', '/auth/login', [
    'email' => $email,
    'password' => 'rahasia123',
]);
check('login akun baru 200', $login['status'] === 200, $login['raw']);
$token = $login['body']['token'] ?? '';

$wrongNew = api('POST', '/auth/login', [
    'email' => $email,
    'password' => 'salah',
]);
check('password akun baru salah 401', $wrongNew['status'] === 401, $wrongNew['raw']);

$tasks = api('GET', '/tasks', null, $token);
check('akun baru punya 30 tugas contoh', count($tasks['body'] ?? []) === 30);
check('tugas punya subtugas', count($tasks['body'][0]['subtasks'] ?? []) > 0);

$otherEmail = 'lain.' . bin2hex(random_bytes(3)) . '@kampus.ac.id';
$unknown = api('POST', '/auth/login', [
    'email' => $otherEmail,
    'password' => 'apa-saja',
]);
check('email belum terdaftar ditolak', $unknown['status'] === 401, $unknown['raw']);

api('POST', '/auth/register', [
    'name' => 'Akun Lain',
    'email' => $otherEmail,
    'password' => 'rahasia123',
    'prodi' => 'Ilmu Data',
]);
$other = api('POST', '/auth/login', [
    'email' => $otherEmail,
    'password' => 'rahasia123',
]);
check('login akun kedua 200', $other['status'] === 200, $other['raw']);
$otherToken = $other['body']['token'] ?? '';
$otherTasks = api('GET', '/tasks', null, $otherToken);
check('akun kedua terpisah', count($otherTasks['body'] ?? []) === 30);

echo "\n== CRUD tugas & subtugas ==\n";
$created = api('POST', '/tasks', [
    'id' => 'task-uji',
    'title' => 'Uji coba tugas',
    'course' => 'Komputasi Awan',
    'deadline' => '2026-12-01',
    'time' => '10.00',
    'priority' => 'Tinggi',
    'notes' => 'Catatan uji',
    'subtasks' => [
        ['id' => 'sub-uji-1', 'title' => 'Langkah satu', 'done' => false],
        ['id' => 'sub-uji-2', 'title' => 'Langkah dua', 'done' => false],
    ],
], $token);
check('buat tugas 201', $created['status'] === 201, $created['raw']);
check('subtugas tersimpan', count($created['body']['subtasks'] ?? []) === 2);
check('prioritas tersimpan', ($created['body']['priority'] ?? '') === 'Tinggi');

$listAfterCreate = api('GET', '/tasks', null, $token);
check('tugas baru di urutan pertama', ($listAfterCreate['body'][0]['id'] ?? '') === 'task-uji');

$patched = api('PATCH', '/tasks/task-uji', [
    'time' => '11.30',
    'status' => 'review',
], $token);
check('patch tugas 200', $patched['status'] === 200, $patched['raw']);
check('patch waktu', ($patched['body']['time'] ?? '') === '11.30');
check('patch status', ($patched['body']['status'] ?? '') === 'review');

$subtask = api('POST', '/tasks/task-uji/subtasks', [
    'id' => 'sub-uji-3',
    'title' => 'Langkah tiga',
], $token);
check('tambah subtugas 201', $subtask['status'] === 201, $subtask['raw']);
check('subtugas jadi 3', count($subtask['body']['subtasks'] ?? []) === 3);

$toggle = api('PATCH', '/tasks/task-uji/subtasks/sub-uji-1', ['done' => true], $token);
check('centang subtugas 200', $toggle['status'] === 200, $toggle['raw']);
check('status otomatis dikerjakan', ($toggle['body']['status'] ?? '') === 'dikerjakan');

api('PATCH', '/tasks/task-uji/subtasks/sub-uji-2', ['done' => true], $token);
$allDone = api('PATCH', '/tasks/task-uji/subtasks/sub-uji-3', ['done' => true], $token);
check('semua subtugas selesai → status selesai', ($allDone['body']['status'] ?? '') === 'selesai');

$removeSub = api('DELETE', '/tasks/task-uji/subtasks/sub-uji-3', null, $token);
check('hapus subtugas 200', $removeSub['status'] === 200, $removeSub['raw']);
check('subtugas sisa 2', count($removeSub['body']['subtasks'] ?? []) === 2);

$deleted = api('DELETE', '/tasks/task-uji', null, $token);
check('hapus tugas 200', $deleted['status'] === 200, $deleted['raw']);
$afterDelete = api('GET', '/tasks', null, $token);
$ids = array_column($afterDelete['body'] ?? [], 'id');
check('tugas terhapus dari daftar', !in_array('task-uji', $ids, true));

$restored = api('PUT', '/tasks/task-uji', [
    'title' => 'Uji coba tugas',
    'course' => 'Komputasi Awan',
    'deadline' => '2026-12-01',
    'time' => '10.00',
    'priority' => 'Tinggi',
    'status' => 'belum',
    'subtasks' => [],
], $token);
check('undo tugas (PUT) 201', $restored['status'] === 201, $restored['raw']);

echo "\n== Agenda ==\n";
$agenda = api('POST', '/agendas', [
    'id' => 'agenda-uji',
    'title' => 'Rapat uji',
    'date' => '2026-11-25',
    'time' => '09.00',
    'endTime' => '10.00',
    'type' => 'deadline',
    'location' => 'Lab 3',
], $token);
check('buat agenda 201', $agenda['status'] === 201, $agenda['raw']);
check('lokasi agenda', ($agenda['body']['location'] ?? '') === 'Lab 3');
check('endTime agenda', ($agenda['body']['endTime'] ?? '') === '10.00');

$agendaPatch = api('PATCH', '/agendas/agenda-uji', ['title' => 'Rapat uji revisi'], $token);
check('patch agenda 200', $agendaPatch['status'] === 200, $agendaPatch['raw']);
check('judul agenda berubah', ($agendaPatch['body']['title'] ?? '') === 'Rapat uji revisi');

$invalidAgenda = api('POST', '/agendas', [
    'title' => 'Agenda salah',
    'date' => '2026-02-31',
    'time' => '09.00',
], $token);
check('tanggal tidak valid ditolak', $invalidAgenda['status'] === 400, $invalidAgenda['raw']);

$agendaDelete = api('DELETE', '/agendas/agenda-uji', null, $token);
check('hapus agenda 200', $agendaDelete['status'] === 200, $agendaDelete['raw']);

echo "\n== Pengingat ==\n";
$reminder = api('POST', '/reminders', [
    'id' => 'rem-uji',
    'title' => 'Minum air',
    'detail' => 'Setiap dua jam',
    'date' => '2026-11-26',
    'time' => '08.00',
    'kind' => 'harian',
    'enabled' => true,
], $token);
check('buat pengingat 201', $reminder['status'] === 201, $reminder['raw']);
check('pengingat aktif', ($reminder['body']['enabled'] ?? false) === true);

$reminderPatch = api('PATCH', '/reminders/rem-uji', ['enabled' => false], $token);
check('nonaktifkan pengingat', ($reminderPatch['body']['enabled'] ?? true) === false);

$reminderDelete = api('DELETE', '/reminders/rem-uji', null, $token);
check('hapus pengingat 200', $reminderDelete['status'] === 200, $reminderDelete['raw']);

$calendarPatch = api('PATCH', '/calendar-reminders/cal-01', ['enabled' => false], $token);
check('ubah pengingat kalender 200', $calendarPatch['status'] === 200, $calendarPatch['raw']);
check('pengingat kalender nonaktif', ($calendarPatch['body']['enabled'] ?? true) === false);

echo "\n== Mata kuliah, sesi, override ==\n";
$courses = api('GET', '/courses', null, $token);
check('daftar mata kuliah 200', $courses['status'] === 200);
check('5 mata kuliah bawaan', count($courses['body']['builtin'] ?? []) === 5);

$custom = api('POST', '/courses', ['name' => 'Analisis Data'], $token);
check('tambah mata kuliah 201', $custom['status'] === 201, $custom['raw']);
check('mata kuliah baru', ($custom['body']['name'] ?? '') === 'Analisis Data');

$duplicate = api('POST', '/courses', ['name' => '  analisis   data  '], $token);
check('duplikat tidak dibuat ulang', ($duplicate['body']['created'] ?? true) === false);

$newSession = api('POST', '/sessions', [
    'id' => 'ses-uji',
    'course' => 'Analisis Data',
    'day' => 3,
    'start' => '07.00',
    'end' => '08.40',
    'room' => 'R. 501',
    'status' => 'terjadwal',
], $token);
check('tambah sesi 201', $newSession['status'] === 201, $newSession['raw']);
check('sesi tersimpan', ($newSession['body']['course'] ?? '') === 'Analisis Data');

$badSession = api('POST', '/sessions', [
    'course' => 'Uji waktu',
    'day' => 1,
    'start' => '10.00',
    'end' => '09.00',
    'room' => '',
], $token);
check('waktu sesi terbalik ditolak', $badSession['status'] === 400, $badSession['raw']);

$sessionPatch = api('PATCH', '/sessions/ses-uji', [
    'room' => 'R. 502',
    'end' => '09.00',
], $token);
check('ubah sesi 200', $sessionPatch['status'] === 200, $sessionPatch['raw']);
check('ruang sesi berubah', ($sessionPatch['body']['room'] ?? '') === 'R. 502');
check('jam selesai berubah', ($sessionPatch['body']['end'] ?? '') === '09.00');

$bootSessions = api('GET', '/bootstrap', null, $token);
$sessionIds = array_column($bootSessions['body']['sessions'] ?? [], 'id');
check('sesi baru masuk bootstrap', in_array('ses-uji', $sessionIds, true));

$sessionDelete = api('DELETE', '/sessions/ses-uji', null, $token);
check('hapus sesi 200', $sessionDelete['status'] === 200, $sessionDelete['raw']);
$bootAfterDelete = api('GET', '/bootstrap', null, $token);
$sessionIds = array_column($bootAfterDelete['body']['sessions'] ?? [], 'id');
check('sesi terhapus dari daftar', !in_array('ses-uji', $sessionIds, true));

$override = api('PUT', '/session-overrides/ses-01/2026-11-20', [
    'title' => 'Kelas pengganti',
    'start' => '13.00',
    'end' => '14.40',
    'room' => 'R. 402',
    'type' => 'kelas',
], $token);
check('simpan override 201', $override['status'] === 201, $override['raw']);
check('judul override', ($override['body']['title'] ?? '') === 'Kelas pengganti');

$bootWithOverride = api('GET', '/bootstrap', null, $token);
check('override masuk bootstrap', count($bootWithOverride['body']['sessionOverrides'] ?? []) === 1);
check('mata kuliah kustom masuk bootstrap', in_array('Analisis Data', $bootWithOverride['body']['customCourses'] ?? [], true));

$overrideDelete = api('DELETE', '/session-overrides/ses-01/2026-11-20', null, $token);
check('hapus override 200', $overrideDelete['status'] === 200);

echo "\n== Profil, preferensi, reset, hapus akun ==\n";
$profile = api('PATCH', '/profile', [
    'name' => 'Rina Uji Revisi',
    'nim' => '221500001',
    'email' => $email,
], $token);
check('ubah profil 200', $profile['status'] === 200, $profile['raw']);
check('nama profil berubah', ($profile['body']['profile']['name'] ?? '') === 'Rina Uji Revisi');

$prefs = api('PATCH', '/preferences', ['pushNotif' => false, 'compactMode' => true], $token);
check('ubah preferensi 200', $prefs['status'] === 200, $prefs['raw']);
check('pushNotif false', ($prefs['body']['preferences']['pushNotif'] ?? true) === false);
check('compactMode true', ($prefs['body']['preferences']['compactMode'] ?? false) === true);

$reset = api('POST', '/reset', null, $token);
check('reset 200', $reset['status'] === 200, $reset['raw']);
check('reset 30 tugas', count($reset['body']['tasks'] ?? []) === 30);
check('reset mempertahankan nama', ($reset['body']['profile']['name'] ?? '') === 'Rina Uji Revisi');
check('reset mempertahankan nim', ($reset['body']['profile']['nim'] ?? '') === '221500001');

$deleteAccount = api('DELETE', '/account', null, $token);
check('hapus akun 200', $deleteAccount['status'] === 200, $deleteAccount['raw']);
$afterAccountDelete = api('GET', '/bootstrap', null, $token);
check('token akun terhapus tidak berlaku', $afterAccountDelete['status'] === 401);

api('DELETE', '/account', null, $otherToken);

echo "\n";
if ($failures === 0) {
    echo "SEMUA TES LULUS\n";
    exit(0);
}
echo "{$failures} TES GAGAL\n";
exit(1);
