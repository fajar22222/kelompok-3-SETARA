<?php
declare(strict_types=1);

/**
 * Bangkitkan sql/seed.sql dari app/seed.json.
 * Dipakai bila database ingin diisi lewat phpMyAdmin tanpa menjalankan PHP API.
 *
 *   php bin/generate-seed-sql.php
 */

if (PHP_SAPI !== 'cli') {
    exit("Skrip ini hanya boleh dijalankan dari terminal.\n");
}

function sql_text(string $value): string
{
    $value = str_replace(
        ["\\", "'", "\n", "\r", "\0"],
        ["\\\\", "''", "\\n", "\\r", "\\0"],
        $value
    );
    return "'" . $value . "'";
}

function sql_nullable(mixed $value): string
{
    if ($value === null || $value === '') {
        return 'NULL';
    }
    return sql_text((string) $value);
}

function sql_bool(mixed $value): string
{
    return !empty($value) ? '1' : '0';
}

$seed = json_decode((string) file_get_contents(__DIR__ . '/../app/seed.json'), true) ?: [];
$config = require __DIR__ . '/../app/config.php';

$email = strtolower((string) $config['demo_email']);
$passwordHash = password_hash((string) $config['demo_password'], PASSWORD_DEFAULT);
$profile = $seed['profile'] ?? [];
$preferences = json_encode($seed['preferences'] ?? [], JSON_UNESCAPED_UNICODE);

$lines = [
    '-- SETARA — data contoh akun demo (dihasilkan otomatis dari app/seed.json)',
    '-- Import lewat phpMyAdmin setelah sql/schema.sql.',
    '',
    'USE `setara`;',
    'SET FOREIGN_KEY_CHECKS = 0;',
    'DELETE FROM `users` WHERE `id` = \'user-demo\';',
    'SET FOREIGN_KEY_CHECKS = 1;',
    '',
    'INSERT INTO `users`',
    '  (`id`, `name`, `email`, `password_hash`, `nim`, `prodi`, `semester`, `university`, `preferences`, `custom_courses`)',
    'VALUES ('
        . sql_text('user-demo') . ', '
        . sql_text((string) ($profile['name'] ?? 'Aditya Pratama')) . ', '
        . sql_text($email) . ', '
        . sql_text($passwordHash) . ', '
        . sql_text((string) ($profile['nim'] ?? '')) . ', '
        . sql_text((string) ($profile['prodi'] ?? 'Ilmu Komputer')) . ', '
        . sql_text((string) ($profile['semester'] ?? 'Semester 5')) . ', '
        . sql_text((string) ($profile['university'] ?? 'Universitas Halu Oleo')) . ', '
        . sql_text((string) $preferences) . ", '[]');",
    '',
];

$lines[] = '-- Tugas';
$lines[] = 'INSERT INTO `tasks` (`id`, `user_id`, `title`, `course`, `deadline`, `time`, `priority`, `status`, `notes`, `reminder`, `position`) VALUES';
$taskRows = [];
foreach ($seed['tasks'] ?? [] as $index => $task) {
    $taskRows[] = '  ('
        . sql_text((string) ($task['id'] ?? 'task-' . ($index + 1))) . ', '
        . sql_text('user-demo') . ', '
        . sql_text((string) ($task['title'] ?? 'Tugas')) . ', '
        . sql_text((string) ($task['course'] ?? 'Rekayasa Perangkat Lunak')) . ', '
        . sql_text((string) ($task['deadline'] ?? '2026-11-12')) . ', '
        . sql_text((string) ($task['time'] ?? '23.59')) . ', '
        . sql_text((string) ($task['priority'] ?? 'Sedang')) . ', '
        . sql_text((string) ($task['status'] ?? 'belum')) . ', '
        . sql_text((string) ($task['notes'] ?? '')) . ', '
        . sql_text((string) ($task['reminder'] ?? 'H-1 · 08.00')) . ', '
        . (int) $index . ')';
}
$lines[] = implode(",\n", $taskRows) . ';';
$lines[] = '';

$subtaskRows = [];
foreach ($seed['tasks'] ?? [] as $task) {
    $taskId = (string) ($task['id'] ?? '');
    foreach ($task['subtasks'] ?? [] as $index => $subtask) {
        $subtaskRows[] = '  ('
            . sql_text((string) ($subtask['id'] ?? 'sub-' . ($index + 1))) . ', '
            . '(SELECT `pk` FROM `tasks` WHERE `user_id` = \'user-demo\' AND `id` = ' . sql_text($taskId) . '), '
            . sql_text((string) ($subtask['title'] ?? 'Subtugas')) . ', '
            . sql_bool($subtask['done'] ?? false) . ', '
            . (int) $index . ')';
    }
}
if ($subtaskRows !== []) {
    $lines[] = '-- Subtugas';
    $lines[] = 'INSERT INTO `subtasks` (`id`, `task_pk`, `title`, `done`, `position`) VALUES';
    $lines[] = implode(",\n", $subtaskRows) . ';';
    $lines[] = '';
}

