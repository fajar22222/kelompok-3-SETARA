import type { AgendaItem, ClassSession, Task } from "@/data/seed"
import { TODAY_ISO } from "@/data/seed"
import { addDaysISO, parseISO, toISO } from "@/lib/date"

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n")
}

function formatStamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
}

function dateTime(iso: string, time: string): string {
  const [hour, minute] = time.replace(".", ":").split(":").map(Number)
  return `${iso.replace(/-/g, "")}T${pad(hour ?? 23)}${pad(minute ?? 59)}00`
}

function endDateTime(iso: string, time: string, minutes = 60): string {
  const [hour, minute] = time.replace(".", ":").split(":").map(Number)
  const end = parseISO(iso)
  end.setHours(hour ?? 23, (minute ?? 59) + minutes, 0, 0)
  return `${toISO(end).replace(/-/g, "")}T${pad(end.getHours())}${pad(end.getMinutes())}00`
}

function fold(line: string): string {
  if (line.length <= 74) return line
  const parts: string[] = []
  let rest = line
  while (rest.length > 74) {
    parts.push(rest.slice(0, 74))
    rest = ` ${rest.slice(74)}`
  }
  parts.push(rest)
  return parts.join("\r\n")
}

function eventBlock({
  uid,
  summary,
  location,
  description,
  start,
  end,
}: {
  uid: string
  summary: string
  location?: string
  description?: string
  start: string
  end: string
}): string[] {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatStamp()}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeText(summary)}`,
  ]
  if (location) lines.push(`LOCATION:${escapeText(location)}`)
  if (description) lines.push(`DESCRIPTION:${escapeText(description)}`)
  lines.push("END:VEVENT")
  return lines
}

export function buildScheduleIcs({
  tasks,
  sessions,
  agendas,
  weeks = 8,
}: {
  tasks: Task[]
  sessions: ClassSession[]
  agendas: AgendaItem[]
  weeks?: number
}): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SETARA//Jadwal Akademik//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:SETARA — Jadwal Akademik",
  ]

  const today = parseISO(TODAY_ISO)
  const todayDay = today.getDay()

  for (let week = 0; week < weeks; week += 1) {
    for (const session of sessions) {
      const offset = ((session.day - todayDay + 7) % 7) + week * 7
      const date = addDaysISO(TODAY_ISO, offset)
      lines.push(
        ...eventBlock({
          uid: `${session.id}-${date}@setara.app`,
          summary: `${session.course} (Kuliah)`,
          location: session.room,
          description: `Jadwal kuliah SETARA · ${session.start}–${session.end}`,
          start: dateTime(date, session.start),
          end: dateTime(date, session.end),
        }),
      )
    }
  }

  for (const task of tasks) {
    lines.push(
      ...eventBlock({
        uid: `${task.id}@setara.app`,
        summary: `Tugas: ${task.title}`,
        description: `${task.course} · Status: ${task.status} · Prioritas: ${task.priority}`,
        start: dateTime(task.deadline, task.time),
        end: endDateTime(task.deadline, task.time),
      }),
    )
  }

  for (const agenda of agendas) {
    lines.push(
      ...eventBlock({
        uid: `${agenda.id}@setara.app`,
        summary: agenda.title,
        location: agenda.location,
        description: `Agenda ${agenda.type} SETARA`,
        start: dateTime(agenda.date, agenda.time),
        end: endDateTime(agenda.date, agenda.time),
      }),
    )
  }

  lines.push("END:VCALENDAR")
  return `${lines.map(fold).join("\r\n")}\r\n`
}

export function downloadIcs(content: string, filename = "setara-jadwal.ics") {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
