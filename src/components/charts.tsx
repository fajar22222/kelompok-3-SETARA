import * as React from "react"

import { cn } from "@/lib/utils"

type SparkProps = {
  data: number[]
  className?: string
  /** Warna grafik; memakai token brand agar light/dark otomatis konsisten. */
  color?: string
}

export function AreaSpark({ data, className, color = "var(--brand)" }: SparkProps) {
  const rawId = React.useId()
  const gradientId = `spark-area-${rawId.replace(/:/g, "")}`
  const width = 132
  const height = 52
  const pad = 4
  const max = Math.max(...data)
  const min = Math.min(...data)
  const span = Math.max(max - min, 1)

  const points = data.map((value, index) => {
    const x = pad + (index / Math.max(data.length - 1, 1)) * (width - pad * 2)
    const y = height - pad - ((value - min) / span) * (height - pad * 2 - 4)
    return [x, y] as const
  })

  const line = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ")
  const area = `${line} L${width - pad},${height} L${pad},${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-12 w-32", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        r="2.6"
        fill={color}
        stroke="#fff"
        strokeWidth="1.2"
      />
    </svg>
  )
}

export function BarsSpark({ data, className, color = "var(--brand)" }: SparkProps) {
  const width = 132
  const height = 52
  const gap = 5
  const barWidth = (width - gap * (data.length - 1)) / data.length
  const max = Math.max(...data, 1)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-12 w-32", className)}
      aria-hidden="true"
    >
      {data.map((value, index) => {
        const barHeight = Math.max((value / max) * (height - 6), 4)
        return (
          <rect
            key={`${value}-${index}`}
            x={index * (barWidth + gap)}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
            rx="3"
            fill={color}
            fillOpacity={index === data.length - 1 ? 1 : 0.25}
          />
        )
      })}
    </svg>
  )
}

export function Donut({
  value,
  size = 172,
  strokeWidth = 12,
  className,
  children,
}: {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  children?: React.ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference

  return (
    <div className={cn("relative inline-flex", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id="donut-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#71717a" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f4f4f5"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#donut-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

export function TrendLine({
  data,
  labels,
  className,
}: {
  data: number[]
  labels?: string[]
  className?: string
}) {
  const width = 620
  const height = 210
  const padX = 28
  const padTop = 18
  const padBottom = 30
  const max = Math.max(...data, 1)
  const chartHeight = height - padTop - padBottom

  const points = data.map((value, index) => {
    const x = padX + (index / Math.max(data.length - 1, 1)) * (width - padX * 2)
    const y = padTop + (1 - value / max) * chartHeight
    return { x, y }
  })

  const line = points
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ")
  const area = `${line} L${width - padX},${height - padBottom} L${padX},${height - padBottom} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("w-full", className)}
      role="img"
      aria-label="Grafik penyelesaian tugas"
    >
      <defs>
        <linearGradient id="trend-line-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((step) => {
        const y = padTop + (step / 3) * chartHeight
        return (
          <line
            key={step}
            x1={padX}
            x2={width - padX}
            y1={y}
            y2={y}
            stroke="#f4f4f5"
            strokeWidth="1"
          />
        )
      })}
      <path d={area} fill="url(#trend-line-gradient)" />
      <path
        d={line}
        fill="none"
        stroke="#18181b"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map(({ x, y }, index) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r={index === points.length - 1 ? 4 : 3}
          fill={index === points.length - 1 ? "#f97316" : "#fff"}
          stroke={index === points.length - 1 ? "#f97316" : "#18181b"}
          strokeWidth="1.6"
        />
      ))}
      {labels?.map((label, index) => {
        const x = padX + (index / Math.max(labels.length - 1, 1)) * (width - padX * 2)
        return (
          <text
            key={label}
            x={x}
            y={height - 8}
            textAnchor="middle"
            fontSize="9"
            letterSpacing="0.04em"
            fill="#a1a1aa"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}
