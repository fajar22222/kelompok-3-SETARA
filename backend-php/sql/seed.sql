-- SETARA — data contoh akun demo (dihasilkan otomatis dari app/seed.json)
-- Import lewat phpMyAdmin setelah sql/schema.sql.

USE `setara`;
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM `users` WHERE `id` = 'user-demo';
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `users`
  (`id`, `name`, `email`, `password_hash`, `nim`, `prodi`, `semester`, `university`, `preferences`, `custom_courses`)
VALUES ('user-demo', 'La Ode Elung', 'la.elung@kampus.ac.id', '$2y$10$rkTUMelnymICfAiMkCb3iOrfdoqzcLNP7kQ4TNLLkCcYC0tkn2VIK', 'F1G125077', 'Ilmu Komputer', 'Semester 5', 'Universitas Halu Oleo', '{"pushNotif":true,"emailNotif":true,"weeklySummary":false,"focusTips":true,"compactMode":false}', '[]');

-- Tugas
INSERT INTO `tasks` (`id`, `user_id`, `title`, `course`, `deadline`, `time`, `priority`, `status`, `notes`, `reminder`, `position`) VALUES
  ('task-01', 'user-demo', 'Laporan Rekayasa Perangkat Lunak', 'Rekayasa Perangkat Lunak', '2026-11-12', '23.59', 'Tinggi', 'dikerjakan', 'Fokus menyelesaikan bab arsitektur dan hasil pengujian. Perlu review singkat dari Kak Rina sebelum diunggah ke LMS.', 'Hari ini · 07.00', 0),
  ('task-02', 'user-demo', 'Proposal Proyek Akhir', 'Rekayasa Perangkat Lunak', '2026-11-18', '23.59', 'Tinggi', 'belum', 'Latar belakang dan rumusan masalah sudah dikumpulkan. Tinggal menyusun metodologi serta studi pustaka.', 'H-2 · 08.00', 1),
  ('task-03', 'user-demo', 'Review Kode Sprint 3', 'Rekayasa Perangkat Lunak', '2026-11-20', '16.00', 'Sedang', 'belum', 'Review pull request anggota tim dan tulis catatan perbaikan pada repository GitHub kelompok.', 'H-1 · 19.00', 2),
  ('task-04', 'user-demo', 'Dokumentasi API', 'Rekayasa Perangkat Lunak', '2026-11-03', '23.59', 'Sedang', 'selesai', 'Dokumentasi endpoint selesai menggunakan OpenAPI dan sudah diperbarui di repositori.', 'Nonaktif', 3),
  ('task-05', 'user-demo', 'Uji Unit Modul Pembayaran', 'Rekayasa Perangkat Lunak', '2026-11-06', '20.00', 'Tinggi', 'selesai', 'Seluruh kasus uji lulus dengan cakupan 86%. Bug pada validasi kupon sudah diperbaiki.', 'Nonaktif', 4),
  ('task-06', 'user-demo', 'Desain Arsitektur Sistem', 'Rekayasa Perangkat Lunak', '2026-11-09', '23.59', 'Tinggi', 'selesai', 'Diagram komponen dan alur data sudah disetujui dosen pembimbing.', 'Nonaktif', 5),
  ('task-07', 'user-demo', 'Tugas Kelompok Sistem Pakar', 'Kecerdasan Buatan', '2026-11-13', '23.59', 'Tinggi', 'dikerjakan', 'Basis aturan sudah selesai. Tinggal menghubungkan mesin inferensi dan menyusun laporan akhir.', 'Hari ini · 17.00', 6),
  ('task-08', 'user-demo', 'Latihan Jaringan Saraf Tiruan', 'Kecerdasan Buatan', '2026-11-14', '23.59', 'Sedang', 'belum', 'Kerjakan notebook klasifikasi gambar MNIST dan bandingkan dua arsitektur jaringan.', 'Besok · 08.00', 7),
  ('task-09', 'user-demo', 'Presentasi Computer Vision', 'Kecerdasan Buatan', '2026-11-10', '13.00', 'Tinggi', 'selesai', 'Presentasi berjalan lancar dengan nilai 88. Slide sudah diunggah ke kelas.', 'Nonaktif', 8),
  ('task-10', 'user-demo', 'Laporan Analisis Sentimen', 'Kecerdasan Buatan', '2026-11-05', '23.59', 'Sedang', 'selesai', 'Model Naive Bayes mencapai akurasi 91%. Pembahasan kesalahan klasifikasi sudah ditambahkan.', 'Nonaktif', 9),
  ('task-11', 'user-demo', 'Kuis Online Algoritma Genetika', 'Kecerdasan Buatan', '2026-11-08', '10.00', 'Rendah', 'selesai', 'Kuis selesai dengan skor 95. Materi seleksi dan crossover sudah dipahami.', 'Nonaktif', 10),
  ('task-12', 'user-demo', 'Rangkuman Reinforcement Learning', 'Kecerdasan Buatan', '2026-11-10', '20.00', 'Rendah', 'selesai', 'Rangkuman konsep Q-learning dan policy gradient sudah masuk ke catatan pribadi.', 'Nonaktif', 11),
  ('task-13', 'user-demo', 'Business Case Study', 'Manajemen Proyek TI', '2026-11-11', '23.59', 'Tinggi', 'dikerjakan', 'Analisis kelayakan dan estimasi biaya sudah selesai. Tinggal merapikan kesimpulan.', 'Hari ini · 09.00', 12),
  ('task-14', 'user-demo', 'Matriks Risiko Proyek', 'Manajemen Proyek TI', '2026-11-21', '16.00', 'Sedang', 'dikerjakan', 'Identifikasi risiko awal sudah dilakukan. Perlu menilai dampak dan menyusun mitigasi.', 'H-2 · 08.00', 13),
  ('task-15', 'user-demo', 'Proposal Anggaran TI', 'Manajemen Proyek TI', '2026-11-26', '23.59', 'Sedang', 'belum', 'Gunakan template anggaran dari pertemuan kesembilan. Pastikan komponen biaya operasional tercantum.', 'H-3 · 08.00', 14),
  ('task-16', 'user-demo', 'Laporan Scrum Sprint', 'Manajemen Proyek TI', '2026-11-04', '23.59', 'Tinggi', 'selesai', 'Burndown chart dan retrospektif sprint kedua sudah dilampirkan.', 'Nonaktif', 15),
  ('task-17', 'user-demo', 'Gantt Chart Proyek', 'Manajemen Proyek TI', '2026-11-07', '23.59', 'Rendah', 'selesai', 'Timeline proyek 12 minggu selesai dibuat menggunakan GanttProject.', 'Nonaktif', 16),
  ('task-18', 'user-demo', 'Studi Kasus Gagal Proyek', 'Manajemen Proyek TI', '2026-11-09', '23.59', 'Rendah', 'selesai', 'Studi kasus proyek ERP pemerintah dianalisis dari sisi scope, waktu, dan stakeholder.', 'Nonaktif', 17),
  ('task-19', 'user-demo', 'Prototipe Aplikasi Mobile', 'Interaksi Manusia dan Komputer', '2026-11-16', '23.59', 'Tinggi', 'dikerjakan', 'Prototipe high-fidelity sudah mencakup alur utama. Tinggal menyelesaikan layar pengaturan dan animasi.', 'H-1 · 08.00', 18),
  ('task-20', 'user-demo', 'Usability Testing', 'Interaksi Manusia dan Komputer', '2026-11-22', '13.00', 'Tinggi', 'belum', 'Siapkan skenario tugas, rekrut lima partisipan, dan siapkan lembar persetujuan.', 'H-2 · 19.00', 19),
  ('task-21', 'user-demo', 'Laporan Heuristik Nielsen', 'Interaksi Manusia dan Komputer', '2026-11-01', '23.59', 'Sedang', 'selesai', 'Evaluasi sepuluh heuristik selesai dengan temuan utama pada navigasi aplikasi.', 'Nonaktif', 20),
  ('task-22', 'user-demo', 'Wireframe Aplikasi Kasir', 'Interaksi Manusia dan Komputer', '2026-11-06', '20.00', 'Sedang', 'selesai', 'Wireframe low-fidelity untuk kasir dan manajemen stok sudah direview dosen.', 'Nonaktif', 21),
  ('task-23', 'user-demo', 'Persona & User Journey', 'Interaksi Manusia dan Komputer', '2026-11-08', '23.59', 'Rendah', 'selesai', 'Dua persona utama dan user journey mahasiswa baru sudah selesai.', 'Nonaktif', 22),
  ('task-24', 'user-demo', 'A/B Testing Landing Page', 'Interaksi Manusia dan Komputer', '2026-11-10', '16.00', 'Rendah', 'selesai', 'Varian B meningkatkan konversi 12%. Hasil dianalisis dengan uji proporsi.', 'Nonaktif', 23),
  ('task-25', 'user-demo', 'Deploy Aplikasi ke AWS', 'Komputasi Awan', '2026-11-17', '23.59', 'Tinggi', 'belum', 'Gunakan EC2 dan RDS free tier. Jangan lupa mengatur security group serta mencatat biaya.', 'H-2 · 08.00', 24),
  ('task-26', 'user-demo', 'Laporan Praktikum Docker', 'Komputasi Awan', '2026-11-28', '23.59', 'Sedang', 'belum', 'Dokumentasikan proses containerisasi aplikasi dan perbandingan ukuran image.', 'H-3 · 19.00', 25),
  ('task-27', 'user-demo', 'Tugas Serverless Function', 'Komputasi Awan', '2026-11-02', '23.59', 'Sedang', 'selesai', 'Fungsi serverless berhasil diuji dan sudah terhubung dengan basis data.', 'Nonaktif', 26),
  ('task-28', 'user-demo', 'Konfigurasi Load Balancer', 'Komputasi Awan', '2026-11-05', '20.00', 'Tinggi', 'selesai', 'Health check dan auto scaling group sudah berjalan sesuai skenario praktikum.', 'Nonaktif', 27),
  ('task-29', 'user-demo', 'Analisis Biaya Cloud', 'Komputasi Awan', '2026-11-07', '23.59', 'Rendah', 'selesai', 'Perbandingan biaya tiga penyedia cloud selesai dengan simulasi penggunaan satu semester.', 'Nonaktif', 28),
  ('task-30', 'user-demo', 'Kuis Virtualisasi', 'Komputasi Awan', '2026-11-09', '10.00', 'Rendah', 'selesai', 'Kuis selesai dengan skor 90. Materi hypervisor dan container sudah dipelajari.', 'Nonaktif', 29);

