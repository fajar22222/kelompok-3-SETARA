import { lazy, Suspense, useEffect } from "react"
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom"

import { AppShell } from "@/components/app-shell"
import { BrandLogo } from "@/components/brand-logo"
import { ErrorBoundary } from "@/components/error-boundary"
import { ToastProvider } from "@/components/toast-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppProvider, useApp } from "@/context/app-context"

const BantuanPage = lazy(() => import("@/pages/Bantuan"))
const DashboardPage = lazy(() => import("@/pages/Dashboard"))
const JadwalPage = lazy(() => import("@/pages/Jadwal"))
const KalenderPage = lazy(() => import("@/pages/Kalender"))
const LoginPage = lazy(() => import("@/pages/Login"))
const PengaturanPage = lazy(() => import("@/pages/Pengaturan"))
const PengingatPage = lazy(() => import("@/pages/Pengingat"))
const ProgresPage = lazy(() => import("@/pages/Progres"))
const TugasPage = lazy(() => import("@/pages/Tugas"))

function PageLoader() {
  return (
    <div className="grid min-h-svh w-full place-items-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <BrandLogo className="size-11 animate-pulse rounded-2xl" />
        <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Memuat SETARA…</p>
      </div>
    </div>
  )
}

/** Ctrl/Cmd+K membuka palette dari halaman mana pun, termasuk login. */
function GlobalShortcuts() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        if (location.pathname === "/login") {
          navigate("/?cari=1")
        } else {
          window.dispatchEvent(new Event("setara:open-search"))
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [location.pathname, navigate])

  return null
}

function MainLayout() {
  const collapsed =
    typeof document !== "undefined" &&
    document.cookie.split(";").some((part) => part.trim() === "sidebar_state=false")
  return (
    <SidebarProvider defaultOpen={!collapsed}>
      <AppShell />
    </SidebarProvider>
  )
}

/** Halaman utama hanya boleh diakses setelah sesi lokal tersedia. */
function AuthGate() {
  const { authStatus } = useApp()

  if (authStatus === "loading") return <PageLoader />
  if (authStatus === "guest") return <Navigate to="/login" replace />
  return <Outlet />
}

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <AppProvider>
          <ToastProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <GlobalShortcuts />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Login sengaja di luar MainLayout agar tidak ada ruang sidebar. */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route element={<AuthGate />}>
                      <Route element={<MainLayout />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/tugas" element={<TugasPage />} />
                        <Route path="/jadwal" element={<JadwalPage />} />
                        <Route path="/kalender" element={<KalenderPage />} />
                        <Route path="/pengingat" element={<PengingatPage />} />
                        <Route path="/progres" element={<ProgresPage />} />
                        <Route path="/pengaturan" element={<PengaturanPage />} />
                        <Route path="/bantuan" element={<BantuanPage />} />
                      </Route>
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </ToastProvider>
        </AppProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
