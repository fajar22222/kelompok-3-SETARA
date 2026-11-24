# SETARA — Backend PHP native + MySQL

API REST untuk SETARA tanpa framework/Composer. Dibuat untuk Laragon
(Apache + MySQL 8) tetapi juga bisa dijalankan dengan PHP built-in server.

## Struktur

```
backend-php/
  public/
    index.php        Front controller (semua request /api/... masuk ke sini)
    .htaccess        Rewrite + forward header Authorization (Apache)
    router.php       Router untuk PHP built-in server
  app/
    config.php       Koneksi DB, akun demo, CORS, Masa berlaku token
    bootstrap.php    Muat helper + autentikasi
    db.php           Koneksi PDO (MySQL, prepared statement)
    helpers.php      Validasi, CORS, respons JSON
    serializers.php  Bentuk payload API
    seed.php         Data contoh + akun demo
    auth_helpers.php Token Bearer (hash SHA-256 di database)
    routes/          auth, tasks, agendas, schedule, reminders, account
  sql/schema.sql     Skema MySQL 8 (utf8mb4, FK, ON DELETE CASCADE)
  sql/seed.sql       Data contoh akun demo, bisa di-import di phpMyAdmin
  bin/init-db.php    Buat tabel + akun demo
  bin/generate-seed-sql.php  Bangkitkan ulang seed.sql dari seed.json
  tests/api_test.php 62 pemeriksaan regresi API
```

## Cara 1 — Laragon (disarankan untuk demo)

1. Nyalakan **Start All** di Laragon (Apache + MySQL).
2. Salin folder `backend-php` ke `C:\laragon\www\setara-api`.
3. Buka `http://setara-api.test` → harus muncul pesan "API SETARA aktif".
   Laragon otomatis membuat virtual host. `.htaccess` di root meneruskan
   request ke `public/index.php`.
4. Buat database + akun demo lewat terminal:

   ```powershell
   cd C:\laragon\www\setara-api
   C:\laragon\bin\php\php-8.3.29-Win32-vs16-x64\php.exe bin\init-db.php
   ```

5. Arahkan frontend ke virtual host tersebut. Buat file `.env` di root proyek
   React (`D:\Tugas Besar RPL`):

   ```dotenv
   VITE_API_BASE=http://setara-api.test
   ```

   Lalu jalankan `npm run dev`. CORS sudah mengizinkan `http://localhost:5173`.

## Cara 2 — PHP built-in server (tanpa Apache)

```powershell
# dari folder backend-php
C:\laragon\bin\php\php-8.3.29-Win32-vs16-x64\php.exe bin\init-db.php
C:\laragon\bin\php\php-8.3.29-Win32-vs16-x64\php.exe -S 127.0.0.1:8000 -t public public/router.php
```

Ini adalah nilai default proxy Vite, jadi frontend cukup `npm run dev`
tanpa `.env`.

### Import lewat phpMyAdmin (alternatif)

Buat database `setara`, lalu import berurutan:

1. `sql/schema.sql`
2. `sql/seed.sql`

Keduanya mengisi 30 tugas, 92 subtugas, 13 jadwal, 3 agenda, 7 pengingat, dan
3 pengingat kalender untuk akun demo. File `seed.sql` dibangkitkan dari
`app/seed.json`; jalankan `php bin/generate-seed-sql.php` setelah mengubah data
contoh.

## Konfigurasi database

Ubah lewat environment variable bila perlu:

| Variable | Default |
| --- | --- |
| `SETARA_DB_HOST` | `127.0.0.1` |
| `SETARA_DB_PORT` | `3306` |
| `SETARA_DB_NAME` | `setara` |
| `SETARA_DB_USER` | `root` |
| `SETARA_DB_PASS` | kosong (default Laragon) |
| `SETARA_DEMO_EMAIL` | `aditya.pratama@kampus.ac.id` |
| `SETARA_DEMO_PASSWORD` | `setara123` |

Contoh di PowerShell:

```powershell
$env:SETARA_DB_PASS = "password-root-mysql"
php bin\init-db.php
```

Untuk MySQL di hosting lain, cukup ubah variabel yang sama — kode PHP tidak
perlu diubah.

## Endpoint

| Method | Path | Fungsi |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Daftar akun |
| `POST` | `/api/auth/login` | Masuk (mode demo: kredensial bebas) |
| `GET` | `/api/auth/me` | Akun aktif |
| `POST` | `/api/auth/logout` | Cabut token |
| `GET` | `/api/bootstrap` | Semua data akun |
| `GET/POST` | `/api/tasks` | Daftar / buat tugas |
| `PATCH/PUT/DELETE` | `/api/tasks/{id}` | Ubah / pulihkan / hapus tugas |
| `POST` | `/api/tasks/{id}/subtasks` | Tambah subtugas |
| `PATCH/DELETE` | `/api/tasks/{id}/subtasks/{sid}` | Ubah / hapus subtugas |
| `GET/POST` | `/api/agendas` | Daftar / buat agenda |
| `PATCH/PUT/DELETE` | `/api/agendas/{id}` | Ubah / pulihkan / hapus agenda |
| `GET/POST` | `/api/reminders` | Daftar / buat pengingat |
| `PATCH/PUT/DELETE` | `/api/reminders/{id}` | Ubah / pulihkan / hapus pengingat |
| `PATCH` | `/api/calendar-reminders/{id}` | Ubah pengingat kalender |
| `GET/POST` | `/api/sessions` | Daftar / tambah kelas mingguan |
| `PATCH/DELETE` | `/api/sessions/{id}` | Ubah / hapus kelas mingguan |
| `PUT/DELETE` | `/api/session-overrides/{sid}/{date}` | Override kelas |
| `GET/POST` | `/api/courses` | Mata kuliah |
| `PATCH` | `/api/profile` | Profil |
| `PATCH` | `/api/preferences` | Preferensi |
| `POST` | `/api/reset` | Pulihkan data contoh |
| `DELETE` | `/api/account` | Hapus akun |

Semua endpoint kecuali `auth/login`, `auth/register`, dan `health` memerlukan
header `Authorization: Bearer <token>`.

## Keamanan

- Password disimpan dengan `password_hash()` (bukan plain text).
- Token login disimpan di tabel `auth_tokens` sebagai hash SHA-256 dan bisa
  dicabut saat logout; berlaku 7 hari.
- Semua query memakai **prepared statement** (`PDO::prepare`), aman dari SQL
  injection.
- Kredensial MySQL hanya ada di sisi server (`app/config.php` / environment),
  tidak pernah dikirim ke browser.
- Mode login demo sengaja menerima kredensial apa pun agar alur presentasi
  tidak terhambat, sama seperti perilaku frontend local-first.

## Uji API

Dengan server berjalan:

```powershell
php tests\api_test.php
```

Harus muncul `SEMUA TES LULUS` (70 pemeriksaan: auth, isolasi akun, CRUD tugas,
subtugas, agenda, pengingat, jadwal mingguan, override, profil, reset, dan hapus
akun).
