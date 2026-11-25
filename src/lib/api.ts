import type {
  AgendaItem,
  AppData,
  ClassSession,
  Preferences,
  Profile,
  Reminder,
  SessionOverride,
  Subtask,
  Task,
} from "@/data/seed"
import { ApiError } from "@/lib/errors"

/**
 * Lapisan API SETARA (PHP + MySQL).
 *
 * `VITE_API_BASE` boleh diisi, mis. `http://setara-api.test` saat memakai
 * Laragon tanpa proxy Vite. Bila kosong, request memakai path relatif `/api`
 * yang diteruskan proxy Vite ke backend (lihat vite.config.ts).
 */
const BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/+$/, "")
const TOKEN_KEY = "setara-token"

export interface RemoteUser {
  id: string
  name: string
  email: string
}

export interface RegisterPayload {
  user: RemoteUser
  profile: Profile
}

export interface AuthPayload {
  token: string
  user: RemoteUser
  profile: Profile
}

export function readRemoteToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function saveRemoteToken(token: string) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Mode privat: sesi server tetap berjalan untuk tab ini.
  }
}

export function clearRemoteToken() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    // abaikan
  }
}

export function hasRemoteSession(): boolean {
  return Boolean(readRemoteToken())
}

/** Server mati / proxy gagal / database belum siap → mode lokal. */
export function isServerUnavailable(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 0 || error.status >= 500)
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set("Accept", "application/json")

  const token = readRemoteToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, { ...init, headers })
  } catch {
    throw new ApiError("Tidak dapat terhubung ke server SETARA.", 0)
  }

  const raw = await response.text()
  let payload: unknown = null
  if (raw) {
    try {
      payload = JSON.parse(raw)
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const record =
      payload !== null && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : null
    const message =
      (typeof record?.error === "string" && record.error) ||
      (typeof record?.message === "string" && record.message) ||
      `Permintaan ke server gagal (${response.status}).`
    throw new ApiError(message, response.status)
  }

  return payload as T
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  body: JSON.stringify(body),
})

const enc = encodeURIComponent

export function apiLogin(email: string, password: string, name?: string) {
  return request<AuthPayload>("/api/auth/login", json({ email, password, name }))
}

export function apiRegister(name: string, email: string, password: string, prodi: string) {
  return request<RegisterPayload>("/api/auth/register", json({ name, email, password, prodi }))
}

export function apiLogout() {
  return request<{ ok: boolean }>("/api/auth/logout", { method: "POST" })
}

export function apiBootstrap() {
  return request<AppData>("/api/bootstrap")
}

export const remote = {
  createTask: (task: Task) => request<Task>("/api/tasks", json(task)),
  updateTask: (taskId: string, patch: Partial<Task>) =>
    request<Task>(`/api/tasks/${enc(taskId)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  upsertTask: (task: Task) =>
    request<Task>(`/api/tasks/${enc(task.id)}`, {
      method: "PUT",
      body: JSON.stringify(task),
    }),
  deleteTask: (taskId: string) =>
    request<{ ok: boolean }>(`/api/tasks/${enc(taskId)}`, { method: "DELETE" }),

  addSubtask: (taskId: string, subtask: Subtask) =>
    request<Task>(`/api/tasks/${enc(taskId)}/subtasks`, json(subtask)),
  updateSubtask: (taskId: string, subtaskId: string, patch: Partial<Subtask>) =>
    request<Task>(`/api/tasks/${enc(taskId)}/subtasks/${enc(subtaskId)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteSubtask: (taskId: string, subtaskId: string) =>
    request<Task>(`/api/tasks/${enc(taskId)}/subtasks/${enc(subtaskId)}`, {
      method: "DELETE",
    }),

  createAgenda: (agenda: AgendaItem) => request<AgendaItem>("/api/agendas", json(agenda)),
  updateAgenda: (agendaId: string, patch: Partial<AgendaItem>) =>
    request<AgendaItem>(`/api/agendas/${enc(agendaId)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  upsertAgenda: (agenda: AgendaItem) =>
    request<AgendaItem>(`/api/agendas/${enc(agenda.id)}`, {
      method: "PUT",
      body: JSON.stringify(agenda),
    }),
  deleteAgenda: (agendaId: string) =>
    request<{ ok: boolean }>(`/api/agendas/${enc(agendaId)}`, { method: "DELETE" }),

  createReminder: (reminder: Reminder) =>
    request<Reminder>("/api/reminders", json(reminder)),
  updateReminder: (reminderId: string, patch: Partial<Reminder>) =>
    request<Reminder>(`/api/reminders/${enc(reminderId)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  upsertReminder: (reminder: Reminder) =>
    request<Reminder>(`/api/reminders/${enc(reminder.id)}`, {
      method: "PUT",
      body: JSON.stringify(reminder),
    }),
  deleteReminder: (reminderId: string) =>
    request<{ ok: boolean }>(`/api/reminders/${enc(reminderId)}`, { method: "DELETE" }),

  updateCalendarReminder: (reminderId: string, patch: { enabled?: boolean }) =>
    request<{ enabled: boolean }>(`/api/calendar-reminders/${enc(reminderId)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  saveOverride: (override: SessionOverride) =>
    request<SessionOverride>(
      `/api/session-overrides/${enc(override.sessionId)}/${enc(override.date)}`,
      { method: "PUT", body: JSON.stringify(override) },
    ),
  deleteOverride: (sessionId: string, date: string) =>
    request<{ ok: boolean }>(
      `/api/session-overrides/${enc(sessionId)}/${enc(date)}`,
      { method: "DELETE" },
    ),

  addCourse: (name: string) =>
    request<{ name: string; created: boolean }>("/api/courses", json({ name })),

  createSession: (session: ClassSession) =>
    request<ClassSession>("/api/sessions", json(session)),
  updateSession: (sessionId: string, patch: Partial<ClassSession>) =>
    request<ClassSession>(`/api/sessions/${enc(sessionId)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteSession: (sessionId: string) =>
    request<{ ok: boolean }>(`/api/sessions/${enc(sessionId)}`, { method: "DELETE" }),
  restoreSession: (session: ClassSession) =>
    request<ClassSession>("/api/sessions", json(session)),

  updateProfile: (profile: Profile) =>
    request<{ profile: Profile; user: RemoteUser }>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(profile),
    }),
  updatePreferences: (patch: Partial<Preferences>) =>
    request<{ preferences: Preferences }>("/api/preferences", {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  reset: () => request<AppData>("/api/reset", { method: "POST" }),
}
