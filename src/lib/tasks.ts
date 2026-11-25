import type {
  AgendaItem,
  AgendaType,
  ClassSession,
  Priority,
  SessionOverride,
  Task,
  TaskStatus,
} from "@/data/seed"
import { TODAY_ISO } from "@/data/seed"
import { diffDays, parseISO } from "@/lib/date"

export type RangeFilter = "semester" | "7hari" | "30hari"

export interface TaskFilters {
  range: RangeFilter
  priority: Priority | "semua"
  status: TaskStatus | "semua"
}

export const defaultTaskFilters: TaskFilters = {
  range: "semester",
  priority: "semua",
  status: "semua",
}

export function countActiveFilters(filters: TaskFilters): number {
  // "Semester ini" adalah nilai bawaan, jadi tidak dihitung sebagai filter aktif.
  let count = filters.range === "semester" ? 0 : 1
  if (filters.priority !== "semua") count += 1
  if (filters.status !== "semua") count += 1
  return count
}

export interface TaskStats {
  total: number
  belum: number
  dikerjakan: number
  selesai: number
  review: number
  aktif: number
  mendekati: number
  terlambat: number
  progress: number
}

export function computeStats(tasks: Task[]): TaskStats {
  const total = tasks.length
  const belum = tasks.filter((task) => task.status === "belum").length
  const dikerjakan = tasks.filter((task) => task.status === "dikerjakan").length
  const selesai = tasks.filter((task) => task.status === "selesai").length
  const review = tasks.filter((task) => task.status === "review").length
  const mendekati = tasks.filter((task) => {
    if (task.status === "selesai") return false
    const delta = diffDays(task.deadline, TODAY_ISO)
    return delta >= 0 && delta <= 3
  }).length
  const terlambat = tasks.filter(
    (task) => task.status !== "selesai" && diffDays(task.deadline, TODAY_ISO) < 0,
  ).length

  return {
    total,
    belum,
    dikerjakan,
    selesai,
    review,
    aktif: total - selesai,
    mendekati,
    terlambat,
    progress: total === 0 ? 0 : Math.round((selesai / total) * 100),
  }
}

export function taskProgress(task: Task): number {
  // Status "selesai" adalah sumber kebenaran, sehingga tidak mungkin
  // menampilkan tugas selesai dengan progres 0% (mis. data lama/import).
  if (task.status === "selesai") return 100
  if (task.subtasks.length === 0) return 0
  const done = task.subtasks.filter((subtask) => subtask.done).length
  return Math.round((done / task.subtasks.length) * 100)
}

export function filterTasks(
  tasks: Task[],
  filters: TaskFilters,
  query = "",
  todayISO = TODAY_ISO,
): Task[] {
  const needle = query.trim().toLowerCase()

  return tasks.filter((task) => {
    if (filters.status !== "semua" && task.status !== filters.status) return false
    if (filters.priority !== "semua" && task.priority !== filters.priority) return false

    if (filters.range !== "semester") {
      const delta = diffDays(task.deadline, todayISO)
      const limit = filters.range === "7hari" ? 7 : 30
      // Sertakan tugas yang sudah lewat deadline agar tidak "menghilang"
      // saat pengguna membuka filter tenggat terdekat.
      if (delta < -limit || delta > limit) return false
    }

    if (!needle) return true
    return (
      task.title.toLowerCase().includes(needle) ||
      task.course.toLowerCase().includes(needle) ||
      task.notes.toLowerCase().includes(needle)
    )
  })
}

const STATUS_ORDER: Record<TaskStatus, number> = {
  dikerjakan: 0,
  belum: 1,
  review: 2,
  selesai: 3,
}

const PRIORITY_ORDER: Record<Priority, number> = {
  Tinggi: 0,
  Sedang: 1,
  Rendah: 2,
}

export function sortByDeadline(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.deadline === b.deadline) {
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    }
    return a.deadline.localeCompare(b.deadline)
  })
}

export function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Tugas selesai selalu di bawah, sisanya diurutkan berdasarkan tenggat
    // (termasuk yang sudah terlambat), baru prioritas dan status.
    const aDone = a.status === "selesai"
    const bDone = b.status === "selesai"
    if (aDone !== bDone) return aDone ? 1 : -1
    if (a.deadline !== b.deadline) return a.deadline.localeCompare(b.deadline)
    if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    }
    return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  })
}

export interface CourseStat {
  course: string
  total: number
  selesai: number
  aktif: number
  progress: number
}

export function courseStats(tasks: Task[]): CourseStat[] {
  const grouped = new Map<string, Task[]>()

  for (const task of tasks) {
    const list = grouped.get(task.course) ?? []
    list.push(task)
    grouped.set(task.course, list)
  }

  return [...grouped.entries()].map(([course, list]) => {
    const selesai = list.filter((task) => task.status === "selesai").length
    return {
      course,
      total: list.length,
      selesai,
      aktif: list.length - selesai,
      progress: list.length === 0 ? 0 : Math.round((selesai / list.length) * 100),
    }
  })
}

export interface CalendarEvent {
  id: string
  title: string
  time: string
  endTime?: string
  type: AgendaType
  location?: string
  course?: string
  agendaId?: string
  sessionId?: string
  taskId?: string
}

export function eventsForDate(
  iso: string,
  tasks: Task[],
  sessions: ClassSession[],
  agendas: AgendaItem[],
  sessionOverrides: SessionOverride[] = [],
): CalendarEvent[] {
  const weekday = parseISO(iso).getDay()
  const events: CalendarEvent[] = []

  for (const session of sessions) {
    if (session.day !== weekday) continue
    const override = sessionOverrides.find(
      (item) => item.sessionId === session.id && item.date === iso,
    )
    if (override?.hidden) continue
    events.push({
      id: `${session.id}-${iso}`,
      title: override?.title ?? session.course,
      time: override?.start ?? session.start,
      endTime: override?.end ?? session.end,
      type: override?.type ?? "kelas",
      location: override?.room ?? session.room,
      course: session.course,
      sessionId: session.id,
    })
  }

  for (const task of tasks) {
    if (task.deadline !== iso) continue
    events.push({
      id: `${task.id}-${iso}`,
      title: task.title,
      time: task.time,
      type: "deadline",
      course: task.course,
      taskId: task.id,
    })
  }

  for (const agenda of agendas) {
    if (agenda.date !== iso) continue
    events.push({
      id: agenda.id,
      title: agenda.title,
      time: agenda.time,
      endTime: agenda.endTime,
      type: agenda.type,
      location: agenda.location,
      agendaId: agenda.id,
    })
  }

  return events.sort((a, b) => a.time.localeCompare(b.time))
}
