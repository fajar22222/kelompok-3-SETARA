import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Bell,
  BookOpenCheck,
  Check,
  ChevronDown,
  Clock,
  LifeBuoy,
  ListChecks,
  Mail,
  MessageSquare,
  Search,
  ShieldCheck,
} from "lucide-react"

import { Panel, PanelHeader } from "@/components/panel"
import { Input } from "@/components/ui/input"
import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"

const QUICK_GUIDES = [
  {
    title: "Mulai dari dashboard",
    description: "Lihat ringkasan progres, deadline, dan jadwal hari ini.",
    to: "/",
    icon: BookOpenCheck,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    title: "Kelola tugas & checklist",
    description: "Pecah tugas menjadi langkah kecil dan tandai progresnya.",
    to: "/tugas",
    icon: ListChecks,
    tone: "bg-orange-50 text-orange-600",
  },
  {
    title: "Atur pengingat",
    description: "Pastikan deadline dan kelas tidak terlewat.",
    to: "/pengingat",
    icon: Bell,
    tone: "bg-emerald-50 text-emerald-600",
  },
]

const FAQS = [
  {
    id: "faq-1",
    category: "Tugas",
    question: "Bagaimana cara menambahkan tugas baru?",
    answer:
      "Klik tombol “Tambah tugas” di dashboard atau halaman Tugas saya. Isi nama tugas, mata kuliah, deadline, prioritas, dan status awal. Tugas akan langsung muncul di tabel dan tersimpan otomatis.",
  },
  {
    id: "faq-2",
    category: "Tugas",
    question: "Bagaimana cara mengedit atau menghapus tugas?",
    answer:
      "Buka detail tugas dengan memilih barisnya, lalu gunakan ikon pensil untuk mengubah judul, deadline, prioritas, atau status. Ikon tempat sampah menghapus tugas beserta catatan dan checklist-nya. Di panel yang sama kamu juga bisa menambah dan menghapus subtugas.",
  },
  {
    id: "faq-3",
    category: "Tugas",
    question: "Apakah checklist memengaruhi persentase progres?",
    answer:
      "Ya. Persentase progres dihitung dari jumlah subtugas yang selesai. Saat semua subtugas dicentang, status tugas otomatis berubah menjadi Selesai. Jika satu centang dibatalkan, status kembali menjadi Dikerjakan.",
  },
  {
    id: "faq-4",
    category: "Kalender",
    question: "Mengapa jadwal kuliah muncul berulang setiap minggu?",
    answer:
      "Jadwal kuliah adalah agenda mingguan tetap. Setiap tanggal yang sesuai dengan hari kelas akan menampilkan kelas tersebut di kalender. Agenda pribadi dan deadline tugas hanya muncul pada tanggalnya masing-masing.",
  },
  {
    id: "faq-5",
    category: "Pengingat",
    question: "Bagaimana pengingat bekerja?",
    answer:
      "Pengingat memiliki tanggal, waktu, dan kategori. Kamu dapat mengaktifkan atau menonaktifkannya kapan pun. Pengingat yang aktif akan muncul di kartu pengingat dan menjadi bagian dari ringkasan dashboard. Pada versi demo ini pengingat belum mengirim notifikasi ke luar browser.",
  },
  {
    id: "faq-6",
    category: "Data",
    question: "Di mana data saya disimpan?",
    answer:
      "Seluruh data SETARA disimpan di localStorage browser perangkat ini dan terhubung dengan akunmu. Data tetap ada setelah reload selama penyimpanan browser tidak dibersihkan. Cadangkan data secara berkala dari halaman Pengaturan.",
  },
  {
    id: "faq-7",
    category: "Data",
    question: "Bagaimana cara mencadangkan atau mengembalikan data?",
    answer:
      "Buka Pengaturan lalu pilih “Unduh cadangan (.json)” untuk menyimpan salinan data. Untuk kembali ke data contoh Aditya Pratama, pilih “Pulihkan data contoh”. Tindakan ini tidak dapat dibatalkan.",
  },
]

