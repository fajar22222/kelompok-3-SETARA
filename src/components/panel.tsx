import * as React from "react"

import { cn } from "@/lib/utils"

export function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200/70 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none",
        className,
      )}
      {...props}
    />
  )
}

export function PanelHeader({
  title,
  description,
  action,
  className,
  icon,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  icon?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 px-5 pt-5",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        {icon ? (
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-zinc-50 text-zinc-500 ring-1 ring-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="truncate font-heading text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  action,
  children,
  className,
  error,
}: {
  label: string
  htmlFor?: string
  hint?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  error?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
          {label}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-[11px] font-medium text-rose-500">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{hint}</p>
      ) : null}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-800/40",
        className,
      )}
    >
      {icon ? <span className="text-zinc-400 [&_svg]:size-5">{icon}</span> : null}
      <p className="font-heading text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</p>
      {description ? (
        <p className="max-w-xs text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>
      ) : null}
      {action}
    </div>
  )
}

export function MetaTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-800/60">
      <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-400">
        {icon}
        {label}
      </div>
      <p className="mt-1 truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
      {hint ? <p className="mt-0.5 truncate text-[10px] text-zinc-400 dark:text-zinc-500">{hint}</p> : null}
    </div>
  )
}
