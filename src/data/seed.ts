export type TaskStatus = "belum" | "dikerjakan" | "selesai" | "review"
export type Priority = "Tinggi" | "Sedang" | "Rendah"
export type AgendaType = "kelas" | "deadline" | "lainnya"

export const TODAY_ISO = "2026-11-12"

export const COURSES = [
  "Rekayasa Perangkat Lunak",
  "Kecerdasan Buatan",
  "Manajemen Proyek TI",
  "Interaksi Manusia dan Komputer",
  "Komputasi Awan",
] as const

/** Program studi yang bisa dipilih pada halaman Pengaturan. */
export const PRODI_OPTIONS = [
  "Ilmu Komputer",
  "Sistem Informasi",
  "Teknologi Informasi",
  "Ilmu Data",
  "Teknik Informatika",
  "Teknik Elektro",
  "Matematika",
  "Statistika",
  "Fisika",
  "Kimia",
  "Biologi",
  "Manajemen",
  "Akuntansi",
  "Ilmu Hukum",
  "Pendidikan Matematika",
  "Pendidikan Bahasa Inggris",
] as const

/** Perguruan tinggi yang bisa dipilih pada halaman Pengaturan. */
export const UNIVERSITY_OPTIONS = [
  "Universitas Halu Oleo",
  "Universitas Nusantara",
  "Universitas Indonesia",
  "Universitas Gadjah Mada",
  "Institut Teknologi Bandung",
] as const

export type CourseName = (typeof COURSES)[number]

type CourseMeta = {
  short: string
  dot: string
  chip: string
  bar: string
  soft: string
}

export const COURSE_META: Record<CourseName, CourseMeta> = {
  "Rekayasa Perangkat Lunak": {
    short: "RPL",
    dot: "bg-violet-500",
    chip: "bg-violet-50 text-violet-700 ring-violet-100",
    bar: "bg-violet-500",
    soft: "bg-violet-50/70",
  },
  "Kecerdasan Buatan": {
    short: "AI",
    dot: "bg-blue-500",
    chip: "bg-blue-50 text-blue-700 ring-blue-100",
    bar: "bg-blue-500",
    soft: "bg-blue-50/70",
  },
  "Manajemen Proyek TI": {
    short: "MPTI",
    dot: "bg-orange-500",
    chip: "bg-orange-50 text-orange-700 ring-orange-100",
    bar: "bg-orange-500",
    soft: "bg-orange-50/70",
  },
  "Interaksi Manusia dan Komputer": {
    short: "IMK",
    dot: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700 ring-rose-100",
    bar: "bg-rose-500",
    soft: "bg-rose-50/70",
  },
  "Komputasi Awan": {
    short: "Cloud",
    dot: "bg-teal-500",
    chip: "bg-teal-50 text-teal-700 ring-teal-100",
    bar: "bg-teal-500",
    soft: "bg-teal-50/70",
  },
}

