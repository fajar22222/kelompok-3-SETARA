import { useMemo, useState } from "react"
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"

import { EventBadge } from "@/components/badges"
import { AgendaFormDialog } from "@/components/agenda-form-dialog"
import type { SessionEditContext } from "@/components/agenda-form-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState, Panel } from "@/components/panel"
import { TaskFormDialog } from "@/components/task-form-dialog"
import { useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useApp } from "@/context/app-context"
import type { AgendaItem, AgendaType, ClassSession, SessionOverride, Task } from "@/data/seed"
import { TODAY_ISO } from "@/data/seed"
import {
  DAYS_SHORT,
  MONTHS,
  formatDayDate,
  monthMatrix,
  parseISO,
  toISO,
} from "@/lib/date"
import type { CalendarEvent } from "@/lib/tasks"
import { eventsForDate } from "@/lib/tasks"
import { cn } from "@/lib/utils"

const EVENT_PILL: Record<AgendaType, string> = {
  kelas: "bg-indigo-50 text-indigo-700",
  deadline: "bg-rose-50 text-rose-700",
  lainnya: "bg-zinc-100 text-zinc-600",
}

const EVENT_DOT: Record<AgendaType, string> = {
  kelas: "bg-indigo-500",
  deadline: "bg-rose-500",
  lainnya: "bg-zinc-400",
}

type DeleteTarget =
  | { kind: "agenda"; agenda: AgendaItem }
  | { kind: "task"; task: Task }
  | { kind: "session"; session: ClassSession; date: string; previous?: SessionOverride }

