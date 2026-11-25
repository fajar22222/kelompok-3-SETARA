import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("SETARA error boundary:", error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="grid min-h-svh w-full place-items-center bg-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200/70 bg-white p-6 text-center shadow-xs">
          <span className="mx-auto grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="size-5" />
          </span>
          <h1 className="mt-3 font-heading text-base font-semibold text-zinc-900">
            Ada yang tidak berjalan
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
            Terjadi kesalahan saat menampilkan halaman ini. Muat ulang halaman untuk
            mencoba lagi. Data di perangkat ini tidak dihapus.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 h-9 w-full rounded-full bg-brand text-xs text-brand-foreground transition-all duration-200 hover:bg-brand/90"
          >
            <RotateCcw className="size-3.5" />
            Muat ulang
          </Button>
        </div>
      </div>
    )
  }
}
