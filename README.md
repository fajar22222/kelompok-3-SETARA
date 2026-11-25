# SETARA

# SETARA — Paket Distribusi Tim

**Sistem Tugas dan Agenda Rencana Akademik** (SETARA) adalah aplikasi web untuk
mengelola tugas kuliah, subtugas, jadwal kelas, agenda kalender, pengingat,
progres, dan profil mahasiswa. Frontend dibangun dengan React + TypeScript +
Vite, backend memakai PHP native (tanpa framework/Composer) dengan MySQL,
dan `localStorage` dipakai sebagai cache sekaligus cadangan offline.

## Arsitektur Sistem

```
Browser React (Vite, port 5173)
        │  fetch JSON + Authorization: Bearer <token>
        ▼
Vite proxy  /api  ──►  PHP API (port 8000)
                          │  PDO + prepared statement
                          ▼
                   MySQL "setara" (port 3306)
                          │  salinan
                          ▼
                   localStorage per akun (offline fallback)
```

Komponen utama:

| Lapisan | Teknologi | Lokasi |
| --- | --- | --- |
| UI | React 19 + TypeScript + Tailwind CSS 4 | `src/` |
| State & sync API | React Context + fetch | `src/context/app-context.tsx`, `src/lib/api.ts` |
| API | PHP native + PDO | `backend-php/app/`, `backend-php/public/index.php` |
| Database | MySQL 8 | `backend-php/sql/schema.sql`, `sql/seed.sql` |
| Autentikasi | Token Bearer, hash SHA-256 di DB, password `password_hash()` | `backend-php/app/auth_helpers.php` |

Endpoint penting: `/api/auth/login`, `/api/auth/register`, `/api/bootstrap`,
`/api/tasks`, `/api/sessions`, `/api/agendas`, `/api/reminders`, `/api/profile`,
`/api/preferences`, `/api/reset`.

## Cara Menjalankan

### 1. Frontend

```powershell
cd "D:\Tugas Besar RPL"
npm install
npm run dev
```

Buka `http://localhost:5173`.

### 2. Backend PHP + MySQL (Laragon)
> **Catatan distribusi:** branch `main` saat ini berisi **kerangka** — 9 halaman
> di `src/pages/*.tsx` sengaja berupa placeholder dan `backend-php/` tidak
> disertakan. Implementasi lengkap ada di 5 file zip dalam
> `Distribusi_Tim_SETARA/` (folder tersebut masuk `.gitignore`).

**Sistem Tugas dan Agenda Rencana Akademik** — aplikasi web untuk mengelola
tugas kuliah, subtugas, jadwal kelas, agenda kalender, pengingat, progres, dan
profil mahasiswa.

Frontend React + TypeScript + Vite. Data utama disimpan di **MySQL** melalui
API PHP native di `backend-php/`. Salinan di `localStorage` dipakai sebagai
cache sekaligus cadangan, sehingga aplikasi tetap bisa dipakai saat server
tidak berjalan.

## Fitur

- Autentikasi: registrasi (nama, email, program studi, kata sandi), login dengan
  verifikasi kata sandi, dan logout. Akun baru tersimpan di database.
- Dashboard ringkasan: progres semester, tugas aktif, agenda hari ini, jadwal,
  pengingat, dan tugas prioritas.
- Tugas: tambah, ubah, hapus + undo, checklist subtugas, catatan, filter, dan
  status otomatis (`belum` → `dikerjakan` → `selesai`).
- Jadwal kuliah: tambah, ubah, hapus + undo jadwal mingguan; edit/sembunyikan
  kelas per tanggal lewat kalender.
- Kalender: agenda per tanggal, agenda kelas dari jadwal mingguan, tambah/ubah/
  hapus agenda dengan undo.
- Pengingat: kategori, aktif/nonaktif, dan pengingat kalender.
- Progres: statistik dan distribusi tugas.
- Pengaturan: profil, preferensi, ekspor cadangan JSON, pulihkan data contoh,
  tema terang/gelap/sistem, dan keluar akun.
