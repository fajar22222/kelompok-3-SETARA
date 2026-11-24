const SESSION_KEY = "setara-auth"
const USERS_KEY = "setara-users"

export interface SessionUser {
  id?: string
  name: string
  email: string
}

interface StoredSession {
  isAuthenticated: boolean
  user: SessionUser
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
    // Mode privat: sesi tetap berjalan sampai halaman dimuat ulang.
  }
}

/** Nama tampilan dari input bebas, mis. "fajar@gmail.com" → "Fajar". */
export function deriveName(identifier: string): string {
  const base = identifier.includes("@") ? identifier.split("@")[0] : identifier
  const cleaned = base
    .replace(/[._-]+/g, " ")
    .replace(/\d+/g, " ")
    .trim()
  if (!cleaned) return "Mahasiswa"
  return cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function rememberedUsers(): SessionUser[] {
  const users = readJson<SessionUser[]>(USERS_KEY)
  return Array.isArray(users) ? users.filter((user) => user && user.email) : []
}

export function rememberedName(identifier: string): string {
  const needle = identifier.trim().toLowerCase()
  const match = rememberedUsers().find((user) => user.email.toLowerCase() === needle)
  return match?.name?.trim() || deriveName(identifier)
}

export function rememberUser(user: SessionUser) {
  const needle = user.email.trim().toLowerCase()
  if (!needle) return
  const next = rememberedUsers().filter(
    (item) => item.email.toLowerCase() !== needle,
  )
  next.push({
    id: user.id,
    name: user.name.trim() || deriveName(user.email),
    email: user.email.trim(),
  })
  writeJson(USERS_KEY, next.slice(-20))
}

export function saveLocalSession(user: SessionUser) {
  const session: StoredSession = {
    isAuthenticated: true,
    user: {
      id: user.id,
      name: user.name.trim() || deriveName(user.email),
      email: user.email.trim(),
    },
  }
  writeJson(SESSION_KEY, session)
  rememberUser(session.user)
}

export function readLocalSession(): StoredSession | null {
  return readJson<StoredSession>(SESSION_KEY)
}

export function clearLocalSession() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // abaikan
  }
}
