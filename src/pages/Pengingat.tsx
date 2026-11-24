import { useMemo, useState } from "react"
import {
  Bell,
  BellRing,
  CalendarDays,
  ClipboardList,
  Clock,
  Plus,
  Trash2,
  User,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { ReminderFormDialog } from "@/components/reminder-form-dialog"
import { Panel } from "@/components/panel"
import { useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useApp } from "@/context/app-context"
import type { Reminder, ReminderKind } from "@/data/seed"
import { TODAY_ISO } from "@/data/seed"
import { diffDays, formatDayDate, relativeDay } from "@/lib/date"
import { cn } from "@/lib/utils"

const KIND_META: Record<
  ReminderKind,
  { label: string; chip: string; icon: typeof Bell }
> = {
  harian: { label: "Rutinitas", chip: "bg-zinc-100 text-zinc-600", icon: Clock },
  tugas: {
    label: "Deadline tugas",
    chip: "bg-rose-50 text-rose-600",
    icon: ClipboardList,
  },
  kelas: {
    label: "Jadwal kuliah",
    chip: "bg-indigo-50 text-indigo-600",
    icon: CalendarDays,
  },
  pribadi: { label: "Pribadi", chip: "bg-purple-50 text-purple-600", icon: User },
}

type Tab = "semua" | "aktif" | "nonaktif"

function groupTitle(date: string): string {
  const delta = diffDays(date, TODAY_ISO)
  if (delta === 0) return "Hari ini"
  if (delta === 1) return "Besok"
  if (delta === -1) return "Kemarin"
  if (delta > 1 && delta <= 7) return "Minggu ini"
  if (delta < -1 && delta >= -7) return "Minggu lalu"
  return delta > 0 ? "Mendatang" : "Sebelumnya"
}

export default function PengingatPage() {
  const { reminders, toggleReminder, deleteReminder, restoreReminder } = useApp()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>("semua")
  const [reminderOpen, setReminderOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null)

  const activeCount = reminders.filter((reminder) => reminder.enabled).length
  const todayCount = reminders.filter((reminder) => reminder.date === TODAY_ISO).length

  const filtered = useMemo(() => {
    const list = reminders.filter((reminder) => {
      if (tab === "aktif") return reminder.enabled
      if (tab === "nonaktif") return !reminder.enabled
      return true
    })
    return [...list].sort((a, b) =>
      `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
    )
  }, [reminders, tab])

  const groups = useMemo(() => {
    const map = new Map<string, Reminder[]>()
    for (const reminder of filtered) {
      const list = map.get(reminder.date) ?? []
      list.push(reminder)
      map.set(reminder.date, list)
    }
    return [...map.entries()]
  }, [filtered])

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: "semua", label: "Semua", count: reminders.length },
    { value: "aktif", label: "Aktif", count: activeCount },
    { value: "nonaktif", label: "Nonaktif", count: reminders.length - activeCount },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
            Notifikasi akademik
          </p>
          <h1 className="mt-1 font-heading text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
            Pengingat
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Atur kapan SETARA mengingatkanmu — tanpa perlu menahan semua hal di kepala.
          </p>
        </div>
        <Button
          onClick={() => setReminderOpen(true)}
          className="h-9 shrink-0 rounded-full bg-brand px-4 text-xs font-medium text-brand-foreground shadow-sm transition-all duration-200 hover:bg-brand/90"
        >
          <Plus className="size-4" />
          Tambah pengingat
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Panel className="flex items-center gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <BellRing className="size-5" />
          </span>
          <div>
            <p className="text-[11px] text-zinc-500">Pengingat aktif</p>
            <p className="text-lg leading-tight font-semibold text-zinc-900 tabular-nums">
              {activeCount}
            </p>
          </div>
        </Panel>
        <Panel className="flex items-center gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
          <span className="grid size-10 place-items-center rounded-xl bg-zinc-100 text-zinc-500">
            <Bell className="size-5" />
          </span>
          <div>
            <p className="text-[11px] text-zinc-500">Dinonaktifkan</p>
            <p className="text-lg leading-tight font-semibold text-zinc-900 tabular-nums">
              {reminders.length - activeCount}
            </p>
          </div>
        </Panel>
        <Panel className="col-span-2 flex items-center gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm sm:col-span-1">
          <span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
            <Clock className="size-5" />
          </span>
          <div>
            <p className="text-[11px] text-zinc-500">Untuk hari ini</p>
            <p className="text-lg leading-tight font-semibold text-zinc-900 tabular-nums">
              {todayCount}
            </p>
          </div>
        </Panel>
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
          <div className="inline-flex items-center gap-1 rounded-full bg-zinc-100/80 p-1">
            {tabs.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTab(item.value)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium transition-all duration-200",
                  tab === item.value
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] tabular-nums",
                    tab === item.value ? "bg-zinc-100 text-zinc-500" : "text-zinc-400",
                  )}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-zinc-400">
            Notifikasi aplikasi · zona waktu WIB
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <span className="mx-auto grid size-10 place-items-center rounded-full bg-zinc-50 text-zinc-400 ring-1 ring-zinc-200/60">
              <Bell className="size-4" />
            </span>
            <p className="mt-2 text-xs font-medium text-zinc-700">Tidak ada pengingat</p>
            <p className="mt-1 text-[11px] text-zinc-400">
              Ubah filter atau tambahkan pengingat baru.
            </p>
          </div>
        ) : (
          <div>
            {groups.map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-2 bg-zinc-50/50 px-4 py-2">
                  <span className="text-[10px] font-semibold tracking-wide text-zinc-500 uppercase">
                    {groupTitle(date)}
                  </span>
                  <span className="text-[10px] text-zinc-400">· {formatDayDate(date)}</span>
                  <span className="ml-auto rounded-full bg-white px-1.5 py-0.5 text-[9px] font-medium text-zinc-400 ring-1 ring-zinc-200/60">
                    {relativeDay(date, TODAY_ISO)}
                  </span>
                </div>
                <div className="divide-y divide-zinc-100">
                  {items.map((reminder) => {
                    const meta = KIND_META[reminder.kind]
                    const Icon = meta.icon
                    return (
                      <div
                        key={reminder.id}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3.5 transition-all duration-200 hover:bg-zinc-50/60",
                          !reminder.enabled && "opacity-60",
                        )}
                      >
                        <span className="grid h-10 w-12 shrink-0 place-items-center rounded-xl bg-zinc-50 ring-1 ring-zinc-200/60">
                          <span className="text-[10px] font-semibold text-zinc-700 tabular-nums">
                            {reminder.time}
                          </span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-medium text-zinc-900">{reminder.title}</p>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                                meta.chip,
                              )}
                            >
                              <Icon className="size-2.5" />
                              {meta.label}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                            {reminder.detail}
                          </p>
                        </div>
                        <Switch
                          checked={reminder.enabled}
                          onCheckedChange={() => toggleReminder(reminder.id)}
                          aria-label={`Aktifkan ${reminder.title}`}
                        />
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(reminder)}
                          aria-label={`Hapus pengingat ${reminder.title}`}
                          title="Hapus pengingat"
                          className="grid size-9 shrink-0 place-items-center rounded-lg text-zinc-300 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="flex items-start gap-2.5 rounded-2xl border border-zinc-200/70 bg-zinc-50/40 p-4 text-[11px] leading-relaxed text-zinc-500">
        <Bell className="mt-0.5 size-3.5 shrink-0 text-zinc-400" />
        <p>
          Pengingat disimpan di perangkat ini dan ditampilkan pada dashboard serta kalender.
          Kamu bisa mengaktifkan atau menghapusnya kapan saja. Versi demo belum mengirim
          notifikasi push atau email.
        </p>
      </div>

      <ReminderFormDialog open={reminderOpen} onOpenChange={setReminderOpen} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Hapus pengingat?"
        description={
          deleteTarget
            ? `“${deleteTarget.title}” akan dihapus dari daftar pengingat. Tindakan ini tidak dapat dibatalkan.`
            : ""
        }
        onConfirm={() => {
          if (deleteTarget) {
            deleteReminder(deleteTarget.id)
            toast.undo(
              "Pengingat dihapus",
              () => restoreReminder(deleteTarget),
              `“${deleteTarget.title}” dapat dikembalikan dalam 5 detik.`,
            )
          }
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
