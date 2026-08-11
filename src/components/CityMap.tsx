"use client";

import { useMemo } from "react";
import type { GarageDTO } from "@/lib/garages";

// A lightweight, dependency-free "map": garages are projected from
// lat/lng into an SVG viewport with a stylized street grid. It gives the
// ClassPass-style map feel without loading external map tiles.

const W = 800;
const H = 800;
const PAD = 60;

export default function CityMap({
  garages,
  activeId,
  onHover,
  onSelect,
}: {
  garages: GarageDTO[];
  activeId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (slug: string) => void;
}) {
  const bounds = useMemo(() => {
    if (garages.length === 0) {
      return { minLat: 37.74, maxLat: 37.81, minLng: -122.47, maxLng: -122.38 };
    }
    const lats = garages.map((g) => g.lat);
    const lngs = garages.map((g) => g.lng);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [garages]);

  function project(lat: number, lng: number) {
    const { minLat, maxLat, minLng, maxLng } = bounds;
    const latSpan = maxLat - minLat || 1;
    const lngSpan = maxLng - minLng || 1;
    // Longitude → x, Latitude → y (inverted; north is up)
    const x = PAD + ((lng - minLng) / lngSpan) * (W - 2 * PAD);
    const y = PAD + ((maxLat - lat) / latSpan) * (H - 2 * PAD);
    return { x, y };
  }

  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 1; i < 8; i++) {
      const x = (W / 8) * i;
      lines.push({ x1: x, y1: 0, x2: x, y2: H });
      const y = (H / 8) * i;
      lines.push({ x1: 0, y1: y, x2: W, y2: y });
    }
    return lines;
  }, []);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Map of available garages"
    >
      {/* Land */}
      <rect x="0" y="0" width={W} height={H} fill="#eef1f4" />

      {/* Water accent (bay in corner) */}
      <path
        d={`M${W} ${H * 0.15} Q ${W * 0.78} ${H * 0.3}, ${W * 0.85} ${
          H * 0.55
        } T ${W * 0.92} ${H} L ${W} ${H} Z`}
        fill="#d6e8f2"
      />
      <path
        d={`M0 0 L ${W * 0.28} 0 Q ${W * 0.14} ${H * 0.12}, 0 ${H * 0.2} Z`}
        fill="#d6e8f2"
      />

      {/* Parks */}
      <rect
        x={W * 0.12}
        y={H * 0.62}
        width={W * 0.16}
        height={H * 0.14}
        rx="12"
        fill="#d8ead1"
      />
      <rect
        x={W * 0.55}
        y={H * 0.7}
        width={W * 0.12}
        height={H * 0.1}
        rx="10"
        fill="#d8ead1"
      />

      {/* Street grid */}
      {gridLines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="#ffffff"
          strokeWidth={i % 2 === 0 ? 6 : 3}
          strokeLinecap="round"
        />
      ))}

      {/* Diagonal boulevard for character */}
      <line
        x1={W * 0.05}
        y1={H * 0.95}
        x2={W * 0.8}
        y2={H * 0.1}
        stroke="#ffffff"
        strokeWidth={7}
        strokeLinecap="round"
      />

      {/* Garage markers */}
      {garages.map((g) => {
        const { x, y } = project(g.lat, g.lng);
        const isActive = g.id === activeId;
        const full = g.spotsAvailable <= 0;
        return (
          <g
            key={g.id}
            transform={`translate(${x}, ${y})`}
            className="cursor-pointer"
            onMouseEnter={() => onHover(g.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(g.slug)}
          >
            {isActive && (
              <circle r="26" fill={g.accent} opacity="0.18">
                <animate
                  attributeName="r"
                  values="18;28;18"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <g transform={isActive ? "scale(1.15)" : "scale(1)"}>
              <path
                d="M0 6 C -12 6 -18 -4 -18 -12 A 18 18 0 1 1 18 -12 C 18 -4 12 6 0 6 Z"
                transform="translate(0,-6)"
                fill={full ? "#98a2b3" : g.accent}
                stroke="#fff"
                strokeWidth="2.5"
              />
              <text
                x="0"
                y="-16"
                textAnchor="middle"
                fontSize="16"
                fontWeight="800"
                fill="#fff"
              >
                P
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
