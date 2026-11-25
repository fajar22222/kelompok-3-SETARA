import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import {
  Bell,
  Calendar,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock,
  Command as CommandIcon,
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Sun,
  TrendingUp,
} from "lucide-react"

import { TaskFormDialog } from "@/components/task-form-dialog"
import { BrandLogo } from "@/components/brand-logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useSidebar } from "@/components/ui/sidebar"
import { useApp } from "@/context/app-context"
import { useTheme } from "@/components/theme-provider"
import { TODAY_ISO } from "@/data/seed"
import { formatShort, relativeDay } from "@/lib/date"
import { cn } from "@/lib/utils"

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  shortcut?: string
  badge?: "tasks" | "reminders"
}

const MAIN_NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, shortcut: "⌘ D" },
  { to: "/tugas", label: "Tugas saya", icon: ClipboardList, badge: "tasks" },
  { to: "/jadwal", label: "Jadwal kuliah", icon: CalendarDays },
  { to: "/kalender", label: "Kalender", icon: Calendar },
  { to: "/pengingat", label: "Pengingat", icon: Bell, badge: "reminders" },
  { to: "/progres", label: "Progres", icon: TrendingUp },
]

const INFO_NAV: NavItem[] = [
  { to: "/pengaturan", label: "Pengaturan", icon: Settings },
  { to: "/bantuan", label: "Pusat bantuan", icon: HelpCircle },
]

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/tugas": "Tugas saya",
  "/jadwal": "Jadwal kuliah",
  "/kalender": "Kalender",
  "/pengingat": "Pengingat",
  "/progres": "Progres",
  "/pengaturan": "Pengaturan",
  "/bantuan": "Pusat bantuan",
}

function SetaraMark({ className }: { className?: string }) {
  return <BrandLogo className={className} />
}

function SidebarInner({
  expanded,
  onToggle,
}: {
  expanded: boolean
  onToggle: () => void
}) {
  const { stats, reminders, profile } = useApp()
  const todayReminders = reminders.filter(
    (reminder) => reminder.enabled && reminder.date === TODAY_ISO,
  ).length

  const initials = profile.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const badgeValue = (badge?: NavItem["badge"]) => {
    if (badge === "tasks") return stats.belum
    if (badge === "reminders") return todayReminders
    return null
  }

  const renderNav = (items: NavItem[]) =>
    items.map((item) => {
      const Icon = item.icon
      const badge = badgeValue(item.badge)
      return (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          title={expanded ? undefined : item.label}
          className={({ isActive }) =>
            cn(
              "group relative flex h-9 items-center gap-2.5 rounded-full px-3 text-[13px] transition-all duration-150",
              isActive
                ? "bg-white font-medium text-zinc-900 shadow-[0_1px_3px_rgba(24,24,27,0.06)] ring-1 ring-zinc-200/50 dark:bg-zinc-800 dark:text-zinc-100 dark:shadow-none dark:ring-zinc-700"
                : "text-zinc-500 hover:bg-white/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100",
              !expanded && "justify-center px-0",
            )
          }
        >
          <Icon className="size-[17px] shrink-0" strokeWidth={1.8} />
          {expanded ? (
            <>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.shortcut ? (
                <span className="inline-flex h-5 items-center rounded-md border border-zinc-200/80 bg-white/60 px-1.5 text-[9px] font-medium text-zinc-400">
                  {item.shortcut}
                </span>
              ) : null}
              {badge && badge > 0 ? (
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground tabular-nums">
                  {badge}
                </span>
              ) : null}
            </>
          ) : null}
        </NavLink>
      )
    })

  return (
    <div className="flex h-full min-h-0 flex-col px-3 py-4">
      <div
        className={cn(
          "flex items-center gap-2 px-1",
          expanded ? "justify-between" : "flex-col gap-3",
        )}
      >
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <SetaraMark />
          {expanded ? (
            <span className="truncate font-heading text-[15px] font-semibold tracking-tight text-zinc-900">
              SETARA
            </span>
          ) : null}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          title={expanded ? "Sembunyikan sidebar" : "Tampilkan sidebar"}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-white/70 hover:text-zinc-700"
        >
          <PanelLeft className="size-4" />
        </button>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-1">
        <p
          className={cn(
            "px-3 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase",
            !expanded && "sr-only",
          )}
        >
          Menu utama
        </p>
        <nav className="flex flex-col gap-0.5">{renderNav(MAIN_NAV)}</nav>

        <div className={cn("mx-3 my-4 h-px bg-zinc-200/70", expanded && "hidden")} />

        <p
          className={cn(
            "px-3 pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase",
            !expanded && "sr-only",
          )}
        >
          Pengaturan &amp; info
        </p>
        <nav className="flex flex-col gap-0.5">{renderNav(INFO_NAV)}</nav>
      </div>

      <div className="mt-2 shrink-0 border-t border-zinc-200/70 pt-3">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-2xl px-1 py-1",
            !expanded && "flex-col gap-2 px-0",
          )}
        >
          <Avatar className="size-9 shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-zinc-700 to-zinc-500 text-[10px] font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          {expanded ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-zinc-900">{profile.name}</p>
              <p className="mt-0.5 truncate text-[10px] text-zinc-500">
                Mahasiswa {profile.prodi}
              </p>
            </div>
          ) : null}
          <Link
            to="/login"
            title="Keluar"
            className="grid size-7 shrink-0 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-white/80 hover:text-zinc-700"
          >
            <LogOut className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function AppSidebar() {
  const { open, toggleSidebar, isMobile, openMobile, setOpenMobile } = useSidebar()

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[278px] border-r border-zinc-200/70 bg-background p-0 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigasi SETARA</SheetTitle>
            <SheetDescription>Menu utama aplikasi SETARA</SheetDescription>
          </SheetHeader>
          <SidebarInner expanded onToggle={() => setOpenMobile(false)} />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 transition-[width] duration-200 ease-linear md:block print:hidden",
        open ? "w-[248px]" : "w-[76px]",
      )}
    >
      <SidebarInner expanded={open} onToggle={toggleSidebar} />
    </aside>
  )
}

