import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { ReactNode } from "react"

import type {
  AgendaItem,
  AppData,
  ClassSession,
  Preferences,
  Priority,
  Profile,
  Reminder,
  ReminderKind,
  SessionOverride,
  Task,
  TaskStatus,
} from "@/data/seed"
import {
  COURSES,
  initialProfile,
} from "@/data/seed"
import { ApiError } from "@/lib/errors"
import {
  type AuthPayload,
  apiBootstrap,
  apiLogin,
  apiLogout,
  apiRegister,
  clearRemoteToken,
  hasRemoteSession,
  isServerUnavailable,
  remote,
  saveRemoteToken,
} from "@/lib/api"
import {
  clearLocalSession,
  readLocalSession,
  rememberedName,
  rememberedUsers,
  saveLocalSession,
} from "@/lib/session"
import {
  createSeedData,
  loadAccountData,
  removeAccountData,
  saveAccountData,
} from "@/lib/storage"
import type { TaskStats } from "@/lib/tasks"
import { computeStats, taskProgress } from "@/lib/tasks"

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Kirim perubahan ke server tanpa memblokir UI. localStorage tetap menjadi
 * cadangan sehingga aplikasi tetap berjalan saat server mati.
 */
function pushRemote(run: () => Promise<unknown>) {
  if (!hasRemoteSession()) return
  void run().catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      clearRemoteToken()
    }
  })
}

const initialState: AppData = createSeedData(initialProfile)

export type AuthStatus = "loading" | "guest" | "ready" | "error"

export interface NewTaskInput {
  title: string
  course: string
  deadline: string
  time?: string
  priority: Priority
  status: TaskStatus
  notes?: string
}

export interface NewAgendaInput {
  title: string
  date: string
  time: string
  endTime?: string
  type: AgendaItem["type"]
  location?: string
}

export interface NewSessionInput {
  course: string
  day: number
  start: string
  end: string
  room: string
  status?: ClassSession["status"]
}

export interface NewReminderInput {
  title: string
  detail: string
  date: string
  time: string
  kind: ReminderKind
}