-- Subtugas
INSERT INTO `subtasks` (`id`, `task_pk`, `title`, `done`, `position`) VALUES
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-01'), 'Riset kebutuhan pengguna', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-01'), 'Susun draf dokumen', 1, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-01'), 'Review bersama tim', 1, 2),
  ('sub-4', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-01'), 'Finalisasi & unggah', 0, 3),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-02'), 'Riset kebutuhan pengguna', 0, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-02'), 'Susun draf dokumen', 0, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-02'), 'Review bersama tim', 0, 2),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-03'), 'Riset kebutuhan pengguna', 0, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-03'), 'Susun draf dokumen', 0, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-03'), 'Review bersama tim', 0, 2),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-04'), 'Riset kebutuhan pengguna', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-04'), 'Susun draf dokumen', 1, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-04'), 'Review bersama tim', 1, 2),
  ('sub-4', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-04'), 'Finalisasi & unggah', 1, 3),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-05'), 'Riset kebutuhan pengguna', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-05'), 'Susun draf dokumen', 1, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-05'), 'Review bersama tim', 1, 2),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-06'), 'Riset kebutuhan pengguna', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-06'), 'Susun draf dokumen', 1, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-06'), 'Review bersama tim', 1, 2),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-07'), 'Pelajari materi & dataset', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-07'), 'Implementasi model', 1, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-07'), 'Evaluasi hasil', 0, 2),
  ('sub-4', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-07'), 'Susun laporan', 0, 3),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-08'), 'Pelajari materi & dataset', 0, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-08'), 'Implementasi model', 0, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-08'), 'Evaluasi hasil', 0, 2),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-09'), 'Pelajari materi & dataset', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-09'), 'Implementasi model', 1, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-09'), 'Evaluasi hasil', 1, 2),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-10'), 'Pelajari materi & dataset', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-10'), 'Implementasi model', 1, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-10'), 'Evaluasi hasil', 1, 2),
  ('sub-4', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-10'), 'Susun laporan', 1, 3),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-11'), 'Pelajari materi & dataset', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-11'), 'Implementasi model', 1, 1),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-12'), 'Pelajari materi & dataset', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-12'), 'Implementasi model', 1, 1),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-13'), 'Kumpulkan data proyek', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-13'), 'Analisis risiko', 1, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-13'), 'Buat matriks & diagram', 1, 2),
  ('sub-4', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-13'), 'Finalisasi dokumen', 0, 3),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-14'), 'Kumpulkan data proyek', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-14'), 'Analisis risiko', 0, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-14'), 'Buat matriks & diagram', 0, 2),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-15'), 'Kumpulkan data proyek', 0, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-15'), 'Analisis risiko', 0, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-15'), 'Buat matriks & diagram', 0, 2),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-16'), 'Kumpulkan data proyek', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-16'), 'Analisis risiko', 1, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-16'), 'Buat matriks & diagram', 1, 2),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-17'), 'Kumpulkan data proyek', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-17'), 'Analisis risiko', 1, 1),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-18'), 'Kumpulkan data proyek', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-18'), 'Analisis risiko', 1, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-18'), 'Buat matriks & diagram', 1, 2),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-19'), 'Rancang wireframe', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-19'), 'Bangun prototipe', 1, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-19'), 'Uji ke pengguna', 1, 2),
  ('sub-4', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-19'), 'Rangkum temuan', 0, 3),
  ('sub-5', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-19'), 'Susun rekomendasi', 0, 4),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-20'), 'Rancang wireframe', 0, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-20'), 'Bangun prototipe', 0, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-20'), 'Uji ke pengguna', 0, 2),
  ('sub-4', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-20'), 'Rangkum temuan', 0, 3),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-21'), 'Rancang wireframe', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-21'), 'Bangun prototipe', 1, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-21'), 'Uji ke pengguna', 1, 2),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-22'), 'Rancang wireframe', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-22'), 'Bangun prototipe', 1, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-22'), 'Uji ke pengguna', 1, 2),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-23'), 'Rancang wireframe', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-23'), 'Bangun prototipe', 1, 1),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-24'), 'Rancang wireframe', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-24'), 'Bangun prototipe', 1, 1),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-25'), 'Siapkan environment', 0, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-25'), 'Konfigurasi layanan', 0, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-25'), 'Uji deployment', 0, 2),
  ('sub-4', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-25'), 'Dokumentasikan langkah', 0, 3),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-26'), 'Siapkan environment', 0, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-26'), 'Konfigurasi layanan', 0, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-26'), 'Uji deployment', 0, 2),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-27'), 'Siapkan environment', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-27'), 'Konfigurasi layanan', 1, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-27'), 'Uji deployment', 1, 2),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-28'), 'Siapkan environment', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-28'), 'Konfigurasi layanan', 1, 1),
  ('sub-3', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-28'), 'Uji deployment', 1, 2),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-29'), 'Siapkan environment', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-29'), 'Konfigurasi layanan', 1, 1),
  ('sub-1', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-30'), 'Siapkan environment', 1, 0),
  ('sub-2', (SELECT `pk` FROM `tasks` WHERE `user_id` = 'user-demo' AND `id` = 'task-30'), 'Konfigurasi layanan', 1, 1);

-- Jadwal kelas
INSERT INTO `class_sessions` (`id`, `user_id`, `course`, `day`, `start`, `end`, `room`, `status`) VALUES
  ('ses-01', 'user-demo', 'Interaksi Manusia dan Komputer', 1, '08.00', '09.40', 'R. 301', 'terjadwal'),
  ('ses-02', 'user-demo', 'Komputasi Awan', 1, '10.00', '11.40', 'Lab. 502', 'terjadwal'),
  ('ses-03', 'user-demo', 'Manajemen Proyek TI', 1, '13.00', '14.40', 'R. 205', 'terjadwal'),
  ('ses-04', 'user-demo', 'Kecerdasan Buatan', 2, '08.00', '09.40', 'R. 402', 'terjadwal'),
  ('ses-05', 'user-demo', 'Rekayasa Perangkat Lunak', 2, '10.00', '11.40', 'Lab. 301', 'terjadwal'),
  ('ses-06', 'user-demo', 'Komputasi Awan', 3, '08.00', '09.40', 'Lab. 502', 'terjadwal'),
  ('ses-07', 'user-demo', 'Interaksi Manusia dan Komputer', 3, '10.00', '11.40', 'R. 301', 'terjadwal'),
  ('ses-08', 'user-demo', 'Kecerdasan Buatan', 3, '13.00', '14.40', 'R. 402', 'terjadwal'),
  ('ses-09', 'user-demo', 'Rekayasa Perangkat Lunak', 4, '08.00', '09.40', 'Lab. 301', 'selesai'),
  ('ses-10', 'user-demo', 'Kecerdasan Buatan', 4, '10.00', '11.40', 'R. 402', 'berlangsung'),
  ('ses-11', 'user-demo', 'Manajemen Proyek TI', 4, '13.00', '14.40', 'R. 205', 'berikutnya'),
  ('ses-12', 'user-demo', 'Interaksi Manusia dan Komputer', 5, '08.00', '09.40', 'R. 301', 'terjadwal'),
  ('ses-13', 'user-demo', 'Komputasi Awan', 5, '10.00', '11.40', 'Lab. 502', 'terjadwal');

-- Agenda
INSERT INTO `agendas` (`id`, `user_id`, `title`, `date`, `time`, `end_time`, `type`, `location`) VALUES
  ('agenda-01', 'user-demo', 'Konsultasi proposal proyek akhir', '2026-11-17', '14.00', NULL, 'lainnya', 'Ruang dosen 2.04'),
  ('agenda-02', 'user-demo', 'Seminar Interaksi Manusia dan Komputer', '2026-11-20', '09.00', NULL, 'kelas', 'Aula FIK'),
  ('agenda-03', 'user-demo', 'Batas pengisian KRS semester depan', '2026-11-27', '23.59', NULL, 'lainnya', 'Portal akademik');

-- Pengingat
INSERT INTO `reminders` (`id`, `user_id`, `title`, `detail`, `date`, `time`, `enabled`, `kind`) VALUES
  ('rem-01', 'user-demo', 'Cek progres tugas hari ini', 'Ringkasan tugas dan deadline yang perlu ditindaklanjuti.', '2026-11-12', '12.45', 1, 'harian'),
  ('rem-02', 'user-demo', 'Review deadline besok', 'Tugas Kelompok Sistem Pakar dikumpulkan pukul 23.59.', '2026-11-12', '17.00', 1, 'tugas'),
  ('rem-03', 'user-demo', 'Rangkum agenda besok', 'Siapkan jadwal kuliah dan prioritas tugas Jumat.', '2026-11-12', '22.59', 1, 'harian'),
  ('rem-04', 'user-demo', 'Deadline Sistem Pakar', 'Unggah laporan dan tautan repositori ke LMS.', '2026-11-13', '08.00', 1, 'tugas'),
  ('rem-05', 'user-demo', 'Latihan JST dimulai', 'Siapkan notebook dan dataset MNIST sebelum kelas.', '2026-11-14', '07.30', 0, 'tugas'),
  ('rem-06', 'user-demo', 'Konsultasi proposal', 'Bawa draf bab 1–2 dan catatan revisi terakhir.', '2026-11-17', '13.30', 1, 'pribadi'),
  ('rem-07', 'user-demo', 'Kelas Rekayasa Perangkat Lunak', 'Pertemuan di Lab. 301, bawa laptop dan dokumen sprint.', '2026-11-19', '07.30', 1, 'kelas');

-- Pengingat kalender
INSERT INTO `calendar_reminders` (`id`, `user_id`, `time`, `label`, `enabled`) VALUES
  ('cal-01', 'user-demo', '12.45', 'Cek progres & deadline hari ini', 1),
  ('cal-02', 'user-demo', '17.00', 'Review agenda dan tugas besok', 1),
  ('cal-03', 'user-demo', '22.59', 'Rangkum capaian belajar hari ini', 1);

-- Selesai. Akun demo: aditya.pratama@kampus.ac.id / setara123