$lines[] = '-- Jadwal kelas';
$lines[] = 'INSERT INTO `class_sessions` (`id`, `user_id`, `course`, `day`, `start`, `end`, `room`, `status`) VALUES';
$sessionRows = [];
foreach ($seed['sessions'] ?? [] as $session) {
    $sessionRows[] = '  ('
        . sql_text((string) ($session['id'] ?? 'ses')) . ', '
        . sql_text('user-demo') . ', '
        . sql_text((string) ($session['course'] ?? '')) . ', '
        . (int) ($session['day'] ?? 1) . ', '
        . sql_text((string) ($session['start'] ?? '08.00')) . ', '
        . sql_text((string) ($session['end'] ?? '09.40')) . ', '
        . sql_text((string) ($session['room'] ?? '')) . ', '
        . sql_text((string) ($session['status'] ?? 'terjadwal')) . ')';
}
$lines[] = implode(",\n", $sessionRows) . ';';
$lines[] = '';

$lines[] = '-- Agenda';
$lines[] = 'INSERT INTO `agendas` (`id`, `user_id`, `title`, `date`, `time`, `end_time`, `type`, `location`) VALUES';
$agendaRows = [];
foreach ($seed['agendas'] ?? [] as $agenda) {
    $agendaRows[] = '  ('
        . sql_text((string) ($agenda['id'] ?? 'agenda')) . ', '
        . sql_text('user-demo') . ', '
        . sql_text((string) ($agenda['title'] ?? '')) . ', '
        . sql_text((string) ($agenda['date'] ?? '2026-11-12')) . ', '
        . sql_text((string) ($agenda['time'] ?? '08.00')) . ', '
        . sql_nullable($agenda['endTime'] ?? null) . ', '
        . sql_text((string) ($agenda['type'] ?? 'lainnya')) . ', '
        . sql_nullable($agenda['location'] ?? null) . ')';
}
$lines[] = implode(",\n", $agendaRows) . ';';
$lines[] = '';

$lines[] = '-- Pengingat';
$lines[] = 'INSERT INTO `reminders` (`id`, `user_id`, `title`, `detail`, `date`, `time`, `enabled`, `kind`) VALUES';
$reminderRows = [];
foreach ($seed['reminders'] ?? [] as $reminder) {
    $reminderRows[] = '  ('
        . sql_text((string) ($reminder['id'] ?? 'rem')) . ', '
        . sql_text('user-demo') . ', '
        . sql_text((string) ($reminder['title'] ?? '')) . ', '
        . sql_text((string) ($reminder['detail'] ?? '')) . ', '
        . sql_text((string) ($reminder['date'] ?? '2026-11-12')) . ', '
        . sql_text((string) ($reminder['time'] ?? '08.00')) . ', '
        . sql_bool($reminder['enabled'] ?? true) . ', '
        . sql_text((string) ($reminder['kind'] ?? 'harian')) . ')';
}
$lines[] = implode(",\n", $reminderRows) . ';';
$lines[] = '';

$lines[] = '-- Pengingat kalender';
$lines[] = 'INSERT INTO `calendar_reminders` (`id`, `user_id`, `time`, `label`, `enabled`) VALUES';
$calendarRows = [];
foreach ($seed['calendarReminders'] ?? [] as $reminder) {
    $calendarRows[] = '  ('
        . sql_text((string) ($reminder['id'] ?? 'cal')) . ', '
        . sql_text('user-demo') . ', '
        . sql_text((string) ($reminder['time'] ?? '08.00')) . ', '
        . sql_text((string) ($reminder['label'] ?? '')) . ', '
        . sql_bool($reminder['enabled'] ?? true) . ')';
}
$lines[] = implode(",\n", $calendarRows) . ';';
$lines[] = '';
$lines[] = '-- Selesai. Akun demo: ' . $email . ' / ' . (string) $config['demo_password'];
$lines[] = '';

$target = __DIR__ . '/../sql/seed.sql';
file_put_contents($target, implode("\n", $lines));
echo "Dibuat: {$target}\n";