/** Palet cadangan untuk mata kuliah kustom yang ditambahkan pengguna. */
const CUSTOM_COURSE_META: CourseMeta[] = [
  { short: "MK", dot: "bg-violet-500", chip: "bg-violet-50 text-violet-700 ring-violet-100", bar: "bg-violet-500", soft: "bg-violet-50/70" },
  { short: "MK", dot: "bg-orange-500", chip: "bg-orange-50 text-orange-700 ring-orange-100", bar: "bg-orange-500", soft: "bg-orange-50/70" },
  { short: "MK", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 ring-emerald-100", bar: "bg-emerald-500", soft: "bg-emerald-50/70" },
  { short: "MK", dot: "bg-rose-500", chip: "bg-rose-50 text-rose-700 ring-rose-100", bar: "bg-rose-500", soft: "bg-rose-50/70" },
  { short: "MK", dot: "bg-indigo-500", chip: "bg-indigo-50 text-indigo-700 ring-indigo-100", bar: "bg-indigo-500", soft: "bg-indigo-50/70" },
  { short: "MK", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 ring-amber-100", bar: "bg-amber-500", soft: "bg-amber-50/70" },
]

function customCourseShort(course: string): string {
  const words = course.split(/\s+/).filter((word) => /[a-zA-Z0-9]/.test(word))
  const initials = words.map((word) => word[0]).join("")
  if (initials.length >= 2) return initials.slice(0, 4).toUpperCase()
  const compact = course.replace(/[^a-zA-Z0-9]/g, "")
  return (compact.slice(0, 3) || "MK").toUpperCase()
}

/**
 * Meta visual untuk mata kuliah apa pun. Mata kuliah bawaan memakai palet
 * tetap, sedangkan mata kuliah kustom mendapat palet dan inisial otomatis
 * agar tetap konsisten di tabel, chip, dan progres.
 */
export function courseMeta(course: string): CourseMeta {
  if (course in COURSE_META) return COURSE_META[course as CourseName]
  const index =
    [...course].reduce((total, char) => total + char.charCodeAt(0), 0) % CUSTOM_COURSE_META.length
  return { ...CUSTOM_COURSE_META[index], short: customCourseShort(course) }
}

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  course: string
  deadline: string
  time: string
  priority: Priority
  status: TaskStatus
  notes: string
  reminder: string
  subtasks: Subtask[]
}

export interface ClassSession {
  id: string
  course: string
  day: number
  start: string
  end: string
  room: string
  status: "selesai" | "berlangsung" | "berikutnya" | "terjadwal"
}

export interface AgendaItem {
  id: string
  title: string
  date: string
  time: string
  endTime?: string
  type: AgendaType
  location?: string
}

/**
 * Perubahan jadwal kuliah rutin untuk satu tanggal saja. Dipakai saat pengguna
 * mengedit atau menghapus satu kemunculan kelas tanpa mengubah jadwal mingguan.
 */
export interface SessionOverride {
  sessionId: string
  date: string
  title?: string
  start?: string
  end?: string
  room?: string
  type?: AgendaType
  hidden?: boolean
}

export type ReminderKind = "harian" | "tugas" | "kelas" | "pribadi"

export interface Reminder {
  id: string
  title: string
  detail: string
  date: string
  time: string
  enabled: boolean
  kind: ReminderKind
}

export interface CalendarReminder {
  id: string
  time: string
  label: string
  enabled: boolean
}

export interface Profile {
  name: string
  nim: string
  email: string
  prodi: string
  semester: string
  university: string
}

export interface Preferences {
  pushNotif: boolean
  emailNotif: boolean
  weeklySummary: boolean
  focusTips: boolean
  compactMode: boolean
}

export interface AppData {
  tasks: Task[]
  sessions: ClassSession[]
  agendas: AgendaItem[]
  sessionOverrides: SessionOverride[]
  customCourses: string[]
  reminders: Reminder[]
  calendarReminders: CalendarReminder[]
  profile: Profile
  preferences: Preferences
}

const CHECKLIST: Record<CourseName, string[]> = {
  "Rekayasa Perangkat Lunak": [
    "Riset kebutuhan pengguna",
    "Susun draf dokumen",
    "Review bersama tim",
    "Finalisasi & unggah",
    "Presentasi hasil",
  ],
  "Kecerdasan Buatan": [
    "Pelajari materi & dataset",
    "Implementasi model",
    "Evaluasi hasil",
    "Susun laporan",
    "Siapkan bahan presentasi",
  ],
  "Manajemen Proyek TI": [
    "Kumpulkan data proyek",
    "Analisis risiko",
    "Buat matriks & diagram",
    "Finalisasi dokumen",
    "Presentasi ke kelas",
  ],
  "Interaksi Manusia dan Komputer": [
    "Rancang wireframe",
    "Bangun prototipe",
    "Uji ke pengguna",
    "Rangkum temuan",
    "Susun rekomendasi",
  ],
  "Komputasi Awan": [
    "Siapkan environment",
    "Konfigurasi layanan",
    "Uji deployment",
    "Dokumentasikan langkah",
    "Bersihkan resource",
  ],
}

type SeedInput = {
  title: string
  course: CourseName
  deadline: string
  time?: string
  priority: Priority
  status: TaskStatus
  done: number
  total: number
  notes: string
  reminder: string
}

const TASK_SEEDS: SeedInput[] = [
  {
    title: "Laporan Rekayasa Perangkat Lunak",
    course: "Rekayasa Perangkat Lunak",
    deadline: "2026-11-12",
    time: "23.59",
    priority: "Tinggi",
    status: "dikerjakan",
    done: 3,
    total: 4,
    notes:
      "Fokus menyelesaikan bab arsitektur dan hasil pengujian. Perlu review singkat dari Kak Rina sebelum diunggah ke LMS.",
    reminder: "Hari ini · 07.00",
  },
  {
    title: "Proposal Proyek Akhir",
    course: "Rekayasa Perangkat Lunak",
    deadline: "2026-11-18",
    time: "23.59",
    priority: "Tinggi",
    status: "belum",
    done: 0,
    total: 3,
    notes:
      "Latar belakang dan rumusan masalah sudah dikumpulkan. Tinggal menyusun metodologi serta studi pustaka.",
    reminder: "H-2 · 08.00",
  },
  {
    title: "Review Kode Sprint 3",
    course: "Rekayasa Perangkat Lunak",
    deadline: "2026-11-20",
    time: "16.00",
    priority: "Sedang",
    status: "belum",
    done: 0,
    total: 3,
    notes: "Review pull request anggota tim dan tulis catatan perbaikan pada repository GitHub kelompok.",
    reminder: "H-1 · 19.00",
  },
  {
    title: "Dokumentasi API",
    course: "Rekayasa Perangkat Lunak",
    deadline: "2026-11-03",
    time: "23.59",
    priority: "Sedang",
    status: "selesai",
    done: 4,
    total: 4,
    notes: "Dokumentasi endpoint selesai menggunakan OpenAPI dan sudah diperbarui di repositori.",
    reminder: "Nonaktif",
  },
  {
    title: "Uji Unit Modul Pembayaran",
    course: "Rekayasa Perangkat Lunak",
    deadline: "2026-11-06",
    time: "20.00",
    priority: "Tinggi",
    status: "selesai",
    done: 3,
    total: 3,
    notes: "Seluruh kasus uji lulus dengan cakupan 86%. Bug pada validasi kupon sudah diperbaiki.",
    reminder: "Nonaktif",
  },
  {
    title: "Desain Arsitektur Sistem",
    course: "Rekayasa Perangkat Lunak",
    deadline: "2026-11-09",
    time: "23.59",
    priority: "Tinggi",
    status: "selesai",
    done: 3,
    total: 3,
    notes: "Diagram komponen dan alur data sudah disetujui dosen pembimbing.",
    reminder: "Nonaktif",
  },
  {
    title: "Tugas Kelompok Sistem Pakar",
    course: "Kecerdasan Buatan",
    deadline: "2026-11-13",
    time: "23.59",
    priority: "Tinggi",
    status: "dikerjakan",
    done: 2,
    total: 4,
    notes: "Basis aturan sudah selesai. Tinggal menghubungkan mesin inferensi dan menyusun laporan akhir.",
    reminder: "Hari ini · 17.00",
  },
  {
    title: "Latihan Jaringan Saraf Tiruan",
    course: "Kecerdasan Buatan",
    deadline: "2026-11-14",
    time: "23.59",
    priority: "Sedang",
    status: "belum",
    done: 0,
    total: 3,
    notes: "Kerjakan notebook klasifikasi gambar MNIST dan bandingkan dua arsitektur jaringan.",
    reminder: "Besok · 08.00",
  },
  {
    title: "Presentasi Computer Vision",
    course: "Kecerdasan Buatan",
    deadline: "2026-11-10",
    time: "13.00",
    priority: "Tinggi",
    status: "selesai",
    done: 3,
    total: 3,
    notes: "Presentasi berjalan lancar dengan nilai 88. Slide sudah diunggah ke kelas.",
    reminder: "Nonaktif",
  },
  {
    title: "Laporan Analisis Sentimen",
    course: "Kecerdasan Buatan",
    deadline: "2026-11-05",
    time: "23.59",
    priority: "Sedang",
    status: "selesai",
    done: 4,
    total: 4,
    notes: "Model Naive Bayes mencapai akurasi 91%. Pembahasan kesalahan klasifikasi sudah ditambahkan.",
    reminder: "Nonaktif",
  },
  {
    title: "Kuis Online Algoritma Genetika",
    course: "Kecerdasan Buatan",
    deadline: "2026-11-08",
    time: "10.00",
    priority: "Rendah",
    status: "selesai",
    done: 2,
    total: 2,
    notes: "Kuis selesai dengan skor 95. Materi seleksi dan crossover sudah dipahami.",
    reminder: "Nonaktif",
  },
  {
    title: "Rangkuman Reinforcement Learning",
    course: "Kecerdasan Buatan",
    deadline: "2026-11-10",
    time: "20.00",
    priority: "Rendah",
    status: "selesai",
    done: 2,
    total: 2,
    notes: "Rangkuman konsep Q-learning dan policy gradient sudah masuk ke catatan pribadi.",
    reminder: "Nonaktif",
  },
  {
    title: "Business Case Study",
    course: "Manajemen Proyek TI",
    deadline: "2026-11-11",
    time: "23.59",
    priority: "Tinggi",
    status: "dikerjakan",
    done: 3,
    total: 4,
    notes: "Analisis kelayakan dan estimasi biaya sudah selesai. Tinggal merapikan kesimpulan.",
    reminder: "Hari ini · 09.00",
  },
  {
    title: "Matriks Risiko Proyek",
    course: "Manajemen Proyek TI",
    deadline: "2026-11-21",
    time: "16.00",
    priority: "Sedang",
    status: "dikerjakan",
    done: 1,
    total: 3,
    notes: "Identifikasi risiko awal sudah dilakukan. Perlu menilai dampak dan menyusun mitigasi.",
    reminder: "H-2 · 08.00",
  },
  {
    title: "Proposal Anggaran TI",
    course: "Manajemen Proyek TI",
    deadline: "2026-11-26",
    time: "23.59",
    priority: "Sedang",
    status: "belum",
    done: 0,
    total: 3,
    notes: "Gunakan template anggaran dari pertemuan kesembilan. Pastikan komponen biaya operasional tercantum.",
    reminder: "H-3 · 08.00",
  },
  {
    title: "Laporan Scrum Sprint",
    course: "Manajemen Proyek TI",
    deadline: "2026-11-04",
    time: "23.59",
    priority: "Tinggi",
    status: "selesai",
    done: 3,
    total: 3,
    notes: "Burndown chart dan retrospektif sprint kedua sudah dilampirkan.",
    reminder: "Nonaktif",
  },
  {
    title: "Gantt Chart Proyek",
    course: "Manajemen Proyek TI",
    deadline: "2026-11-07",
    time: "23.59",
    priority: "Rendah",
    status: "selesai",
    done: 2,
    total: 2,
    notes: "Timeline proyek 12 minggu selesai dibuat menggunakan GanttProject.",
    reminder: "Nonaktif",
  },
  {
    title: "Studi Kasus Gagal Proyek",
    course: "Manajemen Proyek TI",
    deadline: "2026-11-09",
    time: "23.59",
    priority: "Rendah",
    status: "selesai",
    done: 3,
    total: 3,
    notes: "Studi kasus proyek ERP pemerintah dianalisis dari sisi scope, waktu, dan stakeholder.",
    reminder: "Nonaktif",
  },
  {
    title: "Prototipe Aplikasi Mobile",
    course: "Interaksi Manusia dan Komputer",
    deadline: "2026-11-16",
    time: "23.59",
    priority: "Tinggi",
    status: "dikerjakan",
    done: 3,
    total: 5,
    notes: "Prototipe high-fidelity sudah mencakup alur utama. Tinggal menyelesaikan layar pengaturan dan animasi.",
    reminder: "H-1 · 08.00",
  },
  {
    title: "Usability Testing",
    course: "Interaksi Manusia dan Komputer",
    deadline: "2026-11-22",
    time: "13.00",
    priority: "Tinggi",
    status: "belum",
    done: 0,
    total: 4,
    notes: "Siapkan skenario tugas, rekrut lima partisipan, dan siapkan lembar persetujuan.",
    reminder: "H-2 · 19.00",
  },
  {
    title: "Laporan Heuristik Nielsen",
    course: "Interaksi Manusia dan Komputer",
    deadline: "2026-11-01",
    time: "23.59",
    priority: "Sedang",
    status: "selesai",
    done: 3,
    total: 3,
    notes: "Evaluasi sepuluh heuristik selesai dengan temuan utama pada navigasi aplikasi.",
    reminder: "Nonaktif",
  },
  {
    title: "Wireframe Aplikasi Kasir",
    course: "Interaksi Manusia dan Komputer",
    deadline: "2026-11-06",
    time: "20.00",
    priority: "Sedang",
    status: "selesai",
    done: 3,
    total: 3,
    notes: "Wireframe low-fidelity untuk kasir dan manajemen stok sudah direview dosen.",
    reminder: "Nonaktif",
  },
  {
    title: "Persona & User Journey",
    course: "Interaksi Manusia dan Komputer",
    deadline: "2026-11-08",
    time: "23.59",
    priority: "Rendah",
    status: "selesai",
    done: 2,
    total: 2,
    notes: "Dua persona utama dan user journey mahasiswa baru sudah selesai.",
    reminder: "Nonaktif",
  },
  {
    title: "A/B Testing Landing Page",
    course: "Interaksi Manusia dan Komputer",
    deadline: "2026-11-10",
    time: "16.00",
    priority: "Rendah",
    status: "selesai",
    done: 2,
    total: 2,
    notes: "Varian B meningkatkan konversi 12%. Hasil dianalisis dengan uji proporsi.",
    reminder: "Nonaktif",
  },
  {
    title: "Deploy Aplikasi ke AWS",
    course: "Komputasi Awan",
    deadline: "2026-11-17",
    time: "23.59",
    priority: "Tinggi",
    status: "belum",
    done: 0,
    total: 4,
    notes: "Gunakan EC2 dan RDS free tier. Jangan lupa mengatur security group serta mencatat biaya.",
    reminder: "H-2 · 08.00",
  },
  {
    title: "Laporan Praktikum Docker",
    course: "Komputasi Awan",
    deadline: "2026-11-28",
    time: "23.59",
    priority: "Sedang",
    status: "belum",
    done: 0,
    total: 3,
    notes: "Dokumentasikan proses containerisasi aplikasi dan perbandingan ukuran image.",
    reminder: "H-3 · 19.00",
  },
  {
    title: "Tugas Serverless Function",
    course: "Komputasi Awan",
    deadline: "2026-11-02",
    time: "23.59",
    priority: "Sedang",
    status: "selesai",
    done: 3,
    total: 3,
    notes: "Fungsi serverless berhasil diuji dan sudah terhubung dengan basis data.",
    reminder: "Nonaktif",
  },
  {
    title: "Konfigurasi Load Balancer",
    course: "Komputasi Awan",
    deadline: "2026-11-05",
    time: "20.00",
    priority: "Tinggi",
    status: "selesai",
    done: 3,
    total: 3,
    notes: "Health check dan auto scaling group sudah berjalan sesuai skenario praktikum.",
    reminder: "Nonaktif",
  },
  {
    title: "Analisis Biaya Cloud",
    course: "Komputasi Awan",
    deadline: "2026-11-07",
    time: "23.59",
    priority: "Rendah",
    status: "selesai",
    done: 2,
    total: 2,
    notes: "Perbandingan biaya tiga penyedia cloud selesai dengan simulasi penggunaan satu semester.",
    reminder: "Nonaktif",
  },
  {
    title: "Kuis Virtualisasi",
    course: "Komputasi Awan",
    deadline: "2026-11-09",
    time: "10.00",
    priority: "Rendah",
    status: "selesai",
    done: 2,
    total: 2,
    notes: "Kuis selesai dengan skor 90. Materi hypervisor dan container sudah dipelajari.",
    reminder: "Nonaktif",
  },
]

function buildSubtasks(course: CourseName, done: number, total: number): Subtask[] {
  return Array.from({ length: total }, (_, index) => ({
    id: `sub-${index + 1}`,
    title: CHECKLIST[course][index] ?? `Bagian ${index + 1}`,
    done: index < done,
  }))
}

export const initialTasks: Task[] = TASK_SEEDS.map((seed, index) => ({
  id: `task-${String(index + 1).padStart(2, "0")}`,
  title: seed.title,
  course: seed.course,
  deadline: seed.deadline,
  time: seed.time ?? "23.59",
  priority: seed.priority,
  status: seed.status,
  notes: seed.notes,
  reminder: seed.reminder,
  subtasks: buildSubtasks(seed.course, seed.done, seed.total),
}))

export const initialSessions: ClassSession[] = [
  {
    id: "ses-01",
    course: "Interaksi Manusia dan Komputer",
    day: 1,
    start: "08.00",
    end: "09.40",
    room: "R. 301",
    status: "terjadwal",
  },
  {
    id: "ses-02",
    course: "Komputasi Awan",
    day: 1,
    start: "10.00",
    end: "11.40",
    room: "Lab. 502",
    status: "terjadwal",
  },
  {
    id: "ses-03",
    course: "Manajemen Proyek TI",
    day: 1,
    start: "13.00",
    end: "14.40",
    room: "R. 205",
    status: "terjadwal",
  },
  {
    id: "ses-04",
    course: "Kecerdasan Buatan",
    day: 2,
    start: "08.00",
    end: "09.40",
    room: "R. 402",
    status: "terjadwal",
  },
  {
    id: "ses-05",
    course: "Rekayasa Perangkat Lunak",
    day: 2,
    start: "10.00",
    end: "11.40",
    room: "Lab. 301",
    status: "terjadwal",
  },
  {
    id: "ses-06",
    course: "Komputasi Awan",
    day: 3,
    start: "08.00",
    end: "09.40",
    room: "Lab. 502",
    status: "terjadwal",
  },
  {
    id: "ses-07",
    course: "Interaksi Manusia dan Komputer",
    day: 3,
    start: "10.00",
    end: "11.40",
    room: "R. 301",
    status: "terjadwal",
  },
  {
    id: "ses-08",
    course: "Kecerdasan Buatan",
    day: 3,
    start: "13.00",
    end: "14.40",
    room: "R. 402",
    status: "terjadwal",
  },
  {
    id: "ses-09",
    course: "Rekayasa Perangkat Lunak",
    day: 4,
    start: "08.00",
    end: "09.40",
    room: "Lab. 301",
    status: "selesai",
  },
  {
    id: "ses-10",
    course: "Kecerdasan Buatan",
    day: 4,
    start: "10.00",
    end: "11.40",
    room: "R. 402",
    status: "berlangsung",
  },
  {
    id: "ses-11",
    course: "Manajemen Proyek TI",
    day: 4,
    start: "13.00",
    end: "14.40",
    room: "R. 205",
    status: "berikutnya",
  },
  {
    id: "ses-12",
    course: "Interaksi Manusia dan Komputer",
    day: 5,
    start: "08.00",
    end: "09.40",
    room: "R. 301",
    status: "terjadwal",
  },
  {
    id: "ses-13",
    course: "Komputasi Awan",
    day: 5,
    start: "10.00",
    end: "11.40",
    room: "Lab. 502",
    status: "terjadwal",
  },
]

export const initialAgendas: AgendaItem[] = [
  {
    id: "agenda-01",
    title: "Konsultasi proposal proyek akhir",
    date: "2026-11-17",
    time: "14.00",
    type: "lainnya",
    location: "Ruang dosen 2.04",
  },
  {
    id: "agenda-02",
    title: "Seminar Interaksi Manusia dan Komputer",
    date: "2026-11-20",
    time: "09.00",
    type: "kelas",
    location: "Aula FIK",
  },
  {
    id: "agenda-03",
    title: "Batas pengisian KRS semester depan",
    date: "2026-11-27",
    time: "23.59",
    type: "lainnya",
    location: "Portal akademik",
  },
]

export const initialReminders: Reminder[] = [
  {
    id: "rem-01",
    title: "Cek progres tugas hari ini",
    detail: "Ringkasan tugas dan deadline yang perlu ditindaklanjuti.",
    date: "2026-11-12",
    time: "12.45",
    enabled: true,
    kind: "harian",
  },
  {
    id: "rem-02",
    title: "Review deadline besok",
    detail: "Tugas Kelompok Sistem Pakar dikumpulkan pukul 23.59.",
    date: "2026-11-12",
    time: "17.00",
    enabled: true,
    kind: "tugas",
  },
  {
    id: "rem-03",
    title: "Rangkum agenda besok",
    detail: "Siapkan jadwal kuliah dan prioritas tugas Jumat.",
    date: "2026-11-12",
    time: "22.59",
    enabled: true,
    kind: "harian",
  },
  {
    id: "rem-04",
    title: "Deadline Sistem Pakar",
    detail: "Unggah laporan dan tautan repositori ke LMS.",
    date: "2026-11-13",
    time: "08.00",
    enabled: true,
    kind: "tugas",
  },
  {
    id: "rem-05",
    title: "Latihan JST dimulai",
    detail: "Siapkan notebook dan dataset MNIST sebelum kelas.",
    date: "2026-11-14",
    time: "07.30",
    enabled: false,
    kind: "tugas",
  },
  {
    id: "rem-06",
    title: "Konsultasi proposal",
    detail: "Bawa draf bab 1–2 dan catatan revisi terakhir.",
    date: "2026-11-17",
    time: "13.30",
    enabled: true,
    kind: "pribadi",
  },
  {
    id: "rem-07",
    title: "Kelas Rekayasa Perangkat Lunak",
    detail: "Pertemuan di Lab. 301, bawa laptop dan dokumen sprint.",
    date: "2026-11-19",
    time: "07.30",
    enabled: true,
    kind: "kelas",
  },
]

export const initialCalendarReminders: CalendarReminder[] = [
  { id: "cal-01", time: "12.45", label: "Cek progres & deadline hari ini", enabled: true },
  { id: "cal-02", time: "17.00", label: "Review agenda dan tugas besok", enabled: true },
  { id: "cal-03", time: "22.59", label: "Rangkum capaian belajar hari ini", enabled: true },
]

export const initialProfile: Profile = {
  name: "La Ode Elung",
  nim: "F1G125077",
  email: "la.elung@kampus.ac.id",
  prodi: "Ilmu Komputer",
  semester: "Semester 5",
  university: "Universitas Halu Oleo",
}

export const initialPreferences: Preferences = {
  pushNotif: true,
  emailNotif: true,
  weeklySummary: false,
  focusTips: true,
  compactMode: false,
}
