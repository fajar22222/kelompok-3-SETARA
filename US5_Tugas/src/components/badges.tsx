import type { ComponentType } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Check,
  CircleDashed,
  Eye,
  X,
} from "lucide-react"

import type { AgendaType, Priority, TaskStatus } from "@/data/seed"
import { courseMeta } from "@/data/seed"
import { cn } from "@/lib/utils"

const STATUS_META: Record<
  TaskStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  selesai: {
    label: "Selesai",
    icon: Check,
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  dikerjakan: {
    label: "Dikerjakan",
    icon: CircleDashed,
    className: "bg-orange-50 text-orange-700 ring-orange-100",
  },
  belum: {
    label: "Belum mulai",
    icon: X,
    className: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  review: {
    label: "Perlu review",
    icon: Eye,
    className: "bg-purple-50 text-purple-700 ring-purple-100",
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: TaskStatus
  className?: string
}) {
  const meta = STATUS_META[status]
  const Icon = meta.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] leading-4 font-medium whitespace-nowrap ring-1 ring-inset",
        meta.className,
        className,
      )}
    >
      <Icon className="size-2.5" strokeWidth={2.2} />
      {meta.label}
    </span>
  )
}

const PRIORITY_META: Record<Priority, { dot: string; text: string }> = {
  Tinggi: { dot: "bg-rose-500", text: "text-rose-600" },
  Sedang: { dot: "bg-orange-400", text: "text-orange-600" },
  Rendah: { dot: "bg-zinc-300", text: "text-zinc-500" },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority]

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium whitespace-nowrap">
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      <span className={meta.text}>{priority}</span>
    </span>
  )
}

export function CourseChip({
  course,
  className,
  showShort = false,
}: {
  course: string
  className?: string
  showShort?: boolean
}) {
  const meta = courseMeta(course)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white px-2 py-0.5 text-[10px] leading-4 font-medium text-zinc-600",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {showShort ? meta.short : course}
    </span>
  )
}

const SESSION_META: Record<
  string,
  { label: string; icon: ComponentType<{ className?: string }>; className: string }
> = {
  selesai: {
    label: "Selesai",
    icon: CheckIcon,
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  berlangsung: {
    label: "Berlangsung",
    icon: DotIcon,
    className: "bg-orange-50 text-orange-700 ring-orange-100",
  },
  berikutnya: {
    label: "Berikutnya",
    icon: ClockIcon,
    className: "bg-zinc-100 text-zinc-600 ring-zinc-200/80",
  },
  terjadwal: {
    label: "Terjadwal",
    icon: ClockIcon,
    className: "bg-zinc-50 text-zinc-500 ring-zinc-200/70",
  },
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className} aria-hidden="true">
      <path d="M2.5 6.2 4.8 8.5 9.5 3.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function DotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="2.4" fill="currentColor" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="4.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M6 3.8V6l1.5 1" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}

export function SessionBadge({ status }: { status: string }) {
  const meta = SESSION_META[status] ?? SESSION_META.terjadwal
  const Icon = meta.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] leading-4 font-medium whitespace-nowrap ring-1 ring-inset",
        meta.className,
      )}
    >
      <Icon className="size-2.5" />
      {meta.label}
    </span>
  )
}

const EVENT_META: Record<AgendaType, { label: string; className: string }> = {
  kelas: { label: "Kuliah", className: "bg-indigo-50 text-indigo-700 ring-indigo-100" },
  deadline: { label: "Deadline", className: "bg-rose-50 text-rose-700 ring-rose-100" },
  lainnya: { label: "Agenda", className: "bg-zinc-100 text-zinc-600 ring-zinc-200/70" },
}

export function EventBadge({ type }: { type: AgendaType }) {
  const meta = EVENT_META[type]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] leading-4 font-medium whitespace-nowrap ring-1 ring-inset",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  )
}
