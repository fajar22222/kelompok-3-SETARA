import { useEffect, useState } from "react"
import { BellPlus } from "lucide-react"

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
import type { ReminderKind } from "@/data/seed"
import { TODAY_ISO } from "@/data/seed"

export function ReminderFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addReminder } = useApp()
  const toast = useToast()
  const [title, setTitle] = useState("")
  const [detail, setDetail] = useState("")
  const [date, setDate] = useState(TODAY_ISO)
  const [time, setTime] = useState("08:00")
  const [kind, setKind] = useState<ReminderKind>("tugas")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setTitle("")
    setDetail("")
    setDate(TODAY_ISO)
    setTime("08:00")
    setKind("tugas")
    setError("")
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-2xl border border-zinc-200/70 p-0 sm:max-w-md">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            if (title.trim().length < 3) {
              setError("Judul pengingat wajib diisi, minimal 3 karakter.")
              return
            }
            addReminder({
              title,
              detail: detail || "Pengingat pribadi untuk agenda akademik.",
              date,
              time: time.replace(":", "."),
              kind,
            })
            toast.success("Pengingat berhasil ditambahkan", title.trim())
            onOpenChange(false)
          }}
        >
          <DialogHeader className="gap-1 border-b border-zinc-100 p-5 pr-12">
            <DialogTitle className="flex items-center gap-2 font-heading text-base font-semibold">
              <span className="grid size-7 place-items-center rounded-lg bg-brand text-brand-foreground">
                <BellPlus className="size-4" />
              </span>
              Tambah pengingat
            </DialogTitle>
            <DialogDescription className="text-xs">
              Atur pengingat agar tidak ada tenggat atau kelas yang terlewat.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 p-5">
            <Field label="Judul pengingat" htmlFor="reminder-title" error={error}>
              <Input
                id="reminder-title"
                autoFocus
                required
                aria-invalid={Boolean(error)}
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  if (error) setError("")
                }}
                placeholder="Contoh: Cek progres laporan RPL"
                className="h-9 rounded-lg border-zinc-200/80"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Tanggal" htmlFor="reminder-date">
                <Input
                  id="reminder-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="h-9 rounded-lg border-zinc-200/80"
                />
              </Field>
              <Field label="Waktu" htmlFor="reminder-time">
                <Input
                  id="reminder-time"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="h-9 rounded-lg border-zinc-200/80"
                />
              </Field>
            </div>

            <Field label="Kategori" htmlFor="reminder-kind">
              <NativeSelect
                id="reminder-kind"
                value={kind}
                onChange={(event) => setKind(event.target.value as ReminderKind)}
              >
                <option value="tugas">Deadline tugas</option>
                <option value="kelas">Jadwal kuliah</option>
                <option value="harian">Rutinitas harian</option>
                <option value="pribadi">Agenda pribadi</option>
              </NativeSelect>
            </Field>

            <Field label="Keterangan" htmlFor="reminder-detail" hint="Opsional">
              <Textarea
                id="reminder-detail"
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                placeholder="Detail singkat yang muncul di notifikasi"
                className="min-h-16 resize-none rounded-lg border-zinc-200/80"
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
              Simpan pengingat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
