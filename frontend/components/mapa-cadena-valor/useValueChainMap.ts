"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import {
  DEFAULT_API_BASE_URL,
  DEFAULT_GEOJSON_URL,
  FALLBACK_FILTERS,
} from "./constants";
import {
  normalizeDistrictCode,
  projectDistricts,
  validateDistrictCollection,
} from "./map-utils";
import type {
  ActorTypeCode,
  ActorTypeOption,
  DistrictFeatureCollection,
  DistrictMapDatum,
  ValueChainMapResponse,
} from "./types";

interface UseValueChainMapOptions {
  apiBaseUrl?: string;
  geoJsonUrl?: string;
  initialFilter?: ActorTypeCode;
}

interface MapState {
  geoJson: DistrictFeatureCollection | null;
  data: ValueChainMapResponse | null;
  loadingGeometry: boolean;
  loadingData: boolean;
  geometryError: string | null;
  dataError: string | null;
}

export function useValueChainMap({
  apiBaseUrl = DEFAULT_API_BASE_URL,
  geoJsonUrl = DEFAULT_GEOJSON_URL,
  initialFilter = "todos",
}: UseValueChainMapOptions = {}) {
  const [filter, setFilter] = useState<ActorTypeCode>(initialFilter);
  const [state, setState] = useState<MapState>({
    geoJson: null,
    data: null,
    loadingGeometry: true,
    loadingData: true,
    geometryError: null,
    dataError: null,
  });

  const loadGeometry = useCallback(
    async (signal?: AbortSignal) => {
      setState((current) => ({
        ...current,
        loadingGeometry: true,
        geometryError: null,
      }));

      try {
        const response = await fetch(geoJsonUrl, {
          signal,
          headers: { Accept: "application/geo+json, application/json" },
        });

        if (!response.ok) {
          throw new Error(
            `No se pudo cargar el GeoJSON (${response.status}).`,
          );
        }

        const json: unknown = await response.json();
        const geoJson = validateDistrictCollection(json);

        setState((current) => ({
          ...current,
          geoJson,
          loadingGeometry: false,
        }));
      } catch (error) {
        if (signal?.aborted) return;

        setState((current) => ({
          ...current,
          loadingGeometry: false,
          geometryError:
            error instanceof Error
              ? error.message
              : "No fue posible cargar la geometría.",
        }));
      }
    },
    [geoJsonUrl],
  );

  const loadData = useCallback(
    async (activeFilter: ActorTypeCode, signal?: AbortSignal) => {
      setState((current) => ({
        ...current,
        loadingData: true,
        dataError: null,
      }));

      try {
        const queryParams = activeFilter !== "todos" ? `?tipo=${activeFilter}` : "";
        const data = await api.get<ValueChainMapResponse>(
          `/mapa/cadena-valor${queryParams}`,
          { signal }
        );

        setState((current) => ({
          ...current,
          data,
          loadingData: false,
        }));
      } catch (error) {
        if (signal?.aborted) return;

        setState((current) => ({
          ...current,
          loadingData: false,
          dataError:
            error instanceof Error
              ? error.message
              : "No fue posible cargar los datos estadísticos.",
        }));
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadGeometry(controller.signal);
    return () => controller.abort();
  }, [loadGeometry]);

  useEffect(() => {
    const controller = new AbortController();
    void loadData(filter, controller.signal);
    return () => controller.abort();
  }, [filter, loadData]);

  const projectedDistricts = useMemo(
    () => (state.geoJson ? projectDistricts(state.geoJson) : []),
    [state.geoJson],
  );

  const districtDataByCode = useMemo(() => {
    const map = new Map<string, DistrictMapDatum>();

    for (const district of state.data?.distritos ?? []) {
      map.set(normalizeDistrictCode(district.codigoDistrito), district);
    }

    return map;
  }, [state.data]);

  const filters: ActorTypeOption[] =
    state.data?.filtros?.length
      ? state.data.filtros
      : FALLBACK_FILTERS;

  const retryGeometry = useCallback(() => {
    const controller = new AbortController();
    void loadGeometry(controller.signal);
  }, [loadGeometry]);

  const retryData = useCallback(() => {
    const controller = new AbortController();
    void loadData(filter, controller.signal);
  }, [filter, loadData]);

  return {
    filter,
    setFilter,
    filters,
    state,
    projectedDistricts,
    districtDataByCode,
    retryGeometry,
    retryData,
  };
}
