import { Inbox } from "lucide-react"

import { PriorityBadge, StatusBadge } from "@/components/badges"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Task } from "@/data/seed"
import { TODAY_ISO, courseMeta } from "@/data/seed"
import { diffDays, formatShort, relativeDay } from "@/lib/date"
import { taskProgress } from "@/lib/tasks"
import { cn } from "@/lib/utils"

export function TaskTable({
  tasks,
  selectedId,
  onSelect,
  emptyLabel = "Belum ada tugas yang cocok dengan filter ini.",
  className,
  compact = false,
}: {
  tasks: Task[]
  selectedId?: string | null
  onSelect?: (task: Task) => void
  emptyLabel?: string
  className?: string
  compact?: boolean
}) {
  return (
    <div className={className}>
      {/* Tabel: pada layar kecil dapat di-scroll horizontal tanpa memotong kolom. */}
      <div className="@container overflow-x-auto overscroll-x-contain">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow className="border-zinc-100 hover:bg-transparent">
              <TableHead className="h-9 pl-5 text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">
                Nama tugas &amp; mata kuliah
              </TableHead>
              <TableHead className="h-9 text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">
                Deadline
              </TableHead>
              <TableHead className="h-9 text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">
                Prioritas
              </TableHead>
              <TableHead className="hidden h-9 text-[10px] font-semibold tracking-wide text-zinc-400 uppercase @[780px]:table-cell">
                Progres
              </TableHead>
              <TableHead className="h-9 pr-5 text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-12">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="grid size-9 place-items-center rounded-full bg-zinc-50 text-zinc-400 ring-1 ring-zinc-200/60">
                      <Inbox className="size-4" />
                    </span>
                    <p className="text-xs text-zinc-500">{emptyLabel}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => {
                const meta = courseMeta(task.course)
                const progress = taskProgress(task)
                const delta = diffDays(task.deadline, TODAY_ISO)
                const overdue = delta < 0 && task.status !== "selesai"
                const dueToday = delta === 0 && task.status !== "selesai"
                const selected = selectedId === task.id

                return (
                  <TableRow
                    key={task.id}
                    onClick={() => onSelect?.(task)}
                    className={cn(
                      "border-zinc-100 align-middle transition-all duration-200",
                      onSelect && "cursor-pointer hover:bg-zinc-50/70",
                      selected && "bg-zinc-50/80 hover:bg-zinc-50",
                    )}
                  >
                    <TableCell className={cn("pl-5", compact ? "py-2.5" : "py-3")}>
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "grid size-8 shrink-0 place-items-center rounded-xl text-[9px] font-bold ring-1 ring-inset",
                            meta.chip,
                          )}
                        >
                          {meta.short}
                        </span>
                        <div className="min-w-0">
                          <p className="max-w-[200px] truncate text-[13px] font-medium text-zinc-900">
                            {task.title}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className={cn("size-1.5 rounded-full", meta.dot)} />
                            <p className="max-w-[190px] truncate text-[11px] text-zinc-500">
                              {task.course}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <p
                        className={cn(
                          "text-xs font-medium tabular-nums",
                          overdue ? "text-rose-600" : "text-zinc-700",
                        )}
                      >
                        {formatShort(task.deadline)}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-[10px]",
                          overdue
                            ? "font-medium text-rose-500"
                            : dueToday
                              ? "font-medium text-orange-500"
                              : "text-zinc-400",
                        )}
                      >
                        {overdue ? "Terlambat · " : ""}
                        {relativeDay(task.deadline, TODAY_ISO)} · {task.time}
                      </p>
                    </TableCell>
                    <TableCell className="py-3">
                      <PriorityBadge priority={task.priority} />
                    </TableCell>
                    <TableCell className="hidden py-3 @[780px]:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-100">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              progress === 100
                                ? "bg-emerald-500"
                                : progress > 0
                                  ? "bg-orange-400"
                                  : "bg-zinc-300",
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-zinc-500 tabular-nums">
                          {progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 pr-5">
                      <StatusBadge status={task.status} />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

