"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GarageDTO } from "@/lib/garages";
import { distanceMiles } from "@/lib/format";
import GarageCard from "./GarageCard";
import CityMap from "./CityMap";
import { SearchIcon } from "./icons";

// Downtown reference point used for the "nearby / distance" calculations.
const CITY_CENTER = { lat: 37.7879, lng: -122.4074 };

const SORTS = [
  { key: "recommended", label: "Recommended" },
  { key: "price", label: "Lowest price" },
  { key: "availability", label: "Most available" },
  { key: "distance", label: "Nearest" },
] as const;

const FILTERS = [
  "EV Charging",
  "Covered",
  "24/7 Access",
  "Open Air",
  "Security",
];

type SortKey = (typeof SORTS)[number]["key"];

export default function ExploreClient({ garages }: { garages: GarageDTO[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recommended");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  function toggleFilter(f: string) {
    setActiveFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = garages.filter((g) => {
      const matchesQuery =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.neighborhood.toLowerCase().includes(q) ||
        g.address.toLowerCase().includes(q);
      const matchesFilters = activeFilters.every((f) =>
        g.amenities.some((a) => a.toLowerCase() === f.toLowerCase())
      );
      return matchesQuery && matchesFilters;
    });

    const withDistance = list.map((g) => ({
      ...g,
      _distance: distanceMiles(
        CITY_CENTER.lat,
        CITY_CENTER.lng,
        g.lat,
        g.lng
      ),
    }));

    withDistance.sort((a, b) => {
      switch (sort) {
        case "price":
          return a.creditsPerHour - b.creditsPerHour;
        case "availability":
          return b.spotsAvailable - a.spotsAvailable;
        case "distance":
          return a._distance - b._distance;
        default:
          return b.rating - a.rating;
      }
    });
    return withDistance;
  }, [garages, query, sort, activeFilters]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      {/* Search + filters */}
      <div className="sticky top-16 z-30 -mx-4 border-b border-ink-100 bg-ink-50/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-b-2xl sm:px-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by garage, neighborhood, or address…"
              className="input pl-11"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-ink-500">Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="input w-auto"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => {
            const on = activeFilters.includes(f);
            return (
              <button
                key={f}
                onClick={() => toggleFilter(f)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  on
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 bg-white text-ink-600 hover:border-ink-300"
                }`}
              >
                {f}
              </button>
            );
          })}
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="text-sm font-medium text-ink-500 underline underline-offset-2 hover:text-ink-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Mobile toggle */}
      <div className="mt-4 flex gap-1 rounded-xl bg-white p-1 shadow-card lg:hidden">
        {(["list", "map"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setMobileView(v)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${
              mobileView === v ? "bg-brand-600 text-white" : "text-ink-600"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.05fr]">
        {/* List */}
        <div className={mobileView === "map" ? "hidden lg:block" : ""}>
          <p className="mb-3 text-sm text-ink-500">
            <span className="font-semibold text-ink-800">
              {results.length}
            </span>{" "}
            {results.length === 1 ? "garage" : "garages"} available
          </p>
          {results.length === 0 ? (
            <div className="card grid place-items-center p-12 text-center">
              <p className="font-semibold text-ink-700">No garages match</p>
              <p className="mt-1 text-sm text-ink-500">
                Try removing a filter or searching a different area.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((g) => (
                <GarageCard
                  key={g.id}
                  garage={g}
                  distanceMi={g._distance}
                  active={g.id === activeId}
                  onMouseEnter={() => setActiveId(g.id)}
                  onMouseLeave={() => setActiveId(null)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div
          className={`${
            mobileView === "list" ? "hidden lg:block" : ""
          } lg:sticky lg:top-56 lg:self-start`}
        >
          <div className="h-[520px] overflow-hidden rounded-2xl border border-ink-100 shadow-card lg:h-[calc(100vh-15rem)]">
            <CityMap
              garages={results}
              activeId={activeId}
              onHover={setActiveId}
              onSelect={(slug) => router.push(`/garage/${slug}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