function TopHeader({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { reminders, tasks } = useApp()
  const { resolvedTheme, toggleTheme } = useTheme()
  const { setOpenMobile } = useSidebar()
  const location = useLocation()
  const pageTitle = PAGE_TITLES[location.pathname] ?? "Dashboard"

  const todaysReminders = reminders
    .filter((reminder) => reminder.enabled)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 3)

  const nearDeadlines = tasks
    .filter((task) => task.status !== "selesai")
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 3)

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-zinc-200/70 bg-white/95 px-4 backdrop-blur md:px-6 dark:border-zinc-800 dark:bg-zinc-900/95 print:hidden">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setOpenMobile(true)}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 md:hidden"
          aria-label="Buka navigasi"
        >
          <PanelLeft className="size-4" />
        </button>

        <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-zinc-400">
          <Link
            to="/"
            className="hidden font-heading text-[13px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:inline"
          >
            SETARA
          </Link>
          <ChevronRight className="hidden size-3.5 text-zinc-300 sm:block" />
          <span className="hidden items-center gap-1 sm:flex">
            <Home className="size-3.5" />
            Ruang akademik
          </span>
          <ChevronRight className="hidden size-3.5 text-zinc-300 sm:block" />
          <span className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
            {pageTitle}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="relative grid size-9 place-items-center rounded-xl border border-zinc-200/80 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            aria-label="Notifikasi"
          >
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-orange-500 ring-2 ring-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-80 p-0">
            <div className="border-b border-zinc-100 px-4 py-3">
              <p className="text-sm font-semibold text-zinc-900">Notifikasi</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">
                {nearDeadlines.length} deadline menunggu perhatianmu
              </p>
            </div>
            <div className="p-1.5">
              {nearDeadlines.map((task) => (
                <Link
                  key={task.id}
                  to={`/tugas?task=${task.id}`}
                  className="flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-zinc-50"
                >
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-rose-500" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-zinc-800">
                      {task.title}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-zinc-500">
                      {relativeDay(task.deadline, TODAY_ISO)} · {formatShort(task.deadline)} ·{" "}
                      {task.time}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
            <div className="border-t border-zinc-100 p-2">
              <Link
                to="/pengingat"
                className="block rounded-lg px-2 py-1.5 text-center text-[11px] font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
              >
                Lihat semua pengingat
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="relative grid size-9 place-items-center rounded-xl border border-zinc-200/80 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            aria-label="Pengingat"
          >
            <MessageSquare className="size-4" />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-orange-400 ring-2 ring-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-80 p-0">
            <div className="border-b border-zinc-100 px-4 py-3">
              <p className="text-sm font-semibold text-zinc-900">Pengingat terdekat</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">Tiga agenda berikutnya</p>
            </div>
            <div className="p-1.5">
              {todaysReminders.map((reminder) => (
                <div key={reminder.id} className="flex gap-3 rounded-xl p-2.5 hover:bg-zinc-50">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-orange-50 text-[10px] font-semibold text-orange-600 tabular-nums">
                    {reminder.time}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-zinc-800">
                      {reminder.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] text-zinc-500">
                      {relativeDay(reminder.date, TODAY_ISO)} · {reminder.detail}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-100 p-2">
              <Link
                to="/pengingat"
                className="block rounded-lg px-2 py-1.5 text-center text-[11px] font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
              >
                Kelola pengingat
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={toggleTheme}
          className="grid size-9 place-items-center rounded-xl border border-zinc-200/80 bg-white text-zinc-500 transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white"
          aria-label={resolvedTheme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
          title={resolvedTheme === "dark" ? "Mode terang" : "Mode gelap"}
        >
          {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className="flex h-9 items-center gap-2 rounded-xl border border-zinc-200/80 bg-white px-2.5 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white"
          aria-label="Pencarian cepat"
        >
          <Search className="size-4" />
          <span className="hidden items-center gap-0.5 rounded-md border border-zinc-200/80 bg-zinc-50 px-1.5 py-0.5 text-[9px] font-medium text-zinc-400 lg:inline-flex">
            <CommandIcon className="size-2.5" />K
          </span>
        </button>
      </div>
    </header>
  )
}

export function AppShell() {
  const { tasks, stats } = useApp()
  const { setOpenMobile } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault()
        navigate("/")
      }
    }
    const openSearch = () => setSearchOpen(true)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("setara:open-search", openSearch)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("setara:open-search", openSearch)
    }
  }, [navigate])

  useEffect(() => {
    if (new URLSearchParams(location.search).has("cari")) setSearchOpen(true)
  }, [location.search])

  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] ?? "Dashboard"
    document.title = `${title} · SETARA`
    setOpenMobile(false)
  }, [location.pathname, setOpenMobile])

  const go = (to: string) => {
    setSearchOpen(false)
    setOpenMobile(false)
    navigate(to)
  }

  return (
    <div className="flex min-h-screen w-full bg-background print:block print:min-h-0">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col p-2 md:py-3 md:pr-3 md:pl-0 print:block print:p-0">
        <div className="flex min-h-[calc(100vh-0.5rem)] min-w-0 flex-1 flex-col overflow-clip rounded-2xl border border-zinc-200/70 bg-white shadow-xs md:min-h-[calc(100vh-1.5rem)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none print:min-h-0 print:rounded-none print:border-0 print:shadow-none">
          <TopHeader onOpenSearch={() => setSearchOpen(true)} />
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 pb-10 md:px-7 md:py-6 md:pb-10">
            <Outlet />
          </main>
        </div>
      </div>

      <CommandDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Pencarian cepat"
        description="Cari halaman, tugas, atau aksi dengan cepat"
        className="sm:max-w-xl"
      >
        <Command>
          <CommandInput placeholder="Cari halaman, tugas, atau aksi..." />
          <CommandList>
            <CommandEmpty>Tidak ada hasil yang cocok.</CommandEmpty>
            <CommandGroup heading="Navigasi">
              {[...MAIN_NAV, ...INFO_NAV].map((item) => {
                const Icon = item.icon
                return (
                  <CommandItem
                    key={item.to}
                    value={`${item.label} ${item.to}`}
                    onSelect={() => go(item.to)}
                  >
                    <Icon className="size-4 text-zinc-400" />
                    <span>{item.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Tugas">
              {tasks.slice(0, 8).map((task) => (
                <CommandItem
                  key={task.id}
                  value={`${task.title} ${task.course}`}
                  onSelect={() => go(`/tugas?task=${task.id}`)}
                >
                  <ClipboardList className="size-4 text-zinc-400" />
                  <span className="min-w-0 flex-1 truncate">{task.title}</span>
                  <span className="text-[10px] text-zinc-400">{formatShort(task.deadline)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Aksi cepat">
              <CommandItem
                value="tambah tugas baru"
                onSelect={() => {
                  setSearchOpen(false)
                  setTaskOpen(true)
                }}
              >
                <Plus className="size-4 text-zinc-400" />
                <span>Tambah tugas baru</span>
              </CommandItem>
              <CommandItem
                value="lihat pengingat"
                onSelect={() => go("/pengingat")}
              >
                <Clock className="size-4 text-zinc-400" />
                <span>Kelola pengingat</span>
                <span className="ml-auto text-[10px] text-zinc-400">{stats.belum} aktif</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>

      <TaskFormDialog open={taskOpen} onOpenChange={setTaskOpen} />
    </div>
  )
}
