import { useEffect, useState } from "react"
import { Pencil, Plus, Sparkles } from "lucide-react"

import { Field } from "@/components/panel"
import { NativeSelect } from "@/components/native-select"
import { useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/context/app-context"
import type { Priority, Task, TaskStatus } from "@/data/seed"
import { COURSES, TODAY_ISO } from "@/data/seed"

export function TaskFormDialog({
  open,
  onOpenChange,
  defaultStatus = "belum",
  task,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultStatus?: TaskStatus
  task?: Task | null
}) {
  const { addTask, updateTask, addCustomCourse, customCourses } = useApp()
  const toast = useToast()
  const isEdit = Boolean(task)
  const [title, setTitle] = useState("")
  const [course, setCourse] = useState<string>(COURSES[0])
  const [customCourseName, setCustomCourseName] = useState("")
  const [deadline, setDeadline] = useState(TODAY_ISO)
  const [time, setTime] = useState("23.59")
  const [priority, setPriority] = useState<Priority>("Sedang")
  const [status, setStatus] = useState<TaskStatus>(defaultStatus)
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<{
    title?: string
    course?: string
    customCourse?: string
    deadline?: string
  }>({})

  const courseOptions = Array.from(
    new Set([...COURSES, ...customCourses, ...(task ? [task.course] : [])]),
  )

  useEffect(() => {
    if (!open) return
    setTitle(task?.title ?? "")
    setCourse(task?.course ?? COURSES[0])
    setCustomCourseName("")
    setDeadline(task?.deadline ?? TODAY_ISO)
    setTime(task?.time ?? "23.59")
    setPriority(task?.priority ?? "Sedang")
    setStatus(task?.status ?? defaultStatus)
    setNotes(task?.notes ?? "")
    setErrors({})
  }, [open, task, defaultStatus])

  const validate = () => {
    const next: typeof errors = {}
    if (title.trim().length < 3) next.title = "Nama tugas wajib diisi, minimal 3 karakter."
    if (!course) next.course = "Mata kuliah wajib dipilih."
    if (course === "__custom__" && customCourseName.trim().length < 2) {
      next.customCourse = "Nama mata kuliah baru wajib diisi."
    }
    if (!deadline) next.deadline = "Tenggat wajib diisi."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-2xl border border-zinc-200/70 p-0 sm:max-w-md">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            if (!validate()) return

            const cleanTime = time.replace(":", ".") || "23.59"
            const finalCourse =
              course === "__custom__" ? addCustomCourse(customCourseName) : course

            if (task) {
              // Sinkronkan checklist dengan status yang dipilih pengguna.
              const subtasks = task.subtasks.map((subtask) => ({
                ...subtask,
                done:
                  status === "selesai" ? true : status === "belum" ? false : subtask.done,
              }))
              updateTask(task.id, {
                title: title.trim(),
                course: finalCourse,
                deadline,
                time: cleanTime,
                priority,
                status,
                notes: notes.trim(),
                subtasks,
              })
              toast.success("Perubahan tugas disimpan", title.trim())
            } else {
              addTask({
                title,
                course: finalCourse,
                deadline,
                time: cleanTime,
                priority,
                status,
                notes,
              })
              toast.success("Tugas baru berhasil ditambahkan", title.trim())
            }
            onOpenChange(false)
          }}
        >
          <DialogHeader className="gap-1 border-b border-zinc-100 p-5 pr-12">
            <DialogTitle className="flex items-center gap-2 font-heading text-base font-semibold">
              <span className="grid size-7 place-items-center rounded-lg bg-brand text-brand-foreground">
                {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}
              </span>
              {isEdit ? "Edit tugas" : "Tambah tugas baru"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isEdit
                ? "Perbarui detail tugas. Perubahan tersimpan otomatis di perangkat ini."
                : "Tugas akan langsung masuk ke daftar dan tersimpan di perangkat ini."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 p-5">
            <Field label="Nama tugas" htmlFor="task-title" error={errors.title}>
              <Input
                id="task-title"
                autoFocus
                required
                aria-invalid={Boolean(errors.title)}
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  if (errors.title) setErrors((current) => ({ ...current, title: undefined }))
                }}
                placeholder="Contoh: Laporan akhir proyek RPL"
                className="h-9 rounded-lg border-zinc-200/80"
              />
            </Field>

            <Field
              label="Mata kuliah"
              htmlFor="task-course"
              error={errors.course ?? errors.customCourse}
            >
              <NativeSelect
                id="task-course"
                value={course}
                aria-invalid={Boolean(errors.course || errors.customCourse)}
                onChange={(event) => {
                  setCourse(event.target.value)
                  setErrors((current) => ({
                    ...current,
                    course: undefined,
                    customCourse: undefined,
                  }))
                }}
              >
                {courseOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
                <option value="__custom__">+ Tambah mata kuliah baru...</option>
              </NativeSelect>
              {course === "__custom__" ? (
                <Input
                  id="task-course-custom"
                  autoFocus
                  value={customCourseName}
                  aria-invalid={Boolean(errors.customCourse)}
                  aria-label="Nama mata kuliah baru"
                  onChange={(event) => {
                    setCustomCourseName(event.target.value)
                    if (errors.customCourse) {
                      setErrors((current) => ({ ...current, customCourse: undefined }))
                    }
                  }}
                  placeholder="Contoh: Basis Data Lanjut"
                  className="h-9 rounded-lg border-zinc-200/80"
                />
              ) : null}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Deadline" htmlFor="task-deadline" error={errors.deadline}>
                <Input
                  id="task-deadline"
                  type="date"
                  required
                  value={deadline}
                  aria-invalid={Boolean(errors.deadline)}
                  onChange={(event) => {
                    setDeadline(event.target.value)
                    if (errors.deadline) setErrors((current) => ({ ...current, deadline: undefined }))
                  }}
                  className="h-9 rounded-lg border-zinc-200/80"
                />
              </Field>
              <Field label="Jam tenggat" htmlFor="task-time">
                <Input
                  id="task-time"
                  type="time"
                  value={time.replace(".", ":")}
                  onChange={(event) => setTime(event.target.value.replace(":", "."))}
                  className="h-9 rounded-lg border-zinc-200/80"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Prioritas" htmlFor="task-priority">
                <NativeSelect
                  id="task-priority"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as Priority)}
                >
                  <option value="Tinggi">Tinggi</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Rendah">Rendah</option>
                </NativeSelect>
              </Field>
              <Field label="Status" htmlFor="task-status">
                <NativeSelect
                  id="task-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as TaskStatus)}
                >
                  <option value="belum">Belum mulai</option>
                  <option value="dikerjakan">Sedang dikerjakan</option>
                  <option value="review">Perlu review</option>
                  <option value="selesai">Selesai</option>
                </NativeSelect>
              </Field>
            </div>

            <Field
              label="Catatan"
              htmlFor="task-notes"
              hint="Opsional — tulis rencana singkat atau tautan referensi."
            >
              <Textarea
                id="task-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Apa langkah pertama untuk tugas ini?"
                className="min-h-20 resize-none rounded-lg border-zinc-200/80"
              />
            </Field>

            <div className="flex items-start gap-2 rounded-xl bg-purple-50/70 p-3 text-[11px] leading-relaxed text-purple-700 ring-1 ring-purple-100/70 ring-inset">
              <Sparkles className="mt-0.5 size-3.5 shrink-0" />
              <p>
                {isEdit
                  ? "Checklist akan menyesuaikan otomatis saat status diubah menjadi selesai atau belum mulai."
                  : "Setelah dibuat, kamu bisa menambah dan menghapus subtugas lewat panel detail untuk melacak progres."}
              </p>
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 flex-row justify-end rounded-b-2xl border-t border-zinc-100 bg-zinc-50/60 p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-brand px-4 text-brand-foreground transition-all duration-200 hover:bg-brand/90"
            >
              {isEdit ? "Simpan perubahan" : "Simpan tugas"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
