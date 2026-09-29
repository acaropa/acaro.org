import styles from "./panama-value-chain-map.module.css";
import type { TooltipModel } from "./types";

interface MapTooltipProps {
  tooltip: TooltipModel | null;
}

export function MapTooltip({ tooltip }: Readonly<MapTooltipProps>) {
  if (!tooltip) return null;

  return (
    <output
      className={styles.tooltip}
      style={{ left: tooltip.x, top: tooltip.y }}
    >
      <strong>{tooltip.district}</strong>
      <span>{tooltip.province}</span>
      <b>
        {tooltip.count}{" "}
        {tooltip.count === 1 ? "actor registrado" : "actores registrados"}
      </b>
    </output>
  );
}
