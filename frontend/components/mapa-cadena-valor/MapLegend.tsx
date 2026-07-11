import styles from "./panama-value-chain-map.module.css";

export function MapLegend() {
  return (
    <div className={styles.legend} aria-label="Escala de concentración">
      <span>Menor concentración</span>
      <div className={styles.legendScale} aria-hidden="true">
        <i className={styles.level1} />
        <i className={styles.level2} />
        <i className={styles.level3} />
        <i className={styles.level4} />
        <i className={styles.level5} />
      </div>
      <span>Mayor concentración</span>
    </div>
  );
}
