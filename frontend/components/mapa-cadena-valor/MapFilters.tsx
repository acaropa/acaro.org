"use client";

import styles from "./panama-value-chain-map.module.css";
import type { ActorTypeCode, ActorTypeOption } from "./types";

interface MapFiltersProps {
  filters: ActorTypeOption[];
  activeFilter: ActorTypeCode;
  disabled?: boolean;
  onChange: (filter: ActorTypeCode) => void;
}

export function MapFilters({
  filters,
  activeFilter,
  disabled = false,
  onChange,
}: MapFiltersProps) {
  return (
    <nav
      className={styles.filters}
      aria-label="Filtrar actores de la cadena de valor"
    >
      {filters.map((filter) => {
        const isActive = filter.code === activeFilter;

        return (
          <button
            key={filter.code}
            type="button"
            className={`${styles.filterButton} ${
              isActive ? styles.filterButtonActive : ""
            }`}
            aria-pressed={isActive}
            disabled={disabled}
            onClick={() => onChange(filter.code)}
          >
            {filter.label}
          </button>
        );
      })}
    </nav>
  );
}
