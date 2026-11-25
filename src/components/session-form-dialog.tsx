import { useEffect, useState } from "react"

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
import { useApp } from "@/context/app-context"
import type { ClassSession } from "@/data/seed"
import { COURSES } from "@/data/seed"
import { DAYS_FULL } from "@/lib/date"

const STATUS_LABELS: Record<ClassSession["status"], string> = {
  terjadwal: "Terjadwal",
  berlangsung: "Berlangsung",
  selesai: "Selesai",
  berikutnya: "Berikutnya",
}

const STATUS_KEYS = Object.keys(STATUS_LABELS) as ClassSession["status"][]

function toTimeInput(value: string): string {
  return value.replace(".", ":")
}

function addHour(value: string): string {
  const [hour, minute] = value.replace(".", ":").split(":").map(Number)
  const nextHour = Math.min(23, (hour || 0) + 1)
  return `${String(nextHour).padStart(2, "0")}.${String(minute || 0).padStart(2, "0")}`
}

export function SessionFormDialog({
  open,
  onOpenChange,
  session,
  defaultDay = 1,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  session?: ClassSession | null
  defaultDay?: number
}) {
  const { addSession, updateSession, addCustomCourse, customCourses } = useApp()
  const toast = useToast()
  const isEdit = Boolean(session)

  const [course, setCourse] = useState("")
  const [day, setDay] = useState(1)
  const [start, setStart] = useState("08:00")
  const [end, setEnd] = useState("09:40")
  const [room, setRoom] = useState("")
  const [status, setStatus] = useState<ClassSession["status"]>("terjadwal")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    const startValue = session?.start ?? "08.00"
    setCourse(session?.course ?? "")
    setDay(session?.day ?? defaultDay)
    setStart(toTimeInput(startValue))
    setEnd(toTimeInput(session?.end ?? addHour(startValue)))
    setRoom(session?.room ?? "")
    setStatus(session?.status ?? "terjadwal")
    setError("")
  }, [open, session, defaultDay])

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (course.trim().length < 3) {
      setError("Mata kuliah wajib diisi, minimal 3 karakter.")
      return
    }
    if (!start || !end || end <= start) {
      setError("Waktu selesai harus setelah waktu mulai.")
      return
    }

    const payload = {
      course: course.trim(),
      day,
      start: start.replace(":", "."),
      end: end.replace(":", "."),
      room: room.trim(),
    }
    addCustomCourse(payload.course)

    if (session) {
      updateSession(session.id, { ...payload, status })
      toast.success("Jadwal kelas diperbarui", payload.course)
    } else {
      addSession({ ...payload, status })
      toast.success("Jadwal kelas ditambahkan", payload.course)
    }
    onOpenChange(false)
  }

  const courseOptions = Array.from(new Set<string>([...COURSES, ...customCourses, course]))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-2xl border border-zinc-200/70 p-0 sm:max-w-md">
        <form noValidate onSubmit={submit}>
          <DialogHeader className="px-5 pt-5">
            <DialogTitle>{isEdit ? "Ubah jadwal kelas" : "Tambah jadwal kelas"}</DialogTitle>
            <DialogDescription>
              Jadwal mingguan berlaku setiap pekan. Untuk satu tanggal saja, gunakan Kalender.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 px-5 py-4">
            <Field label="Mata kuliah" htmlFor="session-course">
              <Input
                id="session-course"
                list="session-course-options"
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                placeholder="Mis. Rekayasa Perangkat Lunak"
                className="h-9 rounded-lg border-zinc-200/80"
              />
              <datalist id="session-course-options">
                {courseOptions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </Field>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Hari" htmlFor="session-day">
                <NativeSelect
                  id="session-day"
                  value={String(day)}
                  onChange={(event) => setDay(Number(event.target.value))}
                >
                  {DAYS_FULL.map((label, index) => (
                    <option key={label} value={index}>
                      {label}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Status" htmlFor="session-status">
                <NativeSelect
                  id="session-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ClassSession["status"])}
                >
                  {STATUS_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {STATUS_LABELS[key]}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Jam mulai" htmlFor="session-start">
                <Input
                  id="session-start"
                  type="time"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  className="h-9 rounded-lg border-zinc-200/80"
                />
              </Field>
              <Field label="Jam selesai" htmlFor="session-end">
                <Input
                  id="session-end"
                  type="time"
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                  className="h-9 rounded-lg border-zinc-200/80"
                />
              </Field>
            </div>

            <Field label="Ruang" htmlFor="session-room">
              <Input
                id="session-room"
                value={room}
                onChange={(event) => setRoom(event.target.value)}
                placeholder="Mis. R. 301"
                className="h-9 rounded-lg border-zinc-200/80"
              />
            </Field>

            {error ? (
              <p role="alert" className="text-[11px] font-medium text-rose-500">
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter className="border-t border-zinc-100 px-5 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              Batal
            </Button>
            <Button type="submit" className="rounded-full bg-brand px-4 text-brand-foreground">
              {isEdit ? "Simpan perubahan" : "Tambah jadwal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
