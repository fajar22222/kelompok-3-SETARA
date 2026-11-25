import { useEffect, useState } from "react"
import { CalendarPlus, Pencil } from "lucide-react"

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
import type { AgendaItem, AgendaType, ClassSession, SessionOverride } from "@/data/seed"
import { TODAY_ISO } from "@/data/seed"

export type SessionEditContext = {
  session: ClassSession
  date: string
  override?: SessionOverride
}

function toTimeInput(value: string): string {
  return value.replace(".", ":")
}

function addHour(value: string): string {
  const [hour, minute] = value.replace(".", ":").split(":").map(Number)
  const nextHour = Math.min(23, (hour || 0) + 1)
  return `${String(nextHour).padStart(2, "0")}.${String(minute || 0).padStart(2, "0")}`
}

export function AgendaFormDialog({
  open,
  onOpenChange,
  defaultDate = TODAY_ISO,
  agenda,
  session,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: string
  agenda?: AgendaItem | null
  session?: SessionEditContext | null
  onCreated?: (date: string) => void
}) {
  const { addAgenda, updateAgenda, saveSessionOverride } = useApp()
  const toast = useToast()
  const isEdit = Boolean(agenda)
  const isSession = Boolean(session)
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(defaultDate)
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [type, setType] = useState<AgendaType>("lainnya")
  const [location, setLocation] = useState("")
  const [errors, setErrors] = useState<{ title?: string; date?: string; endTime?: string }>({})

  useEffect(() => {
    if (!open) return
    const override = session?.override
    const start = agenda?.time ?? override?.start ?? session?.session.start ?? "09.00"
    setTitle(agenda?.title ?? override?.title ?? session?.session.course ?? "")
    setDate(agenda?.date ?? session?.date ?? defaultDate)
    setStartTime(toTimeInput(start))
    setEndTime(
      toTimeInput(agenda?.endTime ?? override?.end ?? session?.session.end ?? addHour(start)),
    )
    setType(agenda?.type ?? override?.type ?? (session ? "kelas" : "lainnya"))
    setLocation(agenda?.location ?? override?.room ?? session?.session.room ?? "")
    setErrors({})
  }, [open, defaultDate, agenda, session])

  const validate = () => {
    const next: typeof errors = {}
    if (title.trim().length < 3) next.title = "Judul agenda wajib diisi, minimal 3 karakter."
    if (!date) next.date = "Tanggal agenda wajib diisi."
    if (startTime && endTime && endTime <= startTime) {
      next.endTime = "Waktu selesai harus setelah waktu mulai."
    }
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

            const start = startTime.replace(":", ".")
            const end = endTime.replace(":", ".")
            const cleanLocation = location.trim() || undefined

            if (agenda) {
              updateAgenda(agenda.id, {
                title: title.trim(),
                date,
                time: start,
                endTime: end,
                type,
                location: cleanLocation,
              })
              toast.success("Perubahan agenda disimpan", title.trim())
            } else if (session) {
              saveSessionOverride({
                sessionId: session.session.id,
                date: session.date,
                title: title.trim(),
                start,
                end,
                room: cleanLocation,
                type,
              })
              toast.success(
                "Jadwal kelas diperbarui",
                "Perubahan hanya berlaku untuk tanggal ini",
              )
            } else {
              addAgenda({
                title,
                date,
                time: start,
                endTime: end,
                type,
                location,
              })
              toast.success("Agenda berhasil disimpan", title.trim())
            }
            onCreated?.(session ? session.date : date)
            onOpenChange(false)
          }}
        >
          <DialogHeader className="gap-1 border-b border-zinc-100 p-5 pr-12">
            <DialogTitle className="flex items-center gap-2 font-heading text-base font-semibold">
              <span className="grid size-7 place-items-center rounded-lg bg-brand text-brand-foreground">
                {isEdit || isSession ? (
                  <Pencil className="size-4" />
                ) : (
                  <CalendarPlus className="size-4" />
                )}
              </span>
              {agenda ? "Edit agenda" : isSession ? "Edit jadwal kelas" : "Tambah agenda"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {agenda
                ? "Perbarui detail agenda. Perubahan tersimpan otomatis di perangkat ini."
                : isSession
                  ? "Ubah satu kemunculan kelas tanpa mengubah jadwal rutin mingguan."
                  : "Catat kelas tambahan, konsultasi, atau tenggat pribadi di kalender."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 p-5">
            <Field label="Judul agenda" htmlFor="agenda-title" error={errors.title}>
              <Input
                id="agenda-title"
                autoFocus
                required
                aria-invalid={Boolean(errors.title)}
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  if (errors.title) setErrors((current) => ({ ...current, title: undefined }))
                }}
                placeholder="Contoh: Konsultasi proposal proyek"
                className="h-9 rounded-lg border-zinc-200/80"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Kategori" htmlFor="agenda-type">
                <NativeSelect
                  id="agenda-type"
                  value={type}
                  onChange={(event) => setType(event.target.value as AgendaType)}
                >
                  <option value="lainnya">Agenda pribadi</option>
                  <option value="kelas">Jadwal kuliah</option>
                  <option value="deadline">Deadline tugas</option>
                </NativeSelect>
              </Field>
              <Field
                label="Tanggal"
                htmlFor="agenda-date"
                error={errors.date}
                hint={isSession ? "Berlaku khusus untuk tanggal ini." : undefined}
              >
                <Input
                  id="agenda-date"
                  type="date"
                  required
                  value={date}
                  disabled={isSession}
                  aria-invalid={Boolean(errors.date)}
                  onChange={(event) => {
                    setDate(event.target.value)
                    if (errors.date) setErrors((current) => ({ ...current, date: undefined }))
                  }}
                  className="h-9 rounded-lg border-zinc-200/80"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Waktu mulai" htmlFor="agenda-start">
                <Input
                  id="agenda-start"
                  type="time"
                  required
                  value={startTime}
                  onChange={(event) => {
                    setStartTime(event.target.value)
                    if (errors.endTime) setErrors((current) => ({ ...current, endTime: undefined }))
                  }}
                  className="h-9 rounded-lg border-zinc-200/80"
                />
              </Field>
              <Field label="Waktu selesai" htmlFor="agenda-end" error={errors.endTime}>
                <Input
                  id="agenda-end"
                  type="time"
                  required
                  value={endTime}
                  aria-invalid={Boolean(errors.endTime)}
                  onChange={(event) => {
                    setEndTime(event.target.value)
                    if (errors.endTime) setErrors((current) => ({ ...current, endTime: undefined }))
                  }}
                  className="h-9 rounded-lg border-zinc-200/80"
                />
              </Field>
            </div>

            <Field
              label="Ruangan / Keterangan"
              htmlFor="agenda-location"
              hint="Opsional — misalnya R. 301, Lab. 502, atau tautan daring."
            >
              <Input
                id="agenda-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="R. 301 / daring"
                className="h-9 rounded-lg border-zinc-200/80"
              />
            </Field>
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
              {isEdit || isSession ? "Simpan perubahan" : "Simpan agenda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