export default function KalenderPage() {
  const {
    tasks,
    sessions,
    agendas,
    sessionOverrides,
    calendarReminders,
    toggleCalendarReminder,
    deleteAgenda,
    restoreAgenda,
    deleteTask,
    restoreTask,
    saveSessionOverride,
    clearSessionOverride,
  } = useApp()
  const toast = useToast()
  const today = parseISO(TODAY_ISO)

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState(TODAY_ISO)
  const [query, setQuery] = useState("")
  const [agendaOpen, setAgendaOpen] = useState(false)
  const [editingAgenda, setEditingAgenda] = useState<AgendaItem | null>(null)
  const [editingSession, setEditingSession] = useState<SessionEditContext | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)

  const cells = useMemo(() => monthMatrix(year, month), [year, month])
  const selectedEvents = useMemo(
    () => eventsForDate(selected, tasks, sessions, agendas, sessionOverrides),
    [selected, tasks, sessions, agendas, sessionOverrides],
  )
  const visibleEvents = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return selectedEvents
    return selectedEvents.filter((event) =>
      `${event.title} ${event.location ?? ""}`.toLowerCase().includes(needle),
    )
  }, [selectedEvents, query])

  const classCount = selectedEvents.filter((event) => event.type === "kelas").length
  const deadlineCount = selectedEvents.filter((event) => event.type === "deadline").length
  const otherCount = selectedEvents.filter((event) => event.type === "lainnya").length

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth())
  }

  /** Buka modal agenda baru; dipakai tombol header, panel, dan klik ganda sel. */
  const openCreateAgenda = (date = selected) => {
    const target = parseISO(date)
    setSelected(date)
    setYear(target.getFullYear())
    setMonth(target.getMonth())
    setEditingAgenda(null)
    setEditingSession(null)
    setEditingTask(null)
    setAgendaOpen(true)
  }

  const openEditEvent = (event: CalendarEvent) => {
    if (event.agendaId) {
      const agenda = agendas.find((item) => item.id === event.agendaId)
      if (!agenda) return
      setEditingAgenda(agenda)
      setEditingSession(null)
      setAgendaOpen(true)
      return
    }
    if (event.taskId) {
      const task = tasks.find((item) => item.id === event.taskId)
      if (!task) return
      setEditingTask(task)
      setTaskDialogOpen(true)
      return
    }
    if (event.sessionId) {
      const session = sessions.find((item) => item.id === event.sessionId)
      if (!session) return
      const override = sessionOverrides.find(
        (item) => item.sessionId === session.id && item.date === selected && !item.hidden,
      )
      setEditingSession({ session, date: selected, override })
      setEditingAgenda(null)
      setAgendaOpen(true)
    }
  }

  const requestDelete = (event: CalendarEvent) => {
    if (event.agendaId) {
      const agenda = agendas.find((item) => item.id === event.agendaId)
      if (agenda) setDeleteTarget({ kind: "agenda", agenda })
      return
    }
    if (event.taskId) {
      const task = tasks.find((item) => item.id === event.taskId)
      if (task) setDeleteTarget({ kind: "task", task })
      return
    }
    if (event.sessionId) {
      const session = sessions.find((item) => item.id === event.sessionId)
      if (!session) return
      const previous = sessionOverrides.find(
        (item) => item.sessionId === session.id && item.date === selected && !item.hidden,
      )
      setDeleteTarget({ kind: "session", session, date: selected, previous })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
            Perencanaan akademik
          </p>
          <h1 className="mt-1 font-heading text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
            Satu kalender, semua rencana.
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Kelas, deadline, dan agenda pribadi dalam satu tampilan yang tenang.
          </p>
        </div>
        <Button
          onClick={() => openCreateAgenda()}
          className="h-9 shrink-0 rounded-full bg-brand px-4 text-xs font-medium text-brand-foreground shadow-sm transition-all duration-200 hover:bg-brand/90"
        >
          <Plus className="size-4" />
          Tambah agenda
        </Button>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <Panel className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-zinc-400" />
              <h2 className="font-heading text-sm font-semibold text-zinc-900">
                {MONTHS[month]} {year}
              </h2>
              {month === today.getMonth() && year === today.getFullYear() ? (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-zinc-500 uppercase">
                  Bulan ini
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setYear(today.getFullYear())
                  setMonth(today.getMonth())
                  setSelected(TODAY_ISO)
                }}
                className="mr-1 h-7 rounded-full border border-zinc-200/80 px-2.5 text-[11px] font-medium text-zinc-600 transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900"
              >
                Hari ini
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="grid size-7 place-items-center rounded-full border border-zinc-200/80 text-zinc-500 transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="grid size-7 place-items-center rounded-full border border-zinc-200/80 text-zinc-500 transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-zinc-100 px-4 py-2.5 text-[10px] text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-indigo-500" />
              Jadwal kuliah
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-rose-500" />
              Deadline tugas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-zinc-400" />
              Agenda pribadi
            </span>
          </div>

          <div className="grid grid-cols-7 border-b border-zinc-100 bg-zinc-50/40">
            {DAYS_SHORT.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-[9px] font-semibold tracking-wide text-zinc-400 uppercase sm:text-[10px]"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((date) => {
              const iso = toISO(date)
              const inMonth = date.getMonth() === month
              const isToday = iso === TODAY_ISO
              const isSelected = iso === selected
              const events = eventsForDate(iso, tasks, sessions, agendas, sessionOverrides)

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    setSelected(iso)
                    if (!inMonth) {
                      setYear(date.getFullYear())
                      setMonth(date.getMonth())
                    }
                  }}
                  onDoubleClick={() => openCreateAgenda(iso)}
                  title="Klik dua kali untuk menambah agenda"
                  aria-label={`${formatDayDate(iso)} — klik dua kali untuk menambah agenda`}
                  className={cn(
                    "group relative flex min-h-[68px] cursor-pointer flex-col border-r border-b border-zinc-100 p-1.5 text-left transition-all duration-200 last:border-r-0 hover:bg-zinc-50/70 sm:min-h-[94px] sm:p-2",
                    !inMonth && "bg-zinc-50/30 text-zinc-300",
                    isSelected && "bg-zinc-50",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-medium tabular-nums sm:text-[11px]",
                      isSelected || isToday
                        ? "bg-brand text-brand-foreground"
                        : inMonth
                          ? "text-zinc-700"
                          : "text-zinc-300",
                    )}
                  >
                    {date.getDate()}
                  </span>

                  <span className="mt-1 hidden min-w-0 flex-col gap-0.5 sm:flex">
                    {events.slice(0, 2).map((event) => (
                      <span
                        key={event.id}
                        className={cn(
                          "flex min-w-0 items-center gap-1 truncate rounded px-1 py-0.5 text-[9px] font-medium",
                          EVENT_PILL[event.type],
                        )}
                      >
                        <span className={cn("size-1 shrink-0 rounded-full", EVENT_DOT[event.type])} />
                        <span className="truncate">{event.title}</span>
                      </span>
                    ))}
                    {events.length > 2 ? (
                      <span className="px-1 text-[9px] font-medium text-zinc-400">
                        +{events.length - 2} lagi
                      </span>
                    ) : null}
                  </span>

                  <span className="mt-1.5 flex flex-wrap gap-0.5 sm:hidden">
                    {events.slice(0, 3).map((event) => (
                      <span
                        key={event.id}
                        className={cn("size-1 rounded-full", EVENT_DOT[event.type])}
                      />
                    ))}
                    {events.length > 3 ? (
                      <span className="text-[8px] leading-none text-zinc-400">
                        +{events.length - 3}
                      </span>
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <div className="border-b border-zinc-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
                    Agenda terpilih
                  </p>
                  <h2 className="mt-1 font-heading text-base font-semibold tracking-tight text-zinc-900">
                    {formatDayDate(selected)}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    {classCount} kelas · {deadlineCount} deadline tugas
                    {otherCount > 0 ? ` · ${otherCount} agenda pribadi` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openCreateAgenda(selected)}
                  className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-zinc-200/80 px-2.5 text-[11px] font-medium text-zinc-600 transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  aria-label="Tambah agenda pada tanggal terpilih"
                >
                  <Plus className="size-3" />
                  Agenda
                </button>
              </div>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari agenda di tanggal ini..."
                  className="h-9 rounded-full border-zinc-200/80 bg-zinc-50/50 pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2 p-4">
              {visibleEvents.length === 0 ? (
                <EmptyState
                  icon={query ? <Search className="size-4" /> : <CalendarDays className="size-4" />}
                  title={
                    query
                      ? "Tidak ada agenda yang cocok"
                      : selectedEvents.length === 0
                        ? "Hari yang lapang"
                        : "Tidak ada agenda"
                  }
                  description={
                    query
                      ? "Coba kata kunci lain atau reset pencarian untuk melihat semua agenda."
                      : "Tidak ada agenda pada tanggal ini. Waktu yang tepat untuk mengerjakan tugas lebih awal."
                  }
                  action={
                    query ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setQuery("")}
                        className="mt-2 h-8 rounded-full text-[11px]"
                      >
                        Reset pencarian
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                visibleEvents.map((event) => {
                  const canManage = Boolean(event.agendaId || event.sessionId || event.taskId)
                  return (
                    <div
                      key={event.id}
                      className="group flex gap-3 rounded-xl border border-zinc-200/60 bg-white p-3 transition-all duration-200 hover:border-zinc-300"
                    >
                      <div className="w-10 shrink-0 pt-0.5">
                        <p className="text-[11px] font-semibold text-zinc-700 tabular-nums">
                          {event.time}
                        </p>
                        {event.endTime ? (
                          <p className="mt-0.5 text-[10px] text-zinc-400 tabular-nums">
                            {event.endTime}
                          </p>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-900">
                            {event.title}
                          </p>
                          <div className="flex shrink-0 items-center gap-0.5">
                            {canManage ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEditEvent(event)}
                                  aria-label={`Edit ${event.title}`}
                                  title={event.agendaId ? "Edit agenda" : event.taskId ? "Edit tugas" : "Edit jadwal kelas"}
                                  className="grid size-7 place-items-center rounded-md text-zinc-300 opacity-100 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                                >
                                  <Pencil className="size-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => requestDelete(event)}
                                  aria-label={`Hapus ${event.title}`}
                                  title={event.agendaId ? "Hapus agenda" : event.taskId ? "Hapus tugas" : "Hapus kelas dari tanggal ini"}
                                  className="grid size-7 place-items-center rounded-md text-zinc-300 opacity-100 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                                >
                                  <Trash2 className="size-3" />
                                </button>
                              </>
                            ) : null}
                            <EventBadge type={event.type} />
                          </div>
                        </div>
                        <p className="mt-1 flex items-center gap-1 truncate text-[10px] text-zinc-500">
                          {event.location ? (
                            <>
                              <MapPin className="size-2.5 shrink-0" />
                              {event.location}
                            </>
                          ) : (
                            <>
                              <Clock className="size-2.5 shrink-0" />
                              {event.type === "deadline"
                                ? "Tenggat pengumpulan"
                                : "Agenda pribadi"}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Panel>

          <Panel className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-sm font-semibold text-zinc-900">
                  Pengingat terjadwal
                </h2>
                <p className="mt-0.5 text-[11px] text-zinc-500">Pengingat aplikasi</p>
              </div>
              <span className="grid size-8 place-items-center rounded-xl bg-orange-50 text-orange-600">
                <Bell className="size-4" />
              </span>
            </div>

            <div className="mt-3 space-y-1">
              {calendarReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center gap-3 rounded-xl px-1 py-2">
                  <span className="grid h-7 w-11 shrink-0 place-items-center rounded-lg bg-zinc-100 text-[10px] font-semibold text-zinc-700 tabular-nums">
                    {reminder.time}
                  </span>
                  <p className="min-w-0 flex-1 text-[11px] leading-snug text-zinc-600">
                    {reminder.label}
                  </p>
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={() => toggleCalendarReminder(reminder.id)}
                    size="sm"
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 rounded-xl bg-zinc-50 p-2.5 text-[10px] leading-relaxed text-zinc-400">
              Pengingat ini tampil di kalender dan dashboard. Versi demo belum mengirim
              notifikasi ke luar browser.
            </p>
          </Panel>
        </div>
      </div>

      <AgendaFormDialog
        open={agendaOpen}
        onOpenChange={(open) => {
          setAgendaOpen(open)
          if (!open) {
            setEditingAgenda(null)
            setEditingSession(null)
          }
        }}
        defaultDate={selected}
        agenda={editingAgenda}
        session={editingSession}
        onCreated={(date) => {
          setSelected(date)
          const created = parseISO(date)
          setYear(created.getFullYear())
          setMonth(created.getMonth())
        }}
      />

      <TaskFormDialog
        open={taskDialogOpen}
        onOpenChange={(open) => {
          setTaskDialogOpen(open)
          if (!open) setEditingTask(null)
        }}
        task={editingTask}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title={
          deleteTarget?.kind === "session"
            ? "Hapus kelas dari tanggal ini?"
            : deleteTarget?.kind === "task"
              ? "Hapus tugas?"
              : "Hapus agenda?"
        }
        description={
          deleteTarget?.kind === "agenda"
            ? `“${deleteTarget.agenda.title}” akan dihapus dari kalender. Tindakan ini tidak dapat dibatalkan.`
            : deleteTarget?.kind === "task"
              ? `Deadline ini berasal dari tugas “${deleteTarget.task.title}”. Menghapusnya juga menghapus tugas tersebut dari daftar tugas.`
              : deleteTarget?.kind === "session"
                ? `“${deleteTarget.session.course}” akan dihapus dari tanggal ini. Jadwal rutin di tanggal lain tidak berubah.`
                : ""
        }
        confirmLabel={
          deleteTarget?.kind === "session"
            ? "Hapus kelas"
            : deleteTarget?.kind === "task"
              ? "Hapus tugas"
              : "Hapus"
        }
        onConfirm={() => {
          if (!deleteTarget) return
          if (deleteTarget.kind === "agenda") {
            deleteAgenda(deleteTarget.agenda.id)
            toast.undo(
              "Agenda dihapus",
              () => restoreAgenda(deleteTarget.agenda),
              `“${deleteTarget.agenda.title}” dapat dikembalikan dalam 5 detik.`,
            )
          } else if (deleteTarget.kind === "task") {
            deleteTask(deleteTarget.task.id)
            toast.undo(
              "Tugas dihapus",
              () => restoreTask(deleteTarget.task),
              `“${deleteTarget.task.title}” dapat dikembalikan dalam 5 detik.`,
            )
          } else {
            const { session, date, previous } = deleteTarget
            saveSessionOverride({ sessionId: session.id, date, hidden: true })
            toast.undo(
              "Kelas dihapus dari tanggal ini",
              () => {
                if (previous) {
                  // Bersihkan penanda hapus agar kelas muncul lagi di tanggal ini.
                  clearSessionOverride(session.id, date)
                  saveSessionOverride({ ...previous, hidden: false })
                } else {
                  clearSessionOverride(session.id, date)
                }
              },
              `“${session.course}” tetap ada di jadwal rutin tanggal lain.`,
            )
          }
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
