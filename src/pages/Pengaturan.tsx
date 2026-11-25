import { useEffect, useState } from "react"
import {
  Bell,
  Check,
  Database,
  Download,
  GraduationCap,
  LogOut,
  Mail,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { Field, Panel, PanelHeader } from "@/components/panel"
import { NativeSelect } from "@/components/native-select"
import { useToast } from "@/components/toast-provider"
import { useTheme } from "@/components/theme-provider"
import type { ThemeChoice } from "@/components/theme-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useApp } from "@/context/app-context"
import type { Preferences, Profile } from "@/data/seed"
import { PRODI_OPTIONS, TODAY_ISO, UNIVERSITY_OPTIONS } from "@/data/seed"
import { cn } from "@/lib/utils"

const PREF_ITEMS: {
  key: keyof Preferences
  title: string
  description: string
  icon: typeof Bell
}[] = [
  {
    key: "pushNotif",
    title: "Notifikasi push",
    description: "Ingatkan deadline dan perubahan jadwal secara real-time.",
    icon: Bell,
  },
  {
    key: "emailNotif",
    title: "Ringkasan email",
    description: "Kirim rekap tugas dan agenda ke email kampus setiap pagi.",
    icon: Mail,
  },
  {
    key: "weeklySummary",
    title: "Laporan mingguan",
    description: "Dapatkan rangkuman progres setiap Minggu malam.",
    icon: Sparkles,
  },
  {
    key: "focusTips",
    title: "Tips fokus harian",
    description: "Tampilkan saran singkat di dashboard untuk menjaga ritme.",
    icon: Check,
  },
  {
    key: "compactMode",
    title: "Tampilan ringkas",
    description: "Kurangi jarak antar elemen agar lebih banyak tugas terlihat.",
    icon: Settings,
  },
]

export default function PengaturanPage() {
  const {
    profile,
    preferences,
    tasks,
    sessions,
    agendas,
    sessionOverrides,
    customCourses,
    reminders,
    calendarReminders,
    updateProfile,
    updatePreferences,
    resetData,
    signOut,
  } = useApp()
  const toast = useToast()
  const { theme, setTheme } = useTheme()
  const [form, setForm] = useState<Profile>(profile)
  const [saved, setSaved] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  useEffect(() => {
    setForm(profile)
  }, [profile])

  useEffect(() => {
    if (!saved) return
    const timer = window.setTimeout(() => setSaved(false), 2200)
    return () => window.clearTimeout(timer)
  }, [saved])

  const initials = profile.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const setField = (key: keyof Profile, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const exportBackup = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      version: 2,
      tasks,
      sessions,
      agendas,
      sessionOverrides,
      customCourses,
      reminders,
      calendarReminders,
      profile,
      preferences,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `setara-backup-${TODAY_ISO}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.success("Cadangan berhasil diunduh", "File .json tersimpan di perangkatmu")
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
          Preferensi akun
        </p>
        <h1 className="mt-1 font-heading text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
          Pengaturan
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          Sesuaikan profil, notifikasi, dan tampilan SETARA dengan ritme belajarmu.
        </p>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <PanelHeader
              title="Profil mahasiswa"
              description="Informasi ini tampil di sidebar dan dashboard"
              icon={<User className="size-4" />}
            />
            <div className="mt-4 border-t border-zinc-100 p-5">
              <div className="flex items-center gap-3.5">
                <Avatar className="size-14 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-zinc-700 to-zinc-500 text-sm font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-heading text-base font-semibold text-zinc-900">{form.name}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    {form.prodi} · {form.semester}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-500 ring-1 ring-zinc-200/60">
                    <ShieldCheck className="size-2.5 text-emerald-500" />
                    Akun kampus terverifikasi
                  </p>
                </div>
              </div>

              <form
                className="mt-5 space-y-3.5"
                onSubmit={(event) => {
                  event.preventDefault()
                  updateProfile(form)
                  setSaved(true)
                  toast.success("Profil berhasil disimpan", "Perubahan tampil di sidebar")
                }}
              >
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Field label="Nama lengkap" htmlFor="profile-name">
                    <Input
                      id="profile-name"
                      value={form.name}
                      onChange={(event) => setField("name", event.target.value)}
                      className="h-9 rounded-lg border-zinc-200/80"
                    />
                  </Field>
                  <Field label="NIM" htmlFor="profile-nim">
                    <Input
                      id="profile-nim"
                      value={form.nim}
                      onChange={(event) => setField("nim", event.target.value)}
                      className="h-9 rounded-lg border-zinc-200/80"
                    />
                  </Field>
                </div>

                <Field label="Email kampus" htmlFor="profile-email">
                  <Input
                    id="profile-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setField("email", event.target.value)}
                    className="h-9 rounded-lg border-zinc-200/80"
                  />
                </Field>

                <Field label="Universitas" htmlFor="profile-university">
                  <NativeSelect
                    id="profile-university"
                    value={form.university}
                    onChange={(event) => setField("university", event.target.value)}
                  >
                    {Array.from(new Set<string>([...UNIVERSITY_OPTIONS, form.university])).map(
                      (university) => (
                        <option key={university}>{university}</option>
                      ),
                    )}
                  </NativeSelect>
                </Field>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Field label="Program studi" htmlFor="profile-prodi">
                    <NativeSelect
                      id="profile-prodi"
                      value={form.prodi}
                      onChange={(event) => setField("prodi", event.target.value)}
                    >
                      {Array.from(new Set<string>([...PRODI_OPTIONS, form.prodi])).map(
                        (prodi) => (
                          <option key={prodi}>{prodi}</option>
                        ),
                      )}
                    </NativeSelect>
                  </Field>
                  <Field label="Semester" htmlFor="profile-semester">
                    <NativeSelect
                      id="profile-semester"
                      value={form.semester}
                      onChange={(event) => setField("semester", event.target.value)}
                    >
                      <option>Semester 1</option>
                      <option>Semester 2</option>
                      <option>Semester 3</option>
                      <option>Semester 4</option>
                      <option>Semester 5</option>
                      <option>Semester 6</option>
                      <option>Semester 7</option>
                    </NativeSelect>
                  </Field>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-3.5">
                  <p
                    className={cn(
                      "inline-flex items-center gap-1 text-[11px] text-emerald-600 transition-opacity",
                      saved ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <Check className="size-3.5" />
                    Perubahan tersimpan
                  </p>
                  <Button
                    type="submit"
                    className="h-8 rounded-full bg-brand px-4 text-xs text-brand-foreground transition-all duration-200 hover:bg-brand/90"
                  >
                    <Save className="size-3.5" />
                    Simpan profil
                  </Button>
                </div>
              </form>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader
              title="Informasi akademik"
              description="Data yang terhubung dengan akun kampus"
              icon={<GraduationCap className="size-4" />}
            />
            <div className="mt-4 divide-y divide-zinc-100 border-t border-zinc-100">
              {[
                { label: "Universitas", value: profile.university },
                { label: "Program studi", value: profile.prodi },
                { label: "Semester aktif", value: `${profile.semester} · 2026/2027 Ganjil` },
                { label: "Dosen wali", value: "Dr. Rina Kartika, M.Kom." },
                { label: "Status akademik", value: "Aktif" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 px-5 py-3 text-xs"
                >
                  <span className="text-zinc-500">{row.label}</span>
                  <span className="text-right font-medium text-zinc-800">{row.value}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <PanelHeader
              title="Tema tampilan"
              description="Pilih mode terang, gelap, atau mengikuti sistem"
              icon={<Settings className="size-4" />}
            />
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-100 p-5 dark:border-zinc-800">
              {(
                [
                  { value: "light", label: "Terang", icon: "☀" },
                  { value: "dark", label: "Gelap", icon: "☾" },
                  { value: "system", label: "Sistem", icon: "◐" },
                ] as { value: ThemeChoice; label: string; icon: string }[]
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  aria-pressed={theme === option.value}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[11px] font-medium transition-all duration-200",
                    theme === option.value
                      ? "border-zinc-900 bg-zinc-50 text-zinc-900 ring-1 ring-zinc-900/10 dark:border-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-100/20"
                      : "border-zinc-200/80 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                  )}
                >
                  <span className="text-base leading-none">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
            <p className="border-t border-zinc-100 bg-zinc-50/60 px-5 py-3 text-[10px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
              Pilihan tersimpan di perangkat ini dengan kunci <code>setara-theme</code>.
            </p>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader
              title="Notifikasi & tampilan"
              description="Preferensi tersimpan di perangkat ini"
              icon={<Bell className="size-4" />}
            />
            <div className="mt-4 divide-y divide-zinc-100 border-t border-zinc-100">
              {PREF_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={String(item.key)}
                    className="flex items-start justify-between gap-4 px-5 py-3.5"
                  >
                    <div className="flex min-w-0 gap-2.5">
                      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-zinc-50 text-zinc-400 ring-1 ring-zinc-200/60">
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-800">{item.title}</p>
                        <p className="mt-0.5 text-[10px] leading-relaxed text-zinc-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences[item.key]}
                      onCheckedChange={(checked) =>
                        updatePreferences({ [item.key]: checked } as Partial<Preferences>)
                      }
                      aria-label={item.title}
                    />
                  </div>
                )
              })}
            </div>
            <p className="border-t border-zinc-100 bg-zinc-50/60 px-5 py-3 text-[10px] leading-relaxed text-zinc-500">
              Versi demo: notifikasi push, ringkasan email, dan tips fokus belum dikirim ke luar
              perangkat ini. Pengingat tetap tampil di dashboard dan kalender.
            </p>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader
              title="Data & privasi"
              description="Tersimpan di perangkat ini"
              icon={<Database className="size-4" />}
            />
            <div className="mt-4 border-t border-zinc-100 p-5">
              <p className="text-[11px] leading-relaxed text-zinc-500">
                Tugas, checklist, agenda, dan pengingat disimpan di localStorage perangkat
                ini. Unduh cadangan untuk menyimpan salinan di luar browser.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={exportBackup}
                className="mt-3 h-8 w-full rounded-full border-zinc-200/80 text-[11px] text-zinc-600 transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900"
              >
                <Download className="size-3.5" />
                Unduh cadangan (.json)
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setResetOpen(true)}
                className="mt-2 h-8 w-full rounded-full border-zinc-200/80 text-[11px] text-zinc-600 transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900"
              >
                <RotateCcw className="size-3.5" />
                Pulihkan data contoh
              </Button>
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-heading text-sm font-semibold text-zinc-900">
                  Sesi perangkat
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                  Kamu masuk sebagai {profile.email} di perangkat ini.
                </p>
              </div>
              <span className="grid size-8 place-items-center rounded-xl bg-zinc-50 text-zinc-400 ring-1 ring-zinc-200/60">
                <ShieldCheck className="size-4" />
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                signOut()
                toast.success("Berhasil keluar", "Sesi perangkat ini sudah diakhiri")
              }}
              className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-full border border-zinc-200/80 text-[11px] font-medium text-zinc-600 transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900"
            >
              <LogOut className="size-3.5" />
              Keluar dari akun
            </button>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Pulihkan data contoh?"
        description="Seluruh tugas, catatan, checklist, agenda, dan pengingat yang kamu buat akan diganti dengan data awal SETARA. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, pulihkan"
        onConfirm={() => {
          resetData()
          toast.success("Data contoh dipulihkan", "Semua perubahan kembali ke data awal")
        }}
      />
    </div>
  )
}
