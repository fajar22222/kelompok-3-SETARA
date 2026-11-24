import type { AppData, Profile } from "@/data/seed"
import {
  initialAgendas,
  initialCalendarReminders,
  initialPreferences,
  initialProfile,
  initialReminders,
  initialSessions,
  initialTasks,
} from "@/data/seed"

const DATA_PREFIX = "setara-data:"

function clone<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value)
  return JSON.parse(JSON.stringify(value)) as T
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Mode privat / kuota penuh: data tetap hidup selama sesi berjalan.
  }
}

function removeKey(key: string) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // abaikan
  }
}

export function accountDataKey(email: string): string {
  return `${DATA_PREFIX}${email.trim().toLowerCase()}`
}

/** Data contoh lengkap untuk akun baru, dengan identitas milik akun tersebut. */
export function createSeedData(profile: Profile): AppData {
  return {
    tasks: clone(initialTasks),
    sessions: clone(initialSessions),
    agendas: clone(initialAgendas),
    sessionOverrides: [],
    customCourses: [],
    reminders: clone(initialReminders),
    calendarReminders: clone(initialCalendarReminders),
    profile: { ...initialProfile, ...profile },
    preferences: { ...initialPreferences },
  }
}

/** Pastikan data dari localStorage masih punya bentuk yang dipakai UI. */
function normalizeAppData(raw: unknown): AppData | null {
  if (!raw || typeof raw !== "object") return null
  const value = raw as Partial<AppData>
  if (
    !Array.isArray(value.tasks) ||
    !Array.isArray(value.sessions) ||
    !Array.isArray(value.agendas) ||
    !Array.isArray(value.reminders) ||
    !Array.isArray(value.calendarReminders) ||
    !value.profile
  ) {
    return null
  }

  return {
    tasks: value.tasks,
    sessions: value.sessions,
    agendas: value.agendas,
    sessionOverrides: Array.isArray(value.sessionOverrides)
      ? value.sessionOverrides
      : [],
    customCourses: Array.isArray(value.customCourses) ? value.customCourses : [],
    reminders: value.reminders,
    calendarReminders: value.calendarReminders,
    profile: { ...initialProfile, ...value.profile },
    preferences: { ...initialPreferences, ...(value.preferences ?? {}) },
  }
}

export function loadAccountData(email: string): AppData | null {
  return normalizeAppData(readJson<unknown>(accountDataKey(email)))
}

export function saveAccountData(email: string, data: AppData) {
  writeJson(accountDataKey(email), data)
}

export function removeAccountData(email: string) {
  removeKey(accountDataKey(email))
}
