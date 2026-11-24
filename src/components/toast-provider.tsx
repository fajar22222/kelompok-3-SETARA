import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { CheckCircle2, Info, TriangleAlert, Undo2, X } from "lucide-react"

import { cn } from "@/lib/utils"

type ToastTone = "success" | "info" | "danger"

type ToastOptions = {
  title: string
  description?: string
  tone?: ToastTone
  duration?: number
  action?: { label: string; onClick: () => void }
}

type ToastItem = ToastOptions & { id: number }

type ToastContextValue = {
  show: (options: ToastOptions) => void
  success: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  undo: (title: string, onUndo: () => void, description?: string) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TONE_STYLE: Record<ToastTone, { bar: string; icon: string; Icon: typeof Info }> = {
  success: {
    bar: "bg-emerald-500",
    icon: "bg-emerald-50 text-emerald-600",
    Icon: CheckCircle2,
  },
  info: { bar: "bg-brand", icon: "bg-zinc-100 text-zinc-600", Icon: Info },
  danger: { bar: "bg-rose-500", icon: "bg-rose-50 text-rose-600", Icon: TriangleAlert },
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const { bar, icon, Icon } = TONE_STYLE[item.tone ?? "info"]

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), item.duration ?? 3500)
    return () => window.clearTimeout(timer)
  }, [item.id, item.duration, onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto relative flex w-[min(22rem,calc(100vw-2rem))] items-start gap-3 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-3.5 pr-9 shadow-[0_10px_40px_-12px_rgba(24,24,27,0.25)] transition-all duration-200"
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", bar)} />
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", icon)}>
        <Icon className="size-4" strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-zinc-900">{item.title}</p>
        {item.description ? (
          <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">{item.description}</p>
        ) : null}
        {item.action ? (
          <button
            type="button"
            onClick={() => {
              item.action?.onClick()
              onDismiss(item.id)
            }}
            className="mt-2 inline-flex h-7 items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 text-[11px] font-medium text-zinc-700 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50"
          >
            <Undo2 className="size-3" />
            {item.action.label}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Tutup notifikasi"
        className="absolute top-2.5 right-2.5 grid size-6 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const show = useCallback(
    (options: ToastOptions) => {
      const id = nextId.current++
      setItems((current) => [...current.slice(-3), { ...options, id }])
    },
    [nextId],
  )

  const success = useCallback(
    (title: string, description?: string) => show({ title, description, tone: "success" }),
    [show],
  )
  const info = useCallback(
    (title: string, description?: string) => show({ title, description, tone: "info" }),
    [show],
  )
  const error = useCallback(
    (title: string, description?: string) => show({ title, description, tone: "danger" }),
    [show],
  )
  const undo = useCallback(
    (title: string, onUndo: () => void, description?: string) =>
      show({
        title,
        description,
        tone: "danger",
        duration: 5000,
        action: { label: "Urungkan", onClick: onUndo },
      }),
    [show],
  )

  const value = useMemo(
    () => ({ show, success, info, error, undo, dismiss }),
    [show, success, info, error, undo, dismiss],
  )

  // Kegagalan penyimpanan dari context (mis. backend mati) tampil sebagai toast.
  useEffect(() => {
    const handleApiError = (event: Event) => {
      const detail = (
        event as CustomEvent<{ title?: string; description?: string }>
      ).detail
      error(
        detail?.title ?? "Gagal menyimpan perubahan",
        detail?.description ?? "Coba lagi beberapa saat lagi.",
      )
    }
    window.addEventListener("setara:api-error", handleApiError)
    return () => window.removeEventListener("setara:api-error", handleApiError)
  }, [error])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:items-end print:hidden">
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast harus dipakai di dalam ToastProvider")
  return context
}
