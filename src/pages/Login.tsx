import { useEffect, useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { Eye, EyeOff, GraduationCap, Lock, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/brand-logo"
import { NativeSelect } from "@/components/native-select"
import { useToast } from "@/components/toast-provider"
import { Input } from "@/components/ui/input"
import { useApp } from "@/context/app-context"
import { ApiError } from "@/lib/errors"
import { PRODI_OPTIONS } from "@/data/seed"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.98 11.98 0 0 0 1.28 6.62l4.01 3.09C6.23 6.87 8.88 4.77 12 4.77Z"
      />
    </svg>
  )
}

type Mode = "login" | "register"

export default function LoginPage() {
  const navigate = useNavigate()
  const { authStatus, signIn, signUp } = useApp()
  const toast = useToast()
  const [mode, setMode] = useState<Mode>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [prodi, setProdi] = useState<string>(PRODI_OPTIONS[0])
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  useEffect(() => {
    document.title = `${mode === "login" ? "Masuk" : "Daftar"} · SETARA`
  }, [mode])

  if (authStatus === "ready") {
    return <Navigate to="/" replace />
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setError("")
  }

  /** Login cepat untuk tombol alternatif dengan akun yang sudah terdaftar. */
  const runSignIn = async (identifier: string, secret: string) => {
    setError("")
    setPending(true)
    try {
      await signIn(identifier, secret)
      navigate("/")
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Terjadi kesalahan saat masuk. Coba lagi.",
      )
    } finally {
      setPending(false)
    }
  }

  const quickSignIn = async (identifier: string, secret: string) => {
    await runSignIn(identifier, secret)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Email atau NIM wajib diisi.")
      return
    }
    if (!password) {
      setError("Kata sandi wajib diisi.")
      return
    }
    if (mode === "register") {
      if (!name.trim()) {
        setError("Nama lengkap wajib diisi.")
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("Format email tidak valid.")
        return
      }
      if (!prodi) {
        setError("Program studi wajib dipilih.")
        return
      }
    }

    setPending(true)
    try {
      if (mode === "register") {
        await signUp(name.trim(), email.trim(), password, prodi)
        toast.success("Akun berhasil dibuat", "Silakan masuk dengan email dan kata sandimu")
        setMode("login")
        setPassword("")
        setError("")
        return
      }

      await signIn(email.trim(), password)
      navigate("/")
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Terjadi kesalahan saat masuk. Coba lagi.",
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-10 dark:bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #e4e4e7 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="pointer-events-none absolute -top-32 -left-24 size-80 rounded-full bg-brand/20 blur-3xl dark:bg-brand/10" />
      <div className="pointer-events-none absolute -right-24 -bottom-32 size-96 rounded-full bg-accent-warm/20 blur-3xl dark:bg-accent-warm/10" />

      <div className="relative w-full max-w-md">
        <div className="mb-5 flex flex-col items-center gap-2.5 text-center">
          <div className="flex items-center gap-2.5">
            <BrandLogo className="size-11 rounded-2xl" />
            <span className="font-heading text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              SETARA
            </span>
          </div>
          <p className="text-[10px] font-medium tracking-[0.14em] text-zinc-400 uppercase">
            Sistem Tugas dan Agenda Rencana Akademik
          </p>
        </div>

        <div className="w-full rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-xs sm:p-7 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
          <div className="text-center">
            <h1 className="font-heading text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {mode === "login" ? "Masuk" : "Daftar akun"}
            </h1>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {mode === "login"
                ? "Masuk dengan email dan kata sandi akunmu untuk mengakses ruang akademik."
                : "Buat akun baru — data akademikmu tersimpan secara pribadi."}
            </p>
          </div>

          <form className="mt-5 space-y-3.5" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <div className="space-y-1.5">
                <label htmlFor="login-name" className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  Nama lengkap
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="login-name"
                    autoFocus
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nama lengkap mahasiswa"
                    className="h-10 rounded-xl border-zinc-200/80 bg-zinc-50/40 pl-9 text-sm"
                  />
                </div>
              </div>
            ) : null}

            {mode === "register" ? (
              <div className="space-y-1.5">
                <label htmlFor="login-prodi" className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  Program studi
                </label>
                <NativeSelect
                  id="login-prodi"
                  value={prodi}
                  onChange={(event) => setProdi(event.target.value)}
                  className="h-10 rounded-xl"
                >
                  {PRODI_OPTIONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </NativeSelect>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                {mode === "login" ? "Email" : "Email kampus"}
              </label>
              <Input
                id="login-email"
                autoFocus={mode === "login"}
                required
                type="text"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={mode === "login" ? "nama@kampus.ac.id" : "nama@kampus.ac.id"}
                className="h-10 rounded-xl border-zinc-200/80 bg-zinc-50/40 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="login-password" className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  Kata sandi
                </label>
                <Link
                  to="/bantuan"
                  className="text-[10px] font-medium text-zinc-400 transition-colors hover:text-zinc-900"
                >
                  Butuh bantuan?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="login-password"
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={mode === "register" ? "Buat kata sandi" : "Masukkan kata sandi"}
                  className="h-10 rounded-xl border-zinc-200/80 bg-zinc-50/40 pr-10 pl-9 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-zinc-400 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] leading-relaxed text-rose-700 ring-1 ring-rose-100 ring-inset dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/60"
              >
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={pending}
              className="h-10 w-full rounded-xl bg-brand text-sm font-medium text-brand-foreground shadow-sm transition-all duration-200 hover:bg-brand/90 disabled:opacity-70"
            >
              {pending
                ? "Menghubungkan…"
                : mode === "login"
                  ? "Masuk"
                  : "Buat akun"}
            </Button>
          </form>

          {mode === "login" ? (
            <>
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
                <span className="text-[9px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
                  atau lanjutkan dengan
                </span>
                <span className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void quickSignIn("aditya.pratama@kampus.ac.id", "setara123")}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white text-[11px] font-medium text-zinc-700 transition-all duration-200 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <GraduationCap className="size-3.5 text-zinc-500" />
                  Akun kampus
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    void quickSignIn(
                      email.trim() || "pengguna.google@gmail.com",
                      password || "google",
                    )
                  }
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white text-[11px] font-medium text-zinc-700 transition-all duration-200 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <GoogleIcon />
                  Google
                </button>
              </div>
            </>
          ) : null}
        </div>

        <p className="mt-4 text-center text-[10px] leading-relaxed text-zinc-400">
          {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-300"
          >
            {mode === "login" ? "Daftar akun baru" : "Masuk"}
          </button>
          <br />
          Dengan masuk, kamu menyetujui Ketentuan Layanan dan Kebijakan Privasi SETARA.
        </p>
      </div>
    </div>
  )
}
