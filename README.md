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
