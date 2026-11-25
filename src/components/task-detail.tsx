import { useState } from "react"
import {
  Bell,
  CalendarClock,
  Check,
  CircleDot,
  Flame,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import { CourseChip, StatusBadge } from "@/components/badges"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { MetaTile } from "@/components/panel"
import { TaskFormDialog } from "@/components/task-form-dialog"
import { useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/context/app-context"
import type { Task } from "@/data/seed"
import { TODAY_ISO } from "@/data/seed"
import { formatShort, parseISO, relativeDay } from "@/lib/date"
import { taskProgress } from "@/lib/tasks"
import { cn } from "@/lib/utils"

export function TaskDetail({
  task,
  className,
  onClose,
}: {
  task: Task
  className?: string
  onClose?: () => void
}) {
  const {
    toggleSubtask,
    markTaskDone,
    updateTask,
    deleteTask,
    restoreTask,
    addSubtask,
    deleteSubtask,
  } = useApp()
  const toast = useToast()
  const progress = taskProgress(task)
  const doneCount = task.subtasks.filter((subtask) => subtask.done).length
  const totalCount = task.subtasks.length

  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [newSubtask, setNewSubtask] = useState("")

  const submitSubtask = () => {
    const clean = newSubtask.trim()
    if (!clean) return
    addSubtask(task.id, clean)
    toast.success("Subtugas ditambahkan", clean)
    setNewSubtask("")
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <CourseChip course={task.course} showShort />
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                aria-label="Edit tugas"
                title="Edit tugas"
                className="grid size-9 place-items-center rounded-lg text-zinc-400 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                aria-label="Hapus tugas"
                title="Hapus tugas"
                className="grid size-9 place-items-center rounded-lg text-zinc-400 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="size-3.5" />
              </button>
              <span className="hidden sm:inline-flex">
                <StatusBadge status={task.status} className="ml-1.5" />
              </span>
            </div>
          </div>
          <h2 className="font-heading text-lg leading-snug font-semibold tracking-tight text-zinc-900">
            {task.title}
          </h2>
          <p className="text-xs leading-relaxed text-zinc-500">{task.notes}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MetaTile
            icon={<CalendarClock className="size-3" />}
            label="Deadline"
            value={`${formatShort(task.deadline)} ${parseISO(task.deadline).getFullYear()}`}
            hint={`${relativeDay(task.deadline, TODAY_ISO)} · ${task.time} WIB`}
          />
          <MetaTile
            icon={<Flame className="size-3" />}
            label="Prioritas"
            value={task.priority}
            hint="Beban & tenggat"
          />
          <MetaTile
            icon={<CircleDot className="size-3" />}
            label="Status"
            value={
              task.status === "belum"
                ? "Belum mulai"
                : task.status === "dikerjakan"
                  ? "Dikerjakan"
                  : task.status === "review"
                    ? "Perlu review"
                    : "Selesai"
            }
            hint={`${progress}% progres tugas`}
          />
          <MetaTile
            icon={<Bell className="size-3" />}
            label="Pengingat"
            value={task.reminder}
            hint="Sebelum tenggat"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-zinc-500">Progres keseluruhan</span>
            <span className="font-semibold text-zinc-900 tabular-nums">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                progress === 100
                  ? "bg-emerald-500"
                  : progress > 0
                    ? "bg-brand"
                    : "bg-zinc-300",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">
              Catatan
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400">
              <Check className="size-3 text-emerald-500" />
              Tersimpan otomatis
            </span>
          </div>
          <Textarea
            value={task.notes}
            onChange={(event) => updateTask(task.id, { notes: event.target.value })}
            placeholder="Tulis catatan, tautan referensi, atau rencana pengerjaan..."
            className="min-h-24 resize-none rounded-xl border-zinc-200/80 bg-zinc-50/40 text-xs leading-relaxed"
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">
              <ListChecks className="size-3.5" />
              Checklist
            </p>
            <span className="text-[10px] font-medium text-zinc-400 tabular-nums">
              {doneCount}/{totalCount} selesai
            </span>
          </div>

          {totalCount === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-4 text-center text-[11px] text-zinc-400">
              Belum ada subtugas. Tambahkan langkah pertama di bawah.
            </p>
          ) : (
            <div className="space-y-1">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className={cn(
                    "group flex items-start gap-2.5 rounded-xl border border-transparent px-2.5 py-2 transition-all duration-200 hover:border-zinc-100 hover:bg-zinc-50/70",
                    subtask.done && "opacity-70",
                  )}
                >
                  <Checkbox
                    checked={subtask.done}
                    onCheckedChange={() => toggleSubtask(task.id, subtask.id)}
                    className="mt-0.5 size-4.5"
                    aria-label={subtask.title}
                  />
                  <button
                    type="button"
                    onClick={() => toggleSubtask(task.id, subtask.id)}
                    className={cn(
                      "flex-1 py-0.5 text-left text-xs leading-relaxed text-zinc-700 transition-colors hover:text-zinc-950",
                      subtask.done && "text-zinc-400 line-through",
                    )}
                  >
                    {subtask.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteSubtask(task.id, subtask.id)
                      toast.info("Subtugas dihapus", subtask.title)
                    }}
                    aria-label={`Hapus subtugas ${subtask.title}`}
                    title="Hapus subtugas"
                    className="grid size-8 shrink-0 place-items-center rounded-md text-zinc-300 transition-all duration-200 hover:bg-rose-50 hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              submitSubtask()
            }}
          >
            <Input
              value={newSubtask}
              onChange={(event) => setNewSubtask(event.target.value)}
              placeholder="Tambah langkah baru..."
              className="h-9 rounded-lg border-zinc-200/80 bg-zinc-50/40 text-xs"
            />
            <Button
              type="submit"
              disabled={!newSubtask.trim()}
              className="h-9 shrink-0 rounded-full bg-brand px-3 text-[11px] text-brand-foreground transition-all duration-200 hover:bg-brand/90"
            >
              <Plus className="size-3.5" />
              Tambah
            </Button>
          </form>
        </div>
      </div>

      <div className="shrink-0 border-t border-zinc-100 bg-white p-4">
        <Button
          onClick={() => {
            const wasDone = task.status === "selesai"
            markTaskDone(task.id)
            if (wasDone) {
              toast.info("Tugas dikembalikan", "Status berubah menjadi belum selesai")
            } else {
              toast.success("Selamat! Tugas ditandai selesai", task.title)
            }
            onClose?.()
          }}
          className="h-11 w-full rounded-full bg-brand text-sm font-medium text-brand-foreground shadow-sm transition-all duration-200 hover:bg-brand/90"
        >
          <Check className="size-4" />
          {task.status === "selesai" ? "Tandai belum selesai" : "Tandai selesai"}
        </Button>
        <p className="mt-2 text-center text-[10px] text-zinc-400">
          Perubahan tersimpan otomatis di perangkat ini
        </p>
      </div>

      <TaskFormDialog open={editOpen} onOpenChange={setEditOpen} task={task} />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Hapus tugas?"
        description={`“${task.title}” akan dihapus bersama catatan dan checklist-nya. Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={() => {
          deleteTask(task.id)
          toast.undo("Tugas dihapus", () => restoreTask(task), `“${task.title}” dapat dikembalikan dalam 5 detik.`)
          onClose?.()
        }}
      />
    </div>
  )
}
