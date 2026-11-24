import { useNavigate } from "react-router-dom"
import {
  Check,
  Download,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"

import { CourseChip } from "@/components/badges"
import { Donut, TrendLine } from "@/components/charts"
import { Panel, PanelHeader } from "@/components/panel"
import { TaskTable } from "@/components/task-table"
import { Button } from "@/components/ui/button"
import { useApp } from "@/context/app-context"
import { TODAY_ISO } from "@/data/seed"
import { sortByDeadline } from "@/lib/tasks"
import { courseStats } from "@/lib/tasks"
import { taskProgress } from "@/lib/tasks"

const TREND = [2, 3, 1, 4, 3, 5, 4, 6]
const TREND_LABELS = ["21 Sep", "28 Sep", "5 Okt", "12 Okt", "19 Okt", "26 Okt", "2 Nov", "9 Nov"]

export default function ProgresPage() {
  const { tasks, stats } = useApp()
  const navigate = useNavigate()
  const courses = courseStats(tasks)
  const completed = sortByDeadline(tasks.filter((task) => task.status === "selesai"))
    .reverse()
    .slice(0, 5)
  const avgProgress =
    tasks.length === 0
      ? 0
      : Math.round(
          tasks.reduce((total, task) => total + taskProgress(task), 0) / tasks.length,
        )

  const segments = [
    {
      key: "selesai",
      label: "Selesai",
      value: stats.selesai,
      color: "bg-emerald-500",
      dot: "bg-emerald-500",
    },
    {
      key: "dikerjakan",
      label: "Dikerjakan",
      value: stats.dikerjakan,
      color: "bg-orange-400",
      dot: "bg-orange-400",
    },
    {
      key: "belum",
      label: "Belum mulai",
      value: stats.belum,
      color: "bg-amber-300",
      dot: "bg-amber-300",
    },
    {
      key: "review",
      label: "Perlu review",
      value: stats.review,
      color: "bg-purple-400",
      dot: "bg-purple-400",
    },
  ].filter((segment) => segment.value > 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
            Refleksi belajar · Semester 5
          </p>
          <h1 className="mt-1 font-heading text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
            Progres
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Lihat ritme penyelesaian tugas dan capaian per mata kuliah.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="h-9 shrink-0 rounded-full border-zinc-200/80 px-4 text-xs transition-all duration-200 print:hidden"
        >
          <Download className="size-4" />
          Unduh laporan
        </Button>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        <Panel className="flex flex-col items-center gap-5 p-5 sm:flex-row lg:items-center">
          <Donut value={stats.progress} size={158} strokeWidth={13}>
            <span className="font-heading text-3xl font-semibold tracking-tight text-zinc-900">
              {stats.progress}%
            </span>
            <span className="mt-0.5 text-[10px] text-zinc-400">progres semester</span>
          </Donut>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-zinc-500">Total capaian</p>
            <p className="mt-1 font-heading text-lg leading-snug font-semibold tracking-tight text-zinc-900">
              {stats.selesai} dari {stats.total} tugas selesai
            </p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-zinc-500">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Selesai
                </span>
                <span className="font-medium text-zinc-700 tabular-nums">{stats.selesai}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-zinc-500">
                  <span className="size-1.5 rounded-full bg-orange-400" />
                  Dikerjakan
                </span>
                <span className="font-medium text-zinc-700 tabular-nums">
                  {stats.dikerjakan}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-zinc-500">
                  <span className="size-1.5 rounded-full bg-amber-300" />
                  Belum mulai
                </span>
                <span className="font-medium text-zinc-700 tabular-nums">{stats.belum}</span>
              </div>
            </div>
            <p className="mt-3 rounded-lg bg-zinc-50 px-2 py-1.5 text-[10px] text-zinc-500">
              {stats.aktif} tugas masih aktif · {stats.mendekati} mendekati deadline
            </p>
          </div>
        </Panel>

        <Panel className="p-5 lg:col-span-2">
          <PanelHeader
            className="p-0"
            title="Penyelesaian tugas"
            description={`Tren ilustratif · ${stats.selesai} tugas selesai`}
            icon={<TrendingUp className="size-4" />}
            action={
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                <TrendingUp className="size-3" />
                {stats.progress}% semester
              </span>
            }
          />
          <TrendLine data={TREND} labels={TREND_LABELS} className="mt-3" />
          <div className="mt-1 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-3">
            <div>
              <p className="text-[10px] text-zinc-400">Rata-rata progres</p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-900">{avgProgress}%</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400">Tugas aktif</p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-900">{stats.aktif}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400">Mata kuliah</p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-900">{courses.length}</p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Panel className="p-5">
          <PanelHeader
            className="p-0"
            title="Progres per mata kuliah"
            description="Berdasarkan tugas yang sudah selesai"
            icon={<Target className="size-4" />}
          />
          <div className="mt-4 space-y-4">
            {courses.map((course) => (
              <div key={course.course}>
                <div className="flex items-center justify-between gap-2">
                  <CourseChip course={course.course} />
                  <span className="text-[10px] font-medium text-zinc-400 tabular-nums">
                    {course.selesai}/{course.total} selesai
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[10px] font-semibold text-zinc-700 tabular-nums">
                    {course.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-5">
            <PanelHeader
              className="p-0"
              title="Distribusi status"
              description={`${stats.total} tugas semester ini`}
            />
            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-zinc-100">
              {segments.map((segment) => (
                <div
                  key={segment.key}
                  className={segment.color}
                  style={{ width: `${(segment.value / stats.total) * 100}%` }}
                />
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {segments.map((segment) => (
                <div key={segment.key} className="flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1.5 text-zinc-500">
                    <span className={`size-1.5 rounded-full ${segment.dot}`} />
                    {segment.label}
                  </span>
                  <span className="font-medium text-zinc-700 tabular-nums">
                    {segment.value} · {Math.round((segment.value / stats.total) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <div className="relative overflow-hidden rounded-2xl border border-purple-100/80 bg-gradient-to-br from-purple-50 via-white to-orange-50/60 p-5 transition-all duration-200 dark:border-purple-500/20 dark:from-purple-950/40 dark:via-zinc-900 dark:to-orange-950/30">
            <span className="grid size-9 place-items-center rounded-xl bg-white text-purple-600 shadow-xs">
              <Sparkles className="size-4" />
            </span>
            <p className="mt-3 font-heading text-sm font-semibold text-zinc-900">
              Pertahankan ritmenya
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
              Kamu menyelesaikan {stats.selesai} tugas dengan {stats.mendekati} deadline yang
              masih menunggu. Sisihkan satu blok fokus hari ini untuk menjaga momentum.
            </p>
            <Button
              onClick={() => navigate("/tugas")}
              className="mt-3 h-8 rounded-full bg-brand px-3 text-[11px] text-brand-foreground transition-all duration-200 hover:bg-brand/90"
            >
              Lihat tugas aktif
            </Button>
          </div>
        </div>
      </div>

      <Panel className="overflow-hidden">
        <PanelHeader
          title="Tugas selesai terbaru"
          description="Lima tugas terakhir yang kamu tuntaskan"
          icon={<Check className="size-4" />}
          action={
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
              {stats.selesai} total selesai
            </span>
          }
        />
        <div className="mt-3 border-t border-zinc-100">
          <TaskTable
            tasks={completed}
            onSelect={(task) => navigate(`/tugas?task=${task.id}`)}
            compact
            emptyLabel="Belum ada tugas yang selesai."
          />
        </div>
      </Panel>

      <p className="pb-1 text-center text-[10px] text-zinc-400">
        Data progres dihitung otomatis dari checklist tugas · diperbarui{" "}
        {TODAY_ISO.split("-").reverse().join("/")}
      </p>
    </div>
  )
}