interface AppContextValue extends AppData {
  stats: TaskStats
  authStatus: AuthStatus
  authError: string | null
  isAuthenticated: boolean
  signIn: (email: string, password: string, name?: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => void
  refreshSession: () => void
  updateTask: (taskId: string, patch: Partial<Task>) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  markTaskDone: (taskId: string) => void
  addTask: (input: NewTaskInput) => void
  deleteTask: (taskId: string) => void
  restoreTask: (task: Task) => void
  addCustomCourse: (name: string) => string
  addSubtask: (taskId: string, title: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
  addAgenda: (input: NewAgendaInput) => void
  updateAgenda: (agendaId: string, patch: Partial<AgendaItem>) => void
  deleteAgenda: (agendaId: string) => void
  restoreAgenda: (agenda: AgendaItem) => void
  saveSessionOverride: (override: SessionOverride) => void
  clearSessionOverride: (sessionId: string, date: string) => void
  addSession: (input: NewSessionInput) => void
  updateSession: (sessionId: string, patch: Partial<ClassSession>) => void
  deleteSession: (sessionId: string) => void
  restoreSession: (session: ClassSession) => void
  addReminder: (input: NewReminderInput) => void
  deleteReminder: (reminderId: string) => void
  restoreReminder: (reminder: Reminder) => void
  toggleReminder: (reminderId: string) => void
  toggleCalendarReminder: (reminderId: string) => void
  updateProfile: (profile: Profile) => void
  updatePreferences: (patch: Partial<Preferences>) => void
  resetData: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

function localUserId(email: string): string {
  const match = rememberedUsers().find(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  )
  return match?.id || uid("user")
}

function profileFor(email: string, name: string, stored?: Profile): Profile {
  const isDemo = email.toLowerCase() === initialProfile.email.toLowerCase()
  return {
    ...initialProfile,
    ...stored,
    name: stored?.name?.trim() || name,
    email,
    nim: stored?.nim ?? (isDemo ? initialProfile.nim : ""),
  }
}

/** Baca sesi + data akun dari localStorage saat aplikasi pertama dimuat. */
function readBootstrap(): { status: AuthStatus; data: AppData } {
  if (typeof window === "undefined") {
    return { status: "guest", data: initialState }
  }

  const session = readLocalSession()
  if (!session?.isAuthenticated || !session.user?.email) {
    return { status: "guest", data: initialState }
  }

  const email = session.user.email.trim().toLowerCase()
  const stored = loadAccountData(email)
  if (stored) {
    return {
      status: "ready",
      data: { ...stored, profile: { ...stored.profile, email } },
    }
  }

  const data = createSeedData(
    profileFor(email, session.user.name?.trim() || initialProfile.name),
  )
  saveAccountData(email, data)
  return { status: "ready", data }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [bootstrap] = useState(readBootstrap)
  const [data, setData] = useState<AppData>(bootstrap.data)
  const [authStatus, setAuthStatus] = useState<AuthStatus>(bootstrap.status)
  const [authError, setAuthError] = useState<string | null>(null)

  const dataRef = useRef(data)
  const skipServerRefresh = useRef(false)
  const taskSyncTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  useEffect(() => {
    dataRef.current = data
  }, [data])

  /** Setiap perubahan data langsung disimpan ke localStorage akun aktif. */
  useEffect(() => {
    if (authStatus !== "ready") return
    const session = readLocalSession()
    if (!session?.isAuthenticated || !session.user?.email) return
    saveAccountData(session.user.email, data)
  }, [data, authStatus])

  /**
   * Ambil data terbaru dari MySQL setelah login. Bila server tidak menjawab,
   * data lokal tetap dipakai sehingga aplikasi tidak pernah blank.
   */
  const adoptRemoteSession = useCallback(async (auth: AuthPayload) => {
    saveRemoteToken(auth.token)

    let serverData: AppData
    try {
      serverData = await apiBootstrap()
    } catch {
      serverData = createSeedData(auth.profile)
    }

    const email = (serverData.profile.email || auth.user.email).trim().toLowerCase()
    const next: AppData = {
      ...serverData,
      profile: { ...serverData.profile, email },
    }

    saveAccountData(email, next)
    saveLocalSession({ id: auth.user.id, name: auth.user.name, email })
    skipServerRefresh.current = true
    setData(next)
    setAuthStatus("ready")
    setAuthError(null)
  }, [])

  /** Saat halaman dibuka ulang, sinkronkan salinan lokal dengan server. */
  useEffect(() => {
    if (authStatus !== "ready" || !hasRemoteSession()) return

    if (skipServerRefresh.current) {
      skipServerRefresh.current = false
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const serverData = await apiBootstrap()
        if (cancelled) return

        const email = serverData.profile.email.trim().toLowerCase()
        if (!email) return

        const next: AppData = {
          ...serverData,
          profile: { ...serverData.profile, email },
        }
        const session = readLocalSession()
        if (session?.isAuthenticated) {
          saveLocalSession({ ...session.user, name: serverData.profile.name, email })
        }
        saveAccountData(email, next)
        setData(next)
      } catch (caught) {
        if (caught instanceof ApiError && caught.status === 401) {
          clearRemoteToken()
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [authStatus])

  /**
   * Login lokal: semua email/NIM + kata sandi yang tidak kosong diterima.
   * Akun baru otomatis mendapat data contoh, tanpa request jaringan.
   */
  const signIn = useCallback(
    async (email: string, password: string, name?: string) => {
      const identifier = email.trim().toLowerCase()
      if (!identifier) throw new ApiError("Email atau NIM wajib diisi.")
      if (!password) throw new ApiError("Kata sandi wajib diisi.")

      // Utamakan MySQL; bila server tidak tersedia, lanjut ke mode lokal.
      try {
        const auth = await apiLogin(identifier, password, name)
        await adoptRemoteSession(auth)
        return
      } catch (caught) {
        if (!isServerUnavailable(caught)) throw caught
      }

      const stored = loadAccountData(identifier)
      const displayName = name?.trim() || rememberedName(identifier)
      const profile = profileFor(identifier, displayName, stored?.profile)
      const next = stored ? { ...stored, profile } : createSeedData(profile)

      saveAccountData(identifier, next)
      saveLocalSession({
        id: localUserId(identifier),
        name: profile.name,
        email: identifier,
      })
      setData(next)
      setAuthStatus("ready")
      setAuthError(null)
    },
    [adoptRemoteSession],
  )

  /**
   * Daftar akun lokal. Bila email sudah punya data, data tersebut dipertahankan
   * dan nama profil diperbarui, lalu pengguna langsung masuk.
   */
  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const displayName = name.trim()
      const identifier = email.trim().toLowerCase()
      if (!displayName) throw new ApiError("Nama lengkap wajib diisi.")
      if (!identifier) throw new ApiError("Email atau NIM wajib diisi.")
      if (!password) throw new ApiError("Kata sandi wajib diisi.")

      try {
        const auth = await apiRegister(displayName, identifier, password)
        await adoptRemoteSession(auth)
        return
      } catch (caught) {
        if (!isServerUnavailable(caught)) throw caught
      }

      const stored = loadAccountData(identifier)
      const profile: Profile = stored
        ? { ...stored.profile, name: displayName, email: identifier }
        : profileFor(identifier, displayName)
      const next = stored ? { ...stored, profile } : createSeedData(profile)

      saveAccountData(identifier, next)
      saveLocalSession({
        id: localUserId(identifier),
        name: displayName,
        email: identifier,
      })
      setData(next)
      setAuthStatus("ready")
      setAuthError(null)
    },
    [adoptRemoteSession],
  )

  const signOut = useCallback(() => {
    void apiLogout().catch(() => undefined)
    clearRemoteToken()
    clearLocalSession()
    setData(initialState)
    setAuthStatus("guest")
    setAuthError(null)
  }, [])

  const refreshSession = useCallback(() => {
    const session = readLocalSession()
    if (!session?.isAuthenticated || !session.user?.email) {
      setData(initialState)
      setAuthStatus("guest")
      setAuthError(null)
      return
    }

    const email = session.user.email.trim().toLowerCase()
    const stored = loadAccountData(email)
    if (stored) {
      setData({ ...stored, profile: { ...stored.profile, email } })
    } else {
      const data = createSeedData(
        profileFor(email, session.user.name?.trim() || initialProfile.name),
      )
      saveAccountData(email, data)
      setData(data)
    }
    setAuthStatus("ready")
    setAuthError(null)
  }, [])

  const updateTask = useCallback((taskId: string, patch: Partial<Task>) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, ...patch } : task,
      ),
    }))

