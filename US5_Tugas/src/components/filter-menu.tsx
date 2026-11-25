import { Filter } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Priority, TaskStatus } from "@/data/seed"
import type { RangeFilter, TaskFilters } from "@/lib/tasks"
import { countActiveFilters } from "@/lib/tasks"
import { cn } from "@/lib/utils"

const RANGE_OPTIONS: { value: RangeFilter; label: string }[] = [
  { value: "semester", label: "Semester ini" },
  { value: "7hari", label: "7 hari ke depan" },
  { value: "30hari", label: "30 hari ke depan" },
]

const PRIORITY_OPTIONS: (Priority | "semua")[] = ["semua", "Tinggi", "Sedang", "Rendah"]

const STATUS_OPTIONS: { value: TaskStatus | "semua"; label: string }[] = [
  { value: "semua", label: "Semua status" },
  { value: "belum", label: "Belum mulai" },
  { value: "dikerjakan", label: "Dikerjakan" },
  { value: "selesai", label: "Selesai" },
]

export function FilterMenu({
  filters,
  onChange,
  align = "end",
  className,
}: {
  filters: TaskFilters
  onChange: (next: TaskFilters) => void
  align?: "start" | "end"
  className?: string
}) {
  const count = countActiveFilters(filters)

  const update = (patch: Partial<TaskFilters>) => onChange({ ...filters, ...patch })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-8 items-center gap-2 rounded-full border border-zinc-200/80 bg-white px-3 text-xs font-medium text-zinc-600 shadow-xs transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900 data-popup-open:bg-zinc-50",
          className,
        )}
      >
        <Filter className="size-3.5" />
        Filter
        {count > 0 ? (
          <span className="grid size-4.5 min-w-4.5 place-items-center rounded-full bg-brand px-1 text-[10px] leading-none font-semibold text-brand-foreground tabular-nums">
            {count}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} sideOffset={6} className="w-60 p-1.5">
        <DropdownMenuLabel>Rentang waktu</DropdownMenuLabel>
        {RANGE_OPTIONS.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={filters.range === option.value}
            onCheckedChange={() => update({ range: option.value })}
            className="rounded-lg py-1.5"
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Prioritas</DropdownMenuLabel>
        {PRIORITY_OPTIONS.map((priority) => (
          <DropdownMenuCheckboxItem
            key={priority}
            checked={filters.priority === priority}
            onCheckedChange={() => update({ priority })}
            className="rounded-lg py-1.5"
          >
            {priority === "semua" ? "Semua prioritas" : priority}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        {STATUS_OPTIONS.map((status) => (
          <DropdownMenuCheckboxItem
            key={status.value}
            checked={filters.status === status.value}
            onCheckedChange={() => update({ status: status.value })}
            className="rounded-lg py-1.5"
          >
            {status.label}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <button
          type="button"
          onClick={() => onChange({ range: "semester", priority: "semua", status: "semua" })}
          className="w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
        >
          Atur ulang filter
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
