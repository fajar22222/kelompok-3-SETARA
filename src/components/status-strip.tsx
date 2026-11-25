import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export type StripTone = "purple" | "orange" | "amber" | "emerald"

const CARD =
  "border-zinc-200/80 bg-white hover:border-brand/50! hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand/60!"

const ICON = "bg-brand-soft text-brand ring-brand-border"

const TONES: Record<
  StripTone,
  { card: string; icon: string; value: string; arrow: string }
> = {
  purple: { card: CARD, icon: ICON, value: "text-zinc-900 dark:text-zinc-100", arrow: "text-zinc-300 group-hover:text-brand dark:text-zinc-600" },
  orange: { card: CARD, icon: ICON, value: "text-zinc-900 dark:text-zinc-100", arrow: "text-zinc-300 group-hover:text-brand dark:text-zinc-600" },
  amber: { card: CARD, icon: ICON, value: "text-zinc-900 dark:text-zinc-100", arrow: "text-zinc-300 group-hover:text-brand dark:text-zinc-600" },
  emerald: { card: CARD, icon: ICON, value: "text-zinc-900 dark:text-zinc-100", arrow: "text-zinc-300 group-hover:text-brand dark:text-zinc-600" },
}

export interface StripItem {
  key: string
  value: string
  label: string
  icon: LucideIcon
  tone: StripTone
  onClick?: () => void
  active?: boolean
}

export function StatusStrip({
  items,
  className,
}: {
  items: StripItem[]
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}>
      {items.map((item) => {
        const Icon = item.icon
        const tone = TONES[item.tone]

        return (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            className={cn(
              "group relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-200",
              tone.card,
              item.onClick && "cursor-pointer hover:-translate-y-0.5 hover:shadow-sm",
              item.active && "ring-2 ring-zinc-900/10",
            )}
          >
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset",
                tone.icon,
              )}
            >
              <Icon className="size-4" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[10px] font-medium tracking-wide text-zinc-500 uppercase">
                {item.label}
              </span>
              <span
                className={cn(
                  "mt-1 block font-heading text-xl font-semibold tracking-tight tabular-nums",
                  tone.value,
                )}
              >
                {item.value}
              </span>
            </span>
            {item.onClick ? (
              <ChevronRight
                className={cn(
                  "size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5",
                  tone.arrow,
                )}
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