- Data tersimpan di MySQL per akun; salinan lokal menjaga aplikasi tetap
  berjalan offline dan mempercepat tampilan setelah reload.

## Palet Warna

Palet terpusat di `src/index.css` sebagai CSS variable (light & dark otomatis):

| Peran | Light | Dark |
| --- | --- | --- |
| Utama / brand (ungu akademik) | `#6D5DF6` | `#A99DFB` |
| Aksen hangat | `#F59E0B` | `#FBBF24` |
| Latar | `#F4F4F6` | `#09090B` |
| Permukaan kartu | `#FFFFFF` | `#18181B` |
| Sukses | `#10B981` | `#34D399` |
| Bahaya | `#E11D48` | `#FB7185` |

Warna mata kuliah tetap didefinisikan per mata kuliah di
`src/data/seed.ts` (`COURSE_META`) agar tiap kelas mudah dibedakan.

## Struktur

```
src/                 Frontend React
  components/        Komponen UI
  context/           State aplikasi + sinkronisasi API/localStorage
  data/seed.ts       Data contoh awal
  lib/api.ts         Lapisan request ke API PHP + manajemen token
  lib/session.ts     Sesi login (setara-auth, setara-users)
  lib/storage.ts     Cache data per akun (setara-data:<email>)
  pages/             Halaman aplikasi
backend-php/         API PHP native + MySQL (digunakan frontend)
  public/            Front controller, .htaccess, router built-in server
  app/               Koneksi PDO, auth token, validasi, serializer, route
  sql/schema.sql     Skema MySQL 8
  sql/seed.sql       Data contoh untuk import phpMyAdmin
  bin/init-db.php    Inisialisasi database + akun demo
  tests/api_test.php Tes regresi API
```

## Menjalankan Aplikasi

### Mode lengkap (React + PHP + MySQL)

1. Nyalakan **Start All** di Laragon (Apache + MySQL).
2. Inisialisasi database sekali:

   ```powershell
   cd "D:\Tugas Besar RPL\backend-php"
   C:\laragon\bin\php\php-8.3.29-Win32-vs16-x64\php.exe bin\init-db.php
   C:\laragon\bin\php\php-8.3.29-Win32-vs16-x64\php.exe -S 127.0.0.1:8000 -t public public/router.php
   ```

3. Proxy Vite sudah mengarah ke `http://127.0.0.1:8000`. Untuk memakai
   virtual host Laragon, isi `.env` dengan `VITE_API_BASE=http://setara-api.test`.

### 3. Akun Demo
3. Di terminal lain:

   ```powershell
   cd "D:\Tugas Besar RPL"
   npm install
   npm run dev
   ```

Buka `http://localhost:5173`. Detail Laragon/virtual host dan konfigurasi
database ada di [`backend-php/README.md`](backend-php/README.md).

### Mode offline (frontend saja)

Jalankan `npm run dev` tanpa backend. Aplikasi memakai `localStorage` per akun
dan semua fitur tetap berfungsi. Begitu backend tersedia, data akan
disinkronkan lagi saat login berikutnya.

```powershell
npm run dev        # jalankan frontend (port 5173)
npm run build      # build produksi + cek TypeScript
npm run lint       # lint frontend
npm run preview    # pratinjau hasil build
```

### Akun demo

| Email | Kata sandi |
| --- | --- |
| `aditya.pratama@kampus.ac.id` | `setara123` |
| `pengguna.google@gmail.com` | `google` |

Registrasi meminta nama, email, program studi, dan kata sandi. Login
memverifikasi kata sandi terhadap hash di database.

### 4. Perintah Verifikasi

```powershell
npm run build      # cek TypeScript + build produksi
npm run lint       # lint frontend
php tests\api_test.php   # jalankan dari folder backend-php (85 pemeriksaan)
```

## Pembagian Peran Scrum (US-1 s.d. US-6)

