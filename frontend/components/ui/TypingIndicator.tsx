import { cn } from "@/lib/utils";

import styles from "./TypingIndicator.module.css";

type TypingIndicatorProps = {
  className?: string;
  compact?: boolean;
  label?: string;
  tone?: "coffee" | "light";
};

export function TypingIndicator({
  className,
  compact = false,
  label = "Cargando contenido",
  tone = "coffee",
}: TypingIndicatorProps) {
  return (
    <span
      className={cn(
        styles.indicator,
        compact && styles.compact,
        tone === "light" && styles.light,
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className={styles.circle} />
      <span className={styles.circle} />
      <span className={styles.circle} />
      <span className={styles.shadow} />
      <span className={styles.shadow} />
      <span className={styles.shadow} />
    </span>
  );
}

export function DataLoadingState({
  label = "Cargando contenido...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn(styles.state, "py-16", className)}>
      <TypingIndicator label={label} />
      <p className={styles.label}>{label}</p>
    </div>
  );
}
