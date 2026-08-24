"use client";

import { DataLoadingState } from "@/components/ui/TypingIndicator";

import { useState } from "react";
import { DistrictMapSvg } from "./DistrictMapSvg";
import { MapFilters } from "./MapFilters";
import { MapLegend } from "./MapLegend";
import styles from "./panama-value-chain-map.module.css";
import type {
  PanamaValueChainMapProps,
  SelectedDistrict,
} from "./types";
import { useValueChainMap } from "./useValueChainMap";

export default function PanamaValueChainMap({
  apiBaseUrl,
  geoJsonUrl,
  eyebrow = "ACARO OBC · Cadena de valor",
  title = "Presencia territorial del café robusta en Panamá",
  description = "Consulta la distribución de actores vinculados a la cadena de valor del café robusta en el territorio nacional.",
  initialFilter = "todos",
  onDistrictClick,
}: PanamaValueChainMapProps) {
  const {
    filter,
    setFilter,
    filters,
    state,
    projectedDistricts,
    districtDataByCode,
    retryGeometry,
    retryData,
  } = useValueChainMap({
    apiBaseUrl,
    geoJsonUrl,
    initialFilter,
  });

  const [selectedDistrict, setSelectedDistrict] =
    useState<SelectedDistrict | null>(null);

  function handleDistrictSelect(district: SelectedDistrict) {
    setSelectedDistrict(district);
    onDistrictClick?.(district);
  }

  const total = state.data?.totalActores ?? 0;
  const hasNoData =
    !state.loadingData &&
    !state.dataError &&
    state.data !== null &&
    total === 0;

  return (
    <section className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            {eyebrow}
          </span>
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.subtitle}>{description}</p>}
        </div>

        <div className={styles.counter} aria-live="polite">
          <span className={styles.counterLabel}>actores en el territorio</span>
          <strong>{state.loadingData ? "—" : total}</strong>
        </div>
      </header>

      <div className={styles.headerRule} aria-hidden="true" />

      <MapFilters
        filters={filters}
        activeFilter={filter}
        disabled={state.loadingData}
        onChange={(nextFilter) => {
          setSelectedDistrict(null);
          setFilter(nextFilter);
        }}
      />

      {state.geometryError ? (
        <div className={styles.errorState} role="alert">
          <strong>No se pudo cargar el mapa de distritos.</strong>
          <p>{state.geometryError}</p>
          <button type="button" onClick={retryGeometry}>
            Reintentar mapa
          </button>
        </div>
      ) : state.loadingGeometry ? (
        <DataLoadingState label="Preparando el territorio..." className="min-h-[430px]" />
      ) : (
        <DistrictMapSvg
          districts={projectedDistricts}
          dataByCode={districtDataByCode}
          selectedDistrictId={
            selectedDistrict?.districtId ?? null
          }
          loadingData={state.loadingData}
          onSelect={handleDistrictSelect}
        />
      )}

      {state.dataError && (
        <div className={styles.inlineError} role="alert">
          <span>{state.dataError}</span>
          <button type="button" onClick={retryData}>
            Reintentar datos
          </button>
        </div>
      )}

      {hasNoData && (
        <p className={styles.emptyMessage}>
          No hay actores registrados para este filtro.
        </p>
      )}

      <footer className={styles.footer}>
        <MapLegend />

        {selectedDistrict && (
          <div className={styles.selectionSummary} aria-live="polite">
            <span>Distrito seleccionado</span>
            <strong>{selectedDistrict.district}</strong>
            <small>
              {selectedDistrict.count}{" "}
              {selectedDistrict.count === 1
                ? "actor visible"
                : "actores visibles"}
            </small>
          </div>
        )}
      </footer>

      {state.data?.meta?.mode === "DEMO" && (
        <p className={styles.demoNotice}>
          Demostración: los conteos visibles son datos simulados y no
          representan registros reales de ACARO OBC.
        </p>
      )}
    </section>
  );
}
