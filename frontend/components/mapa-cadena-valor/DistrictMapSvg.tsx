"use client";

import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { MAP_HEIGHT, MAP_WIDTH } from "./constants";
import {
  clampTooltipPosition,
  getDistrictName,
  getIntensityLevel,
  getProvinceName,
  type ProjectedDistrict,
} from "./map-utils";
import { MapTooltip } from "./MapTooltip";
import styles from "./panama-value-chain-map.module.css";
import type {
  DistrictMapDatum,
  SelectedDistrict,
  TooltipModel,
} from "./types";

interface DistrictMapSvgProps {
  districts: ProjectedDistrict[];
  dataByCode: Map<string, DistrictMapDatum>;
  selectedDistrictId: string | null;
  loadingData?: boolean;
  onSelect: (district: SelectedDistrict) => void;
}

function intensityClass(level: number): string {
  switch (level) {
    case 1:
      return styles.level1;
    case 2:
      return styles.level2;
    case 3:
      return styles.level3;
    case 4:
      return styles.level4;
    case 5:
      return styles.level5;
    default:
      return styles.level0;
  }
}

export function DistrictMapSvg({
  districts,
  dataByCode,
  selectedDistrictId,
  loadingData = false,
  onSelect,
}: DistrictMapSvgProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<TooltipModel | null>(null);

  const maximumCount = useMemo(
    () =>
      Math.max(
        0,
        ...Array.from(dataByCode.values(), (district) => district.cantidad),
      ),
    [dataByCode],
  );

  function districtModel(projected: ProjectedDistrict): SelectedDistrict {
    const datum = dataByCode.get(projected.districtId);

    return {
      districtId: projected.districtId,
      district:
        datum?.distrito ?? getDistrictName(projected.feature.properties),
      province:
        datum?.provincia ?? getProvinceName(projected.feature.properties),
      count: datum?.cantidad ?? 0,
    };
  }

  function updateTooltip(
    event: PointerEvent<SVGPathElement> | MouseEvent<SVGPathElement>,
    projected: ProjectedDistrict,
  ) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const point = clampTooltipPosition(
      event.clientX - rect.left,
      event.clientY - rect.top,
      rect.width,
      rect.height,
    );
    const district = districtModel(projected);

    setTooltip({
      ...district,
      x: point.x,
      y: point.y,
    });
  }

  function selectDistrict(projected: ProjectedDistrict) {
    setTooltip(null);
    onSelect(districtModel(projected));
  }

  function handleKeyboard(
    event: KeyboardEvent<SVGPathElement>,
    projected: ProjectedDistrict,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectDistrict(projected);
    }
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.mapCanvas} ${
        loadingData ? styles.mapCanvasUpdating : ""
      }`}
    >
      <svg
        className={styles.mapSvg}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label="Mapa interactivo de Panamá dividido por distritos"
      >
        {districts.map((projected) => {
          const district = districtModel(projected);
          const level = getIntensityLevel(
            district.count,
            maximumCount,
          );
          const isSelected =
            projected.districtId === selectedDistrictId;

          return (
            <path
              key={projected.districtId}
              d={projected.path}
              fillRule="evenodd"
              vectorEffect="non-scaling-stroke"
              className={`${styles.district} ${intensityClass(level)} ${
                isSelected ? styles.districtSelected : ""
              }`}
              role="button"
              tabIndex={0}
              aria-label={`${district.district}, ${district.province}: ${district.count} actores registrados`}
              aria-pressed={isSelected}
              onPointerEnter={(event: PointerEvent<SVGPathElement>) =>
                updateTooltip(event, projected)
              }
              onPointerMove={(event: PointerEvent<SVGPathElement>) =>
                updateTooltip(event, projected)
              }
              onPointerLeave={() => setTooltip(null)}
              onClick={() => selectDistrict(projected)}
              onKeyDown={(event: KeyboardEvent<SVGPathElement>) =>
                handleKeyboard(event, projected)
              }
            />
          );
        })}
      </svg>

      <MapTooltip tooltip={tooltip} />
    </div>
  );
}
