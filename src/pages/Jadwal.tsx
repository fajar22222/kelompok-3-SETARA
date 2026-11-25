import { useState } from "react"
import { Link } from "react-router-dom"
import {
  BookOpen,
  CalendarDays,
  Check,
  Clock,
  Download,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react"

import { SessionFormDialog } from "@/components/session-form-dialog"
import { SessionBadge } from "@/components/badges"
import { Panel } from "@/components/panel"
import { useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { useApp } from "@/context/app-context"
import type { ClassSession } from "@/data/seed"
import { TODAY_ISO, courseMeta } from "@/data/seed"
import { DAYS_FULL, formatDayDate, parseISO, timeRange } from "@/lib/date"
import { buildScheduleIcs, downloadIcs } from "@/lib/ics"
import { cn } from "@/lib/utils"

const DAYS = [1, 2, 3, 4, 5]

export default function JadwalPage() {
  const { sessions, tasks, agendas, profile, deleteSession, restoreSession } = useApp()
  const toast = useToast()
  const [downloaded, setDownloaded] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ClassSession | null>(null)
  const todayIndex = parseISO(TODAY_ISO).getDay()
  const todaySessions = sessions.filter((session) => session.day === todayIndex)
  const courseCount = new Set(sessions.map((session) => session.course)).size
  const todayDone = todaySessions.filter((session) => session.status === "selesai").length
  const todayLive = todaySessions.filter((session) => session.status === "berlangsung").length
  const todayLeft = todaySessions.filter(
    (session) => session.status === "terjadwal" || session.status === "berikutnya",
  ).length
  const todayRatio =
    todaySessions.length === 0 ? 0 : Math.round((todayDone / todaySessions.length) * 100)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (session: ClassSession) => {
    setEditing(session)
    setDialogOpen(true)
  }

  const handleDelete = (session: ClassSession) => {
    deleteSession(session.id)
    toast.undo("Jadwal kelas dihapus", () => restoreSession(session), session.course)
  }

  const summary = [
    {
      label: "Mata kuliah aktif",
      value: `${courseCount}`,
      hint: "Semester 5 · 20 SKS",
      icon: BookOpen,
      tone: "bg-violet-50 text-violet-600",
    },
    {
      label: "Kelas hari ini",
      value: `${todaySessions.length}`,
      hint: formatDayDate(TODAY_ISO),
      icon: CalendarDays,
      tone: "bg-orange-50 text-orange-600",
    },
    {
      label: "Total pertemuan",
      value: `${sessions.length}`,
      hint: "Jadwal mingguan tetap",
      icon: GraduationCap,
      tone: "bg-emerald-50 text-emerald-600",
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
            {profile.semester} · {profile.prodi}
          </p>
          <h1 className="mt-1 font-heading text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
            Jadwal kuliah
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Ritme mingguanmu dalam satu tampilan — lengkap dengan ruang dan status kelas.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            onClick={openCreate}
            className="h-9 shrink-0 rounded-full bg-brand px-4 text-xs font-medium text-brand-foreground shadow-sm transition-all duration-200 hover:bg-brand/90"
          >
            <Plus className="size-4" />
            Tambah kelas
          </Button>
          <Link
            to="/kalender"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-zinc-200/80 bg-white px-4 text-xs font-medium text-zinc-700 shadow-xs transition-all duration-200 hover:bg-zinc-50"
          >
            <CalendarDays className="size-4" />
            Lihat kalender
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {summary.map((item) => {
          const Icon = item.icon
          return (
            <Panel key={item.label} className="flex items-center gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", item.tone)}>
                <Icon className="size-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] text-zinc-500">{item.label}</p>
                <p className="mt-0.5 text-lg leading-tight font-semibold tracking-tight text-zinc-900 tabular-nums">
                  {item.value}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-zinc-400">{item.hint}</p>
              </div>
            </Panel>
          )
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="grid items-stretch gap-4 sm:grid-cols-2">
          {DAYS.map((day, index) => {
            const daySessions = sessions.filter((session) => session.day === day)
            const isToday = day === todayIndex
            const isLastOdd = index === DAYS.length - 1 && DAYS.length % 2 === 1
            return (
              <Panel
                key={day}
                className={cn(
                  "flex h-full flex-col overflow-hidden transition-all duration-200",
                  isToday && "ring-1 ring-zinc-900/10",
                  isLastOdd && "sm:col-span-2",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-between border-b border-zinc-100 px-4 py-3",
                    isToday && "bg-zinc-50/60",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "grid size-8 place-items-center rounded-lg text-[10px] font-semibold",
                        isToday
                          ? "bg-brand text-brand-foreground"
                          : "bg-zinc-50 text-zinc-500 ring-1 ring-zinc-200/60",
                      )}
                    >
                      {DAYS_FULL[day].slice(0, 3)}
                    </span>
                    <div>
                      <p className="font-heading text-sm font-semibold text-zinc-900">
                        {DAYS_FULL[day]}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {daySessions.length} kelas terjadwal
                      </p>
                    </div>
                  </div>
                  {isToday ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-emerald-600 uppercase">
                      Hari ini
                    </span>
                  ) : null}
                </div>

                <div className="divide-y divide-zinc-100">
                  {daySessions.length === 0 ? (
                    <p className="p-4 text-[11px] text-zinc-400">Tidak ada kelas.</p>
                  ) : (
                    daySessions.map((session) => {
                      const meta = courseMeta(session.course)
                      return (
                        <div key={session.id} className="flex gap-3 px-4 py-3">
                          <div className="w-14 shrink-0 pt-0.5">
                            <p className="text-[10px] font-semibold text-zinc-700 tabular-nums">
                              {session.start}
                            </p>
                            <p className="text-[10px] text-zinc-400 tabular-nums">{session.end}</p>
                          </div>
                          <div className="min-w-0 flex-1 border-l border-dashed border-zinc-200 pl-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-900">
                                {session.course}
                              </p>
                              <div className="flex shrink-0 items-center gap-1">
                                {isToday ? (
                                  <SessionBadge status={session.status} />
                                ) : (
                                  <span className={cn("mt-0.5 size-1.5 rounded-full", meta.dot)} />
                                )}
                                <button
                                  type="button"
                                  onClick={() => openEdit(session)}
                                  aria-label={`Ubah ${session.course}`}
                                  title="Ubah jadwal mingguan"
                                  className="grid size-6 place-items-center rounded-md text-zinc-300 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                                >
                                  <Pencil className="size-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(session)}
                                  aria-label={`Hapus ${session.course}`}
                                  title="Hapus jadwal mingguan"
                                  className="grid size-6 place-items-center rounded-md text-zinc-300 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                                >
                                  <Trash2 className="size-3" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-zinc-500">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="size-2.5" />
                                {session.room}
                              </span>
                              <span className="text-zinc-300">·</span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="size-2.5" />
                                {timeRange(session.start, session.end)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </Panel>
            )
          })}
        </div>

        <div className="flex flex-col gap-5">
          <Panel className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
                  Kelas hari ini
                </p>
                <p className="mt-1 font-heading text-2xl font-semibold tracking-tight text-zinc-900">
                  {todayDone}/{todaySessions.length}
                </p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  {todaySessions.length === 0
                    ? "Tidak ada kelas terjadwal hari ini"
                    : `${todayRatio}% sesi hari ini sudah selesai`}
                </p>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <Sparkles className="size-4" />
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${todayRatio}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-3">
              <div>
                <p className="text-sm font-semibold text-zinc-900 tabular-nums">{todayDone}</p>
                <p className="text-[10px] text-zinc-400">Selesai</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 tabular-nums">{todayLive}</p>
                <p className="text-[10px] text-zinc-400">Berlangsung</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 tabular-nums">{todayLeft}</p>
                <p className="text-[10px] text-zinc-400">Terjadwal</p>
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <p className="font-heading text-sm font-semibold text-zinc-900">Catatan jadwal</p>
            <ul className="mt-3 space-y-2.5 text-[11px] leading-relaxed text-zinc-500">
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-zinc-300" />
                Kelas Kecerdasan Buatan hari ini berlangsung di R. 402 hingga 11.40.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-zinc-300" />
                Praktikum Komputasi Awan Jumat dimulai pukul 10.00 di Lab. 502.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-zinc-300" />
                Perubahan ruang kelas akan diumumkan lewat halaman Pengingat.
              </li>
            </ul>
            <Button
              variant="outline"
              onClick={() => {
                downloadIcs(
                  buildScheduleIcs({ tasks, sessions, agendas }),
                  `setara-jadwal-${TODAY_ISO}.ics`,
                )
                setDownloaded(true)
                toast.success("Jadwal berhasil diunduh", "File .ics tersimpan di perangkatmu")
                window.setTimeout(() => setDownloaded(false), 2200)
              }}
              className="mt-4 h-9 w-full rounded-full text-[11px] transition-all duration-200"
            >
              {downloaded ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Download className="size-3.5" />
              )}
              {downloaded ? "Jadwal berhasil diunduh" : "Unduh jadwal (.ics)"}
            </Button>
          </Panel>
        </div>
      </div>

      <SessionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        session={editing}
      />
    </div>
  )
}
