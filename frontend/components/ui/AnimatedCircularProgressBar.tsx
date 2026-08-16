"use client";

import { cn } from "@/lib/utils";

import styles from "./AnimatedCircularProgressBar.module.css";

type AnimatedCircularProgressBarProps = {
  value: number;
  max?: number;
  min?: number;
  gaugePrimaryColor: string;
  gaugeSecondaryColor: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
};

export function AnimatedCircularProgressBar({
  value,
  max = 100,
  min = 0,
  gaugePrimaryColor,
  gaugeSecondaryColor,
  className,
  size = 56,
  strokeWidth = 2,
}: AnimatedCircularProgressBarProps) {
  const range = Math.max(1, max - min);
  const clamped = Math.min(max, Math.max(min, value));
  const percentage = ((clamped - min) / range) * 100;
  const radius = (size - strokeWidth) / 2;
  const roundedValue = Math.round(clamped);

  return (
    <div
      className={cn(styles.root, className)}
      role="progressbar"
      aria-label="Progreso de la encuesta"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={roundedValue}
      style={{ width: size, height: size }}
    >
      <svg className={styles.svg} viewBox={"0 0 " + size + " " + size} aria-hidden="true">
        <circle
          className={styles.track}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          pathLength="100"
          stroke={gaugeSecondaryColor}
          strokeWidth={strokeWidth}
        />
        <circle
          className={styles.value}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          pathLength="100"
          stroke={gaugePrimaryColor}
          strokeWidth={strokeWidth}
          strokeDasharray="100"
          strokeDashoffset={100 - percentage}
          strokeLinecap="round"
        />
      </svg>

      <span className={styles.content} aria-hidden="true">
        <span className={styles.number} style={{ fontSize: Math.round(size * 0.28) }}>
          {roundedValue}
        </span>
        <span className={styles.symbol} style={{ fontSize: Math.max(7, Math.round(size * 0.12)) }}>
          %
        </span>
      </span>
    </div>
  );
}
