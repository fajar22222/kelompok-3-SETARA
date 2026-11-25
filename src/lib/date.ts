export const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

export const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
]

export const DAYS_SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
export const DAYS_FULL = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]

export function parseISO(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

export function toISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function addDaysISO(iso: string, amount: number): string {
  return toISO(addDays(parseISO(iso), amount))
}

/** Whole-day difference between an ISO date and a reference ISO date. */
export function diffDays(iso: string, fromISO: string): number {
  const target = parseISO(iso)
  const from = parseISO(fromISO)
  const utcTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate())
  const utcFrom = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  return Math.round((utcTarget - utcFrom) / 86_400_000)
}

export function formatShort(iso: string): string {
  const date = parseISO(iso)
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`
}

export function formatDayDate(iso: string): string {
  const date = parseISO(iso)
  return `${DAYS_FULL[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`
}

export function relativeDay(iso: string, todayISO: string): string {
  const delta = diffDays(iso, todayISO)
  if (delta === 0) return "Hari ini"
  if (delta === 1) return "Besok"
  if (delta === -1) return "Kemarin"
  if (delta > 1) return `${delta} hari lagi`
  return `${Math.abs(delta)} hari lalu`
}

export function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1)
}

/** 42 cells (6 weeks) starting on Monday. */
export function monthMatrix(year: number, month: number): Date[] {
  const first = startOfMonth(year, month)
  const offset = (first.getDay() + 6) % 7
  const start = addDays(first, -offset)
  return Array.from({ length: 42 }, (_, index) => addDays(start, index))
}

export function timeRange(start: string, end: string): string {
  return `${start}–${end}`
}