| User Story | Peran | Tanggung Jawab | Paket / Lokasi |
| --- | --- | --- | --- |
| **US-1** | Scrum Master | Koordinasi sprint, struktur repository, `.gitignore`, kerangka branch `main`, integrasi dan verifikasi build | Branch `main` (tanpa paket zip) |
| **US-2** | Dev 1 — Auth & Backend | Endpoint PHP, koneksi MySQL, autentikasi, halaman `Login.tsx` dan `Pengaturan.tsx` | `Paket_Dev1_US2_Auth_Backend.zip` |
| **US-3** | Dev 2 — Dashboard & Progres | `Dashboard.tsx`, `Progres.tsx`, `charts.tsx`, `status-strip.tsx`, metrik dan visualisasi | `Paket_Dev2_US3_Dashboard.zip` |
| **US-4** | Product Owner | Dokumen SRS, prioritas backlog, acceptance criteria, README dan panduan tim | `Paket_PO_US4.zip` |
| **US-5** | Dev 3 — Manajemen Tugas | `Tugas.tsx`, `task-detail.tsx`, `task-form-dialog.tsx`, `task-table.tsx`, `filter-menu.tsx`, `badges.tsx` | `Paket_Dev3_US5_Tugas.zip` |
| **US-6** | Dev 4 — Jadwal, Kalender & Pengingat | `Jadwal.tsx`, `Kalender.tsx`, `Pengingat.tsx`, `Bantuan.tsx`, `session-form-dialog.tsx`, `agenda-form-dialog.tsx`, `reminder-form-dialog.tsx` | `Paket_Dev4_US6_Jadwal_Kalender.zip` |

## Catatan Distribusi

- Folder `Distribusi_Tim_SETARA/` sengaja masuk `.gitignore` agar paket zip
  tidak ter-push ke GitHub.
- Branch `main` berisi kerangka: halaman `src/pages/*.tsx` berupa placeholder
  agar build tetap sukses. Implementasi lengkap ada di paket zip masing-masing.
- File dokumen SRS belum tersedia di workspace pada saat paket ini dibuat;
  bila tersedia, letakkan di `Paket_PO_US4/dokumen/` sebelum di-zip.
Login memverifikasi email dan kata sandi yang tersimpan (hash bcrypt). Jika
kata sandi salah atau email belum terdaftar, sistem menampilkan pesan gagal.
Registrasi meminta nama, email, program studi, dan kata sandi; email yang sudah
terdaftar ditolak. Setelah berhasil daftar, pengguna diarahkan ke halaman masuk.

Tombol **Akun kampus** dan **Google** memakai akun demo di atas, sehingga tetap
langsung masuk ke dashboard. Kredensial demo juga tetap bisa diketik manual,
tetapi panel pengingatnya tidak ditampilkan di halaman masuk.

## Penyimpanan

| Kunci | Isi |
| --- | --- |
| `setara-auth` | Status login + nama/email pengguna aktif |
| `setara-users` | Daftar akun yang pernah dipakai di perangkat ini |
| `setara-data:<email>` | Cache data akun (sumber utama: MySQL) |
| `setara-theme` | Tema terang/gelap/sistem |
| `setara-token` | Token akses API PHP (Berlaku 7 hari) |

`localStorage` dipakai sebagai cache dan cadangan offline. Saat backend aktif,
data MySQL yang menjadi sumber kebenaran. Menghapus data situs di browser akan
menghapus cache dan sesi, bukan data di MySQL. Gunakan **Pengaturan → Unduh
cadangan (.json)** untuk menyimpan salinan.

## Catatan

- Data contoh memakai tanggal patokan `2026-11-12` agar tampilan demo konsisten.
- Pulihkan data contoh dari **Pengaturan → Pulihkan data contoh**; nama, email,
  dan NIM akun tetap dipertahankan.
- Kredensial MySQL hanya tersimpan di sisi server (`backend-php/app/config.php`
  atau environment variable), tidak pernah dikirim ke browser.
