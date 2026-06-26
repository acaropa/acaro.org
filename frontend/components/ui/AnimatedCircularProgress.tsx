'use client'

interface Props {
  value: number
  size?: number
  strokeWidth?: number
}

export function AnimatedCircularProgress({ value, size = 110, strokeWidth = 9 }: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, value))
  const offset = circumference * (1 - clamped / 100)

  return (
    <div
      className="relative shrink-0 inline-flex items-center justify-center"
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
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-primary/10"
        />
        {/* Progress arc */}
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
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        <span
          className="font-bold text-primary tabular-nums leading-none"
          style={{ fontSize: Math.round(size * 0.24) }}
        >
          {Math.round(clamped)}
        </span>
        <span
          className="font-bold text-accent leading-none mt-1"
          style={{ fontSize: Math.round(size * 0.13), letterSpacing: '0.08em' }}
        >
          %
        </span>
      </div>
    </div>
  )
}
