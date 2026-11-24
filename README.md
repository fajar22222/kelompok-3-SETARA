# SETARA

**Sistem Tugas dan Agenda Rencana Akademik** — aplikasi web untuk mengelola
tugas kuliah, subtugas, jadwal kelas, agenda kalender, pengingat, progres, dan
profil mahasiswa.

Frontend React + TypeScript + Vite. Data utama disimpan di **MySQL** melalui
API PHP native di `backend-php/`. Salinan di `localStorage` dipakai sebagai
cache sekaligus cadangan, sehingga aplikasi tetap bisa dipakai saat server
tidak berjalan.

## Fitur

- Autentikasi lokal: registrasi, login, dan logout. Email/NIM + kata sandi apa
  pun yang tidak kosong diterima; akun baru dibuat otomatis.
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

Mode demo menerima **email/NIM dan kata sandi apa pun yang tidak kosong**. Jika
kredensial belum pernah dipakai, akun baru dibuat otomatis dengan data contoh
(30 tugas, 13 jadwal, 3 agenda, 7 pengingat). Akun baru juga bisa dibuat lewat
halaman **Daftar akun**.

Tombol **Isi kredensial demo**, **Akun kampus**, dan **Google** langsung masuk
ke dashboard.

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
