import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  AlarmClock,
  ArrowRight,
  Bell,
  CalendarClock,
  Check,
  CircleDashed,
  Clock,
  Flame,
  MapPin,
  Plus,
  TrendingUp,
} from "lucide-react"

import { SessionBadge, StatusBadge } from "@/components/badges"
import { AreaSpark, BarsSpark } from "@/components/charts"
import { FilterMenu } from "@/components/filter-menu"
import { Panel, PanelHeader } from "@/components/panel"
import { StatusStrip } from "@/components/status-strip"
import { TaskFormDialog } from "@/components/task-form-dialog"
import { TaskTable } from "@/components/task-table"
import { Button } from "@/components/ui/button"
import { useApp } from "@/context/app-context"
import { TODAY_ISO } from "@/data/seed"
import { diffDays, formatDayDate, formatShort, parseISO, relativeDay } from "@/lib/date"
import type { TaskFilters } from "@/lib/tasks"
import {
  defaultTaskFilters,
  filterTasks,
  sortByPriority,
  taskProgress,
} from "@/lib/tasks"

function greeting(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 11) return "Selamat pagi"
  if (hour < 15) return "Selamat siang"
  if (hour < 18) return "Selamat sore"
  return "Selamat malam"
}

export default function DashboardPage() {
  const { tasks, stats, sessions, reminders, profile } = useApp()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<TaskFilters>(defaultTaskFilters)
  const [taskOpen, setTaskOpen] = useState(false)

  const focusTask =
    sortByPriority(tasks.filter((task) => task.status !== "selesai"))[0] ??
    tasks.find((task) => task.status === "dikerjakan")
  const focusProgress = focusTask ? taskProgress(focusTask) : 0
  const focusOverdue = focusTask ? diffDays(focusTask.deadline, TODAY_ISO) < 0 : false

  const weekday = parseISO(TODAY_ISO).getDay()
  const todaySessions = sessions.filter((session) => session.day === weekday)
  const todayDeadlines = tasks.filter(
    (task) => task.deadline === TODAY_ISO && task.status !== "selesai",
  ).length
  const todayReminders = reminders.filter(
    (reminder) => reminder.date === TODAY_ISO && reminder.enabled,
  )

  const priorityTasks = sortByPriority(filterTasks(tasks, filters)).slice(0, 5)
  const userName = profile.name

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
            {formatDayDate(TODAY_ISO)} · {profile.semester}
          </p>
          <h1 className="mt-1 font-heading text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
            {greeting()}, {userName}.
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            {stats.aktif} tugas aktif, {stats.mendekati} tenggat dalam tiga hari, dan{" "}
            {todaySessions.length} kelas hari ini.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <FilterMenu filters={filters} onChange={setFilters} />
          <Button
            onClick={() => setTaskOpen(true)}
            className="h-9 rounded-full bg-brand px-4 text-xs font-medium text-brand-foreground shadow-sm transition-all duration-200 hover:bg-brand/90"
          >
            <Plus className="size-4" />
            Tambah tugas
          </Button>
        </div>
      </div>

      {/* Kartu metrik pastel */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-royal-border bg-royal-soft p-4 shadow-xs transition-all duration-200 dark:border-royal/30 dark:bg-royal-soft dark:shadow-none">
          <div className="flex items-center justify-between gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-white text-royal ring-1 ring-royal-border dark:bg-royal/20! dark:text-royal dark:ring-royal/30">
              <TrendingUp className="size-4" />
            </span>
            <AreaSpark data={[2, 3, 3, 4, 4, 5, 6]} color="var(--royal)" />
          </div>
          <p className="mt-3 text-[11px] font-medium text-royal-ink/70 dark:text-royal-ink/70">
            Progres semester
          </p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <p className="font-heading text-2xl font-semibold tracking-tight text-royal-ink tabular-nums dark:text-royal-ink">
              {stats.progress}%
            </p>
            <span className="text-[10px] text-royal dark:text-royal-ink/60">
              {stats.selesai}/{stats.total} tugas
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-royal-border bg-royal-soft p-4 shadow-xs transition-all duration-200 dark:border-royal/30 dark:bg-royal-soft dark:shadow-none">
          <div className="flex items-center justify-between gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-white text-royal ring-1 ring-royal-border dark:bg-royal/20! dark:text-royal dark:ring-royal/30">
              <Flame className="size-4" />
            </span>
            <BarsSpark data={[2, 4, 3, 5, 4, 6, 5]} color="var(--royal)" />
          </div>
          <p className="mt-3 text-[11px] font-medium text-royal-ink/70 dark:text-royal-ink/70">
            Tugas aktif
          </p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <p className="font-heading text-2xl font-semibold tracking-tight text-royal-ink tabular-nums dark:text-royal-ink">
              {stats.aktif}
            </p>
            <span className="text-[10px] text-royal dark:text-royal-ink/60">
              {stats.belum} belum · {stats.review} review
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-royal-border bg-royal-soft p-4 shadow-xs transition-all duration-200 dark:border-royal/30 dark:bg-royal-soft dark:shadow-none">
          <div className="flex items-center justify-between gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-white text-royal ring-1 ring-royal-border dark:bg-royal/20! dark:text-royal dark:ring-royal/30">
              <CalendarClock className="size-4" />
            </span>
            <span className="text-[10px] font-medium text-royal-ink/60 dark:text-royal-ink/60">
              {formatShort(TODAY_ISO)}
            </span>
          </div>
          <p className="mt-3 text-[11px] font-medium text-royal-ink/70 dark:text-royal-ink/70">
            Agenda hari ini
          </p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <p className="font-heading text-2xl font-semibold tracking-tight text-royal-ink tabular-nums dark:text-royal-ink">
              {todaySessions.length}
            </p>
            <span className="text-[10px] text-royal dark:text-royal-ink/60">
              kelas · {todayDeadlines} tenggat · {todayReminders.length} pengingat
            </span>
          </div>
        </div>
      </div>

      <StatusStrip
        items={[
          {
            key: "belum",
            value: `${stats.belum}/${stats.total}`,
            label: "Belum mulai",
            icon: CircleDashed,
            tone: "purple",
            onClick: () => navigate("/tugas?status=belum"),
          },
          {
            key: "deadline",
            value: `${stats.mendekati}/${stats.total}`,
            label: "Tenggat terdekat",
            icon: AlarmClock,
            tone: "orange",
            onClick: () => navigate("/tugas?range=7hari"),
          },
          {
            key: "dikerjakan",
            value: `${stats.dikerjakan}/${stats.total}`,
            label: "Sedang dikerjakan",
            icon: Clock,
            tone: "amber",
            onClick: () => navigate("/tugas?status=dikerjakan"),
          },
          {
            key: "selesai",
            value: `${stats.selesai}/${stats.total}`,
            label: "Selesai",
            icon: Check,
            tone: "emerald",
            onClick: () => navigate("/tugas?status=selesai"),
          },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          {focusTask ? (
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 border-l-4 border-l-brand! bg-white p-5 shadow-xs transition-all duration-200 dark:border-zinc-800 dark:border-l-brand! dark:bg-zinc-900 dark:shadow-none">
              <div className="flex flex-col gap-4 pl-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide text-brand uppercase">
                      <Flame className="size-3" />
                      {focusOverdue ? "Perlu diselesaikan" : "Fokus hari ini"}
                    </span>
                    <span className="text-zinc-300">·</span>
                    <span className="text-[10px] text-zinc-500">{focusTask.course}</span>
                  </div>
                  <h3 className="mt-2 font-heading text-lg font-semibold tracking-tight text-zinc-900">
                    {focusTask.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500">
                    <StatusBadge status={focusTask.status} />
                    <span>·</span>
                    <span
                      className={
                        focusOverdue
                          ? "font-medium text-rose-600"
                          : diffDays(focusTask.deadline, TODAY_ISO) === 0
                            ? "font-medium text-zinc-900"
                            : ""
                      }
                    >
                      {focusOverdue ? "Terlambat · " : ""}
                      {relativeDay(focusTask.deadline, TODAY_ISO)}
                    </span>
                    <span>·</span>
                    <span className="tabular-nums">{focusTask.time} WIB</span>
                    <span>·</span>
                    <span className="tabular-nums">Progres {focusProgress}%</span>
                  </div>
                  <div className="mt-3 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-brand-soft dark:bg-brand-soft">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${focusProgress}%` }}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => navigate(`/tugas?task=${focusTask.id}`)}
                  variant="outline"
                  className="h-9 shrink-0 rounded-full bg-brand-soft px-4 text-[11px] text-brand-soft-foreground transition-all duration-200 hover:bg-brand hover:text-white"
                >
                  Buka tugas
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          ) : null}

          <Panel className="overflow-hidden">
            <PanelHeader
              title="Tugas prioritas"
              description="Diurutkan dari tenggat terdekat dan prioritas"
              action={
                <>
                  <FilterMenu filters={filters} onChange={setFilters} />
                  <Link
                    to="/tugas"
                    className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-[11px] font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    Lihat semua
                    <ArrowRight className="size-3" />
                  </Link>
                </>
              }
            />
            <div className="mt-3 border-t border-zinc-100">
              <TaskTable
                tasks={priorityTasks}
                onSelect={(task) => navigate(`/tugas?task=${task.id}`)}
                emptyLabel="Tidak ada tugas yang cocok dengan filter ini."
                compact
              />
            </div>
          </Panel>
        </div>

        <div className="min-w-0 space-y-4">
          <Panel className="overflow-hidden">
            <PanelHeader
              title="Jadwal kuliah"
              description={formatDayDate(TODAY_ISO)}
              icon={<CalendarClock className="size-3.5" />}
              action={
                <Link
                  to="/jadwal"
                  className="grid size-7 place-items-center rounded-lg border border-zinc-200/80 text-zinc-400 transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900"
                  aria-label="Lihat jadwal kuliah"
                >
                  <ArrowRight className="size-3.5" />
                </Link>
              }
            />
            <div className="mt-3 divide-y divide-zinc-100 border-t border-zinc-100">
              {todaySessions.map((session) => (
                <div key={session.id} className="flex gap-3 px-5 py-3">
                  <div className="w-10 shrink-0 pt-0.5">
                    <p className="text-[10px] font-semibold text-zinc-700 tabular-nums">
                      {session.start}
                    </p>
                    <p className="text-[9px] text-zinc-400 tabular-nums">{session.end}</p>
                  </div>
                  <div className="min-w-0 flex-1 border-l border-zinc-100 pl-3">
                    <p className="truncate font-heading text-sm font-medium text-zinc-900">
                      {session.course}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9.5px] text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-2.5" />
                        {session.room}
                      </span>
                      <SessionBadge status={session.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader
              title="Pengingat"
              description={`${todayReminders.length} aktif hari ini`}
              icon={<Bell className="size-3.5" />}
              action={
                <Link
                  to="/pengingat"
                  className="text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
                >
                  Kelola
                </Link>
              }
            />
            <div className="mt-3 border-t border-zinc-100 px-5">
              {todayReminders.length === 0 ? (
                <p className="py-4 text-[11px] text-zinc-400">Tidak ada pengingat hari ini.</p>
              ) : (
                todayReminders
                  .slice()
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-baseline gap-3 border-b border-zinc-100 py-2.5 last:border-0"
                    >
                      <span className="w-9 shrink-0 text-[10px] font-semibold text-zinc-600 tabular-nums">
                        {reminder.time}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-zinc-900">
                          {reminder.title}
                        </p>
                        <p className="mt-0.5 truncate text-[9.5px] text-zinc-400">
                          {reminder.kind === "tugas"
                            ? "Tenggat tugas"
                            : reminder.kind === "harian"
                              ? "Rutinitas harian"
                              : "Agenda pribadi"}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-baseline justify-between gap-3 border-b border-zinc-100 pb-2.5">
              <p className="text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">
                Tenggat terdekat
              </p>
              <span className="text-[10px] text-zinc-400 tabular-nums">
                {stats.mendekati} dalam 3 hari
              </span>
            </div>
            {stats.terlambat > 0 ? (
              <p className="mt-2 text-[10px] font-medium text-rose-500">
                {stats.terlambat} tugas melewati tenggat
              </p>
            ) : null}
            <div className="mt-1">
              {tasks
                .filter((task) => task.status !== "selesai")
                .sort((a, b) => a.deadline.localeCompare(b.deadline))
                .slice(0, 3)
                .map((task) => (
                  <Link
                    key={task.id}
                    to={`/tugas?task=${task.id}`}
                    className="flex items-baseline justify-between gap-3 border-b border-zinc-100 py-2 text-[11px] last:border-0"
                  >
                    <span className="min-w-0 truncate text-zinc-600 transition-colors hover:text-zinc-950">
                      {task.title}
                    </span>
                    <span
                      className={
                        diffDays(task.deadline, TODAY_ISO) < 0
                          ? "shrink-0 text-[10px] font-medium text-rose-500 tabular-nums"
                          : "shrink-0 text-[10px] text-zinc-400 tabular-nums"
                      }
                    >
                      {formatShort(task.deadline)}
                    </span>
                  </Link>
                ))}
            </div>
          </Panel>
        </div>
      </div>

      <TaskFormDialog open={taskOpen} onOpenChange={setTaskOpen} />
    </div>
  )
}
