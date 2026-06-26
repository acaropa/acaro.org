'use client'

interface Props {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function AnimatedCircularProgress({ value, size = 110, strokeWidth = 9, className = '' }: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, value))
  const offset = circumference * (1 - clamped / 100)

  const numSize = Math.round(size * 0.28)
  const pctSize = Math.max(8, Math.round(size * 0.14))

  return (
    <div
      className={`relative shrink-0 inline-flex items-center justify-center ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-primary/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-accent"
          style={{ transition: 'stroke-dashoffset 0.55s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        <span className="font-bold text-primary tabular-nums leading-none" style={{ fontSize: numSize }}>
          {Math.round(clamped)}
        </span>
        <span className="font-bold text-accent leading-none" style={{ fontSize: pctSize, letterSpacing: '0.06em', marginTop: 2 }}>
          %
        </span>
      </div>
    </div>
  )
}
