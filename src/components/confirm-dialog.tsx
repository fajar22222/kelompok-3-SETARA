import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Hapus",
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-2xl border border-zinc-200/70 p-0 sm:max-w-sm">
        <DialogHeader className="gap-1 border-b border-zinc-100 p-5 pr-12">
          <DialogTitle className="flex items-center gap-2 font-heading text-base font-semibold">
            <span className="grid size-7 place-items-center rounded-lg bg-rose-50 text-rose-600">
              <Trash2 className="size-4" />
            </span>
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mx-0 mb-0 flex-row justify-end gap-2 rounded-b-2xl bg-zinc-50/60 p-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="rounded-full bg-rose-600 px-4 text-white transition-all duration-200 hover:bg-rose-700"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