    if (!hasRemoteSession()) return

    // Catatan diketik karakter demi karakter: kumpulkan dulu agar tidak
    // mengirim ratusan PATCH dan agar urutan penulisan tetap benar.
    const timers = taskSyncTimers.current
    const pending = timers.get(taskId)
    if (pending) {
      clearTimeout(pending)
      timers.delete(taskId)
    }

    const notesOnly = Object.keys(patch).length === 1 && "notes" in patch
    if (notesOnly) {
      timers.set(
        taskId,
        setTimeout(() => {
          timers.delete(taskId)
          const latest = dataRef.current.tasks.find((task) => task.id === taskId)
          if (latest) pushRemote(() => remote.updateTask(taskId, latest))
        }, 400),
      )
      return
    }

    pushRemote(() => remote.updateTask(taskId, patch))
  }, [])

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    const task = dataRef.current.tasks.find((item) => item.id === taskId)
    if (!task) return

    const subtasks = task.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask,
    )
    const doneCount = subtasks.filter((subtask) => subtask.done).length
    const allDone = subtasks.length > 0 && doneCount === subtasks.length
    let status: TaskStatus = task.status

    if (allDone) status = "selesai"
    else if (doneCount > 0) status = "dikerjakan"
    else if (task.status === "selesai" || task.status === "dikerjakan") status = "belum"

    setData((current) => ({
      ...current,
      tasks: current.tasks.map((item) =>
        item.id === taskId ? { ...item, subtasks, status } : item,
      ),
    }))

    const target = subtasks.find((subtask) => subtask.id === subtaskId)
    if (target) {
      pushRemote(() => remote.updateSubtask(taskId, subtaskId, { done: target.done }))
    }
  }, [])

  const markTaskDone = useCallback((taskId: string) => {
    const task = dataRef.current.tasks.find((item) => item.id === taskId)
    if (!task) return

    const next =
      task.status === "selesai"
        ? {
            status: "belum" as TaskStatus,
            subtasks: task.subtasks.map((subtask) => ({ ...subtask, done: false })),
          }
        : {
            status: "selesai" as TaskStatus,
            subtasks: task.subtasks.map((subtask) => ({ ...subtask, done: true })),
          }

    setData((current) => ({
      ...current,
      tasks: current.tasks.map((item) =>
        item.id === taskId ? { ...item, ...next } : item,
      ),
    }))
    pushRemote(() => remote.updateTask(taskId, next))
  }, [])

  const addTask = useCallback((input: NewTaskInput) => {
    const done = input.status === "selesai"
    const task: Task = {
      id: uid("task"),
      title: input.title.trim(),
      course: input.course,
      deadline: input.deadline,
      time: input.time ?? "23.59",
      priority: input.priority,
      status: input.status,
      notes: input.notes?.trim() ?? "",
      reminder: "H-1 · 08.00",
      subtasks: [
        { id: uid("sub"), title: "Kumpulkan referensi", done },
        { id: uid("sub"), title: "Susun draf pengerjaan", done },
        { id: uid("sub"), title: "Review & unggah", done },
      ],
    }
    setData((current) => ({ ...current, tasks: [task, ...current.tasks] }))
    pushRemote(() => remote.createTask(task))
  }, [])

  const deleteTask = useCallback((taskId: string) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== taskId),
    }))
    pushRemote(() => remote.deleteTask(taskId))
  }, [])

  const restoreTask = useCallback((task: Task) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.some((item) => item.id === task.id)
        ? current.tasks
        : [task, ...current.tasks],
    }))
    pushRemote(() => remote.upsertTask(task))
  }, [])

  const addCustomCourse = useCallback((name: string): string => {
    const clean = name.trim().replace(/\s+/g, " ")
    if (!clean) return ""
    const lower = clean.toLowerCase()
    const builtin = COURSES.find((course) => course.toLowerCase() === lower)
    if (builtin) return builtin
    const existing = dataRef.current.customCourses.find(
      (course) => course.toLowerCase() === lower,
    )
    if (existing) return existing

    setData((current) => {
      if (current.customCourses.some((course) => course.toLowerCase() === lower)) {
        return current
      }
      return { ...current, customCourses: [...current.customCourses, clean] }
    })
    pushRemote(() => remote.addCourse(clean))
    return clean
  }, [])

  const addSubtask = useCallback((taskId: string, title: string) => {
    const clean = title.trim()
    if (!clean) return
    const subtask = { id: uid("sub"), title: clean, done: false }
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, subtasks: [...task.subtasks, subtask] } : task,
      ),
    }))
    pushRemote(() => remote.addSubtask(taskId, subtask))
  }, [])

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? { ...task, subtasks: task.subtasks.filter((item) => item.id !== subtaskId) }
          : task,
      ),
    }))
    pushRemote(() => remote.deleteSubtask(taskId, subtaskId))
  }, [])

  const addAgenda = useCallback((input: NewAgendaInput) => {
    const agenda: AgendaItem = {
      id: uid("agenda"),
      title: input.title.trim(),
      date: input.date,
      time: input.time,
      endTime: input.endTime,
      type: input.type,
      location: input.location?.trim() || undefined,
    }
    setData((current) => ({ ...current, agendas: [...current.agendas, agenda] }))
    pushRemote(() => remote.createAgenda(agenda))
  }, [])

  const updateAgenda = useCallback((agendaId: string, patch: Partial<AgendaItem>) => {
    setData((current) => ({
      ...current,
      agendas: current.agendas.map((agenda) =>
        agenda.id === agendaId ? { ...agenda, ...patch } : agenda,
      ),
    }))
    pushRemote(() => remote.updateAgenda(agendaId, patch))
  }, [])

  const deleteAgenda = useCallback((agendaId: string) => {
    setData((current) => ({
      ...current,
      agendas: current.agendas.filter((agenda) => agenda.id !== agendaId),
    }))
    pushRemote(() => remote.deleteAgenda(agendaId))
  }, [])

  const restoreAgenda = useCallback((agenda: AgendaItem) => {
    setData((current) => ({
      ...current,
      agendas: current.agendas.some((item) => item.id === agenda.id)
        ? current.agendas
        : [...current.agendas, agenda],
    }))
    pushRemote(() => remote.upsertAgenda(agenda))
  }, [])

  const saveSessionOverride = useCallback((override: SessionOverride) => {
    setData((current) => {
      const exists = current.sessionOverrides.some(
        (item) => item.sessionId === override.sessionId && item.date === override.date,
      )
      return {
        ...current,
        sessionOverrides: exists
          ? current.sessionOverrides.map((item) =>
              item.sessionId === override.sessionId && item.date === override.date
                ? { ...item, ...override }
                : item,
            )
          : [...current.sessionOverrides, override],
      }
    })
    pushRemote(() => remote.saveOverride(override))
  }, [])

  const clearSessionOverride = useCallback((sessionId: string, date: string) => {
    setData((current) => ({
      ...current,
      sessionOverrides: current.sessionOverrides.filter(
        (item) => !(item.sessionId === sessionId && item.date === date),
      ),
    }))
    pushRemote(() => remote.deleteOverride(sessionId, date))
  }, [])

  const addSession = useCallback((input: NewSessionInput) => {
    const session: ClassSession = {
      id: uid("ses"),
      course: input.course,
      day: input.day,
      start: input.start,
      end: input.end,
      room: input.room.trim(),
      status: input.status ?? "terjadwal",
    }
    setData((current) => ({
      ...current,
      sessions: [...current.sessions, session].sort(
        (a, b) => a.day - b.day || a.start.localeCompare(b.start),
      ),
    }))
    pushRemote(() => remote.createSession(session))
  }, [])

  const updateSession = useCallback((sessionId: string, patch: Partial<ClassSession>) => {
    setData((current) => ({
      ...current,
      sessions: current.sessions
        .map((session) => (session.id === sessionId ? { ...session, ...patch } : session))
        .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start)),
    }))
    pushRemote(() => remote.updateSession(sessionId, patch))
  }, [])

  const deleteSession = useCallback((sessionId: string) => {
    setData((current) => ({
      ...current,
      sessions: current.sessions.filter((session) => session.id !== sessionId),
      sessionOverrides: current.sessionOverrides.filter(
        (item) => item.sessionId !== sessionId,
      ),
    }))
    pushRemote(() => remote.deleteSession(sessionId))
  }, [])

  const restoreSession = useCallback((session: ClassSession) => {
    setData((current) => ({
      ...current,
      sessions: current.sessions.some((item) => item.id === session.id)
        ? current.sessions
        : [...current.sessions, session].sort(
            (a, b) => a.day - b.day || a.start.localeCompare(b.start),
          ),
    }))
    pushRemote(() => remote.restoreSession(session))
  }, [])

  const addReminder = useCallback((input: NewReminderInput) => {
    const reminder: Reminder = {
      id: uid("rem"),
      title: input.title.trim(),
      detail: input.detail.trim(),
      date: input.date,
      time: input.time,
      enabled: true,
      kind: input.kind,
    }
    setData((current) => ({ ...current, reminders: [...current.reminders, reminder] }))
    pushRemote(() => remote.createReminder(reminder))
  }, [])

  const deleteReminder = useCallback((reminderId: string) => {
    setData((current) => ({
      ...current,
      reminders: current.reminders.filter((reminder) => reminder.id !== reminderId),
    }))
    pushRemote(() => remote.deleteReminder(reminderId))
  }, [])

  const restoreReminder = useCallback((reminder: Reminder) => {
    setData((current) => ({
      ...current,
      reminders: current.reminders.some((item) => item.id === reminder.id)
        ? current.reminders
        : [...current.reminders, reminder],
    }))
    pushRemote(() => remote.upsertReminder(reminder))
  }, [])

  const toggleReminder = useCallback((reminderId: string) => {
    const target = dataRef.current.reminders.find((item) => item.id === reminderId)
    setData((current) => ({
      ...current,
      reminders: current.reminders.map((item) =>
        item.id === reminderId ? { ...item, enabled: !item.enabled } : item,
      ),
    }))
    if (target) {
      pushRemote(() => remote.updateReminder(reminderId, { enabled: !target.enabled }))
    }
  }, [])

  const toggleCalendarReminder = useCallback((reminderId: string) => {
    const target = dataRef.current.calendarReminders.find((item) => item.id === reminderId)
    setData((current) => ({
      ...current,
      calendarReminders: current.calendarReminders.map((item) =>
        item.id === reminderId ? { ...item, enabled: !item.enabled } : item,
      ),
    }))
    if (target) {
      pushRemote(() => remote.updateCalendarReminder(reminderId, { enabled: !target.enabled }))
    }
  }, [])

  const updateProfile = useCallback((profile: Profile) => {
    const current = dataRef.current
    const session = readLocalSession()
    const previousEmail = (
      session?.user.email || current.profile.email
    )
      .trim()
      .toLowerCase()
    const email = profile.email.trim().toLowerCase() || previousEmail
    const nextProfile: Profile = { ...profile, email }
    const nextData: AppData = { ...current, profile: nextProfile }

    setData(nextData)
    if (email) saveAccountData(email, nextData)
    if (previousEmail && email && previousEmail !== email) {
      removeAccountData(previousEmail)
    }
    if (session?.isAuthenticated) {
      saveLocalSession({ ...session.user, name: nextProfile.name, email })
    }
    pushRemote(() => remote.updateProfile(nextProfile))
  }, [])

  const updatePreferences = useCallback((patch: Partial<Preferences>) => {
    setData((current) => ({
      ...current,
      preferences: { ...current.preferences, ...patch },
    }))
    pushRemote(() => remote.updatePreferences(patch))
  }, [])

  /** Pulihkan data contoh, tetapi pertahankan nama, email, dan NIM akun. */
  const resetData = useCallback(() => {
    const current = dataRef.current.profile
    const next = createSeedData({
      ...initialProfile,
      name: current.name,
      email: current.email,
      nim: current.nim,
    })
    setData(next)
    pushRemote(() => remote.reset())
  }, [])

  const stats = useMemo(() => computeStats(data.tasks), [data.tasks])

  const value = useMemo<AppContextValue>(
    () => ({
      ...data,
      stats,
      authStatus,
      authError,
      isAuthenticated: authStatus === "ready",
      signIn,
      signUp,
      signOut,
      refreshSession,
      updateTask,
      toggleSubtask,
      markTaskDone,
      addTask,
      deleteTask,
      restoreTask,
      addCustomCourse,
      addSubtask,
      deleteSubtask,
      addAgenda,
      updateAgenda,
      deleteAgenda,
      restoreAgenda,
      saveSessionOverride,
      clearSessionOverride,
      addSession,
      updateSession,
      deleteSession,
      restoreSession,
      addReminder,
      deleteReminder,
      restoreReminder,
      toggleReminder,
      toggleCalendarReminder,
      updateProfile,
      updatePreferences,
      resetData,
    }),
    [
      data,
      stats,
      authStatus,
      authError,
      signIn,
      signUp,
      signOut,
      refreshSession,
      updateTask,
      toggleSubtask,
      markTaskDone,
      addTask,
      deleteTask,
      restoreTask,
      addCustomCourse,
      addSubtask,
      deleteSubtask,
      addAgenda,
      updateAgenda,
      deleteAgenda,
      restoreAgenda,
      saveSessionOverride,
      clearSessionOverride,
      addSession,
      updateSession,
      deleteSession,
      restoreSession,
      addReminder,
      deleteReminder,
      restoreReminder,
      toggleReminder,
      toggleCalendarReminder,
      updateProfile,
      updatePreferences,
      resetData,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export { taskProgress }
