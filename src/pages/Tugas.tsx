import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Check, CircleDashed, Clock, Plus, Search } from "lucide-react"

import { FilterMenu } from "@/components/filter-menu"
import { EmptyState, Panel } from "@/components/panel"
import { StatusStrip } from "@/components/status-strip"
import { TaskDetail } from "@/components/task-detail"
import { TaskFormDialog } from "@/components/task-form-dialog"
import { TaskTable } from "@/components/task-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useApp } from "@/context/app-context"
import type { Task, TaskStatus, Priority } from "@/data/seed"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { RangeFilter, TaskFilters } from "@/lib/tasks"
import {
  defaultTaskFilters,
  filterTasks,
} from "@/lib/tasks"

const VALID_STATUS: TaskStatus[] = ["belum", "dikerjakan", "selesai", "review"]

export default function TugasPage() {
  const { tasks, stats, profile } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const paramKey = searchParams.toString()
  const isWide = useMediaQuery("(min-width: 1280px)")

  const [filters, setFilters] = useState<TaskFilters>(defaultTaskFilters)
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string>("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(paramKey)
    const status = params.get("status")
    const range = params.get("range")
    const priority = params.get("priority")
    const taskId = params.get("task")

    // URL adalah sumber kebenaran filter, jadi tautan biasa (/tugas)
    // mengembalikan daftar ke pengaturan bawaan.
    setFilters({
      status:
        status && VALID_STATUS.includes(status as TaskStatus)
          ? (status as TaskStatus)
          : "semua",
      range:
        range === "7hari" || range === "30hari" || range === "semester"
          ? (range as RangeFilter)
          : "semester",
      priority:
        priority === "Tinggi" || priority === "Sedang" || priority === "Rendah"
          ? (priority as Priority)
          : "semua",
    })
    setSelectedId(taskId ?? "")
  }, [paramKey])

  const filtered = useMemo(
    () => filterTasks(tasks, filters, query),
    [tasks, filters, query],
  )

  const selected = filtered.find((task) => task.id === selectedId) ?? filtered[0] ?? null

  /** Simpan filter di URL agar tidak hilang saat refresh atau tombol kembali. */
  const applyFilters = (next: TaskFilters) => {
    setFilters(next)
    const params = new URLSearchParams(paramKey)
    if (next.status === "semua") params.delete("status")
    else params.set("status", next.status)
    if (next.priority === "semua") params.delete("priority")
    else params.set("priority", next.priority)
    if (next.range === "semester") params.delete("range")
    else params.set("range", next.range)
    params.delete("task")
    setSearchParams(params, { replace: true })

    const first = filterTasks(tasks, next, query)[0]
    setSelectedId(first?.id ?? "")
  }

  const resetFilters = () => {
    setQuery("")
    applyFilters(defaultTaskFilters)
  }

  const applyStatus = (status: TaskStatus | "semua") => {
    applyFilters({ ...filters, status })
  }

  const handleSelect = (task: Task) => {
    setSelectedId(task.id)
    const params = new URLSearchParams(paramKey)
    params.set("task", task.id)
    setSearchParams(params, { replace: true })
    if (!isWide) setSheetOpen(true)
  }

  const hasFilter = query.trim().length > 0 || filters.status !== "semua" || filters.range !== "semester" || filters.priority !== "semua"

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
            {profile.semester} · {profile.prodi}
          </p>
          <h1 className="mt-1 font-heading text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
            Tugas saya
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Satu tempat untuk semua tugas, subtugas, catatan, dan tenggat kuliahmu.
          </p>
        </div>
        <Button
          onClick={() => setTaskOpen(true)}
          className="h-9 shrink-0 rounded-full bg-brand px-4 text-xs font-medium text-brand-foreground shadow-sm transition-all duration-200 hover:bg-brand/90"
        >
          <Plus className="size-4" />
          Tambah tugas
        </Button>
      </div>

      <StatusStrip
        items={[
          {
            key: "semua",
            value: `${stats.total}`,
            label: "Semua tugas",
            icon: CircleDashed,
            tone: "purple",
            active: filters.status === "semua",
            onClick: () => applyStatus("semua"),
          },
          {
            key: "belum",
            value: `${stats.belum}`,
            label: "Belum mulai",
            icon: Clock,
            tone: "orange",
            active: filters.status === "belum",
            onClick: () => applyStatus("belum"),
          },
          {
            key: "dikerjakan",
            value: `${stats.dikerjakan}`,
            label: "Dikerjakan",
            icon: Clock,
            tone: "amber",
            active: filters.status === "dikerjakan",
            onClick: () => applyStatus("dikerjakan"),
          },
          {
            key: "selesai",
            value: `${stats.selesai}`,
            label: "Selesai",
            icon: Check,
            tone: "emerald",
            active: filters.status === "selesai",
            onClick: () => applyStatus("selesai"),
          },
        ]}
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Panel className="min-w-0 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-zinc-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama tugas..."
                className="h-9 rounded-full border-zinc-200/80 bg-zinc-50/50 pl-9 text-xs"
              />
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="text-[11px] text-zinc-400 tabular-nums">
                {filtered.length} dari {stats.total} tugas
              </span>
              <FilterMenu filters={filters} onChange={applyFilters} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<Search className="size-4" />}
                title={
                  hasFilter
                    ? "Tidak ada tugas yang cocok dengan filter ini"
                    : "Belum ada tugas"
                }
                description={
                  hasFilter
                    ? "Coba kata kunci lain atau longgarkan filter agar tugasmu muncul kembali."
                    : "Tambahkan tugas pertama untuk mulai merencanakan semester ini."
                }
                action={
                  hasFilter ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetFilters}
                      className="mt-2 h-8 rounded-full text-[11px]"
                    >
                      Reset filter
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setTaskOpen(true)}
                      className="mt-2 h-8 rounded-full bg-brand px-3 text-[11px] text-brand-foreground"
                    >
                      <Plus className="size-3.5" />
                      Tambah tugas
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <TaskTable
              tasks={filtered}
              selectedId={selected?.id}
              onSelect={handleSelect}
              emptyLabel="Tidak ada tugas yang cocok. Coba ubah kata kunci atau filter."
              compact
            />
          )}
        </Panel>

        <Panel className="hidden min-w-0 flex-col overflow-hidden xl:flex">
          {selected ? (
            <TaskDetail key={selected.id} task={selected} className="min-h-0 flex-1" />
          ) : (
            <div className="p-4">
              <EmptyState
                title="Belum ada tugas dipilih"
                description="Pilih salah satu tugas di tabel untuk melihat catatan dan checklist."
                icon={<CircleDashed className="size-4" />}
              />
            </div>
          )}
        </Panel>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-md border-l border-zinc-200/70 bg-white p-0 sm:max-w-md"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Detail tugas</SheetTitle>
            <SheetDescription>Catatan, checklist, dan status tugas terpilih</SheetDescription>
          </SheetHeader>
          {selected ? (
            <TaskDetail
              key={selected.id}
              task={selected}
              className="h-full"
              onClose={() => setSheetOpen(false)}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      <TaskFormDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        defaultStatus={filters.status === "semua" ? "belum" : filters.status}
      />
    </div>
  )
}