export default function BantuanPage() {
  const { profile } = useApp()
  const [query, setQuery] = useState("")
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return FAQS
    return FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(needle) ||
        faq.answer.toLowerCase().includes(needle) ||
        faq.category.toLowerCase().includes(needle),
    )
  }, [query])

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
          Dukungan pengguna
        </p>
        <h1 className="mt-1 font-heading text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
          Pusat bantuan
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          Temukan jawaban cepat atau hubungi tim akademik bila butuh bantuan lebih lanjut.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100/70 bg-emerald-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative grid size-9 place-items-center rounded-full bg-white text-emerald-600 ring-1 ring-emerald-100">
            <ShieldCheck className="size-4" />
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </span>
          <div>
            <p className="text-xs font-medium text-emerald-900">Semua sistem berjalan normal</p>
            <p className="mt-0.5 text-[10px] text-emerald-700/70">
              Penyimpanan lokal · localStorage
            </p>
          </div>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100">
          Terakhir diperiksa · hari ini
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {QUICK_GUIDES.map((guide) => {
          const Icon = guide.icon
          return (
            <Link key={guide.title} to={guide.to} className="group">
              <Panel className="h-full p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className={cn("grid size-9 place-items-center rounded-xl", guide.tone)}>
                    <Icon className="size-4" />
                  </span>
                  <ArrowRight className="size-3.5 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-500" />
                </div>
                <p className="mt-3 text-xs font-semibold text-zinc-900">{guide.title}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
                  {guide.description}
                </p>
              </Panel>
            </Link>
          )
        })}
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Panel className="overflow-hidden">
          <PanelHeader
            title="Pertanyaan yang sering diajukan"
            description={`${filtered.length} dari ${FAQS.length} artikel`}
            icon={<LifeBuoy className="size-4" />}
          />
          <div className="mt-4 border-t border-zinc-100 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari bantuan, misalnya: checklist atau data..."
                className="h-9 rounded-full border-zinc-200/80 bg-zinc-50/50 pl-9 text-xs"
              />
            </div>

            <div className="mt-3 divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-xs font-medium text-zinc-700">Belum ada artikel yang cocok</p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Coba kata kunci lain atau hubungi tim akademik.
                  </p>
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="mt-3 h-8 rounded-full border border-zinc-200 px-3 text-[11px] font-medium text-zinc-600 transition-all duration-200 hover:bg-zinc-50"
                  >
                    Reset pencarian
                  </button>
                </div>
              ) : (
                filtered.map((faq) => {
                  const open = openId === faq.id
                  return (
                    <div key={faq.id} className="py-1">
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : faq.id)}
                        className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-zinc-50/70"
                        aria-expanded={open}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="mb-1 block text-[9px] font-semibold tracking-wide text-zinc-400 uppercase">
                            {faq.category}
                          </span>
                          <span className="block text-xs font-medium text-zinc-900">
                            {faq.question}
                          </span>
                        </span>
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 text-zinc-400 transition-transform",
                            open && "rotate-180",
                          )}
                        />
                      </button>
                      {open ? (
                        <p className="px-2 pb-3 text-[11px] leading-relaxed text-zinc-500">
                          {faq.answer}
                        </p>
                      ) : null}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-5">
            <span className="grid size-9 place-items-center rounded-xl bg-brand text-brand-foreground">
              <MessageSquare className="size-4" />
            </span>
            <p className="mt-3 font-heading text-sm font-semibold text-zinc-900">
              Hubungi tim akademik
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
              Tim dukungan akademik siap membantu pertanyaan seputar akun, jadwal, dan
              penggunaan SETARA.
            </p>
            <div className="mt-4 space-y-2">
              <a
                href="mailto:akademik@kampus.ac.id"
                className="flex items-center gap-2.5 rounded-xl border border-zinc-200/70 px-3 py-2.5 text-[11px] text-zinc-600 transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900"
              >
                <Mail className="size-3.5 text-zinc-400" />
                akademik@kampus.ac.id
              </a>
              <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200/70 px-3 py-2.5 text-[11px] text-zinc-600">
                <Clock className="size-3.5 text-zinc-400" />
                Senin–Jumat · 08.00–16.00 WIB
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-zinc-50 p-3">
              <p className="text-[10px] text-zinc-400">Kamu masuk sebagai</p>
              <p className="mt-0.5 truncate text-[11px] font-medium text-zinc-700">
                {profile.name} · {profile.nim}
              </p>
            </div>
          </Panel>

          <Panel className="border-zinc-900 bg-brand p-5 text-brand-foreground">
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-8 place-items-center rounded-xl bg-white/10">
                <Check className="size-4" />
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium text-zinc-300">
                Tips
              </span>
            </div>
            <p className="mt-3 font-heading text-sm font-semibold">Mulai dari satu langkah kecil</p>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
              Pecah tugas besar menjadi tiga subtugas. Mencentang satu item pertama sering kali
              cukup untuk membangun momentum hari itu.
            </p>
            <Link
              to="/tugas"
              className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-[11px] font-medium text-zinc-900 transition-all duration-200 hover:bg-zinc-100"
            >
              Buka daftar tugas
              <ArrowRight className="size-3" />
            </Link>
          </Panel>
        </div>
      </div>
    </div>
  )
}
