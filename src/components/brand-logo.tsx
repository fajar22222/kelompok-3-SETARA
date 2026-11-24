import { cn } from "@/lib/utils"

/**
 * Tanda merek SETARA.
 *
 * Logo asli berupa huruf S geometris hitam dengan latar transparan. Di mode
 * terang logo diletakkan pada keping putih berbingkai tipis; di mode gelap
 * keping berubah gelap dan logo dibalik menjadi putih agar tetap kontras.
 */
export function BrandLogo({
  className,
  imageClassName,
}: {
  className?: string
  imageClassName?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-xl border border-zinc-200/70 bg-white shadow-[0_1px_2px_rgba(24,24,27,0.06)] dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-none",
        className,
      )}
    >
      <img
        src="/setara-logo.png"
        alt=""
        draggable={false}
        className={cn("h-[68%] w-auto select-none dark:invert", imageClassName)}
      />
    </span>
  )
}
