"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AMENITY_OPTIONS = [
  "EV Charging",
  "Covered",
  "Open Air",
  "24/7 Access",
  "Security",
  "Elevator",
  "Bike Valet",
  "Car Wash",
];

const ACCENT_OPTIONS = [
  "#17b478",
  "#0a9160",
  "#3fce8f",
  "#0a7450",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
];

export type GarageFormValues = {
  id?: string;
  name: string;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  creditsPerHour: number;
  capacity: number;
  description: string;
  amenities: string[];
  openHour: number;
  closeHour: number;
  accent: string;
  listed: boolean;
};

const EMPTY: GarageFormValues = {
  name: "",
  address: "",
  neighborhood: "",
  lat: 37.7749,
  lng: -122.4194,
  creditsPerHour: 8,
  capacity: 100,
  description: "",
  amenities: [],
  openHour: 0,
  closeHour: 24,
  accent: "#17b478",
  listed: true,
};

export default function GarageForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: GarageFormValues;
}) {
  const router = useRouter();
  const [v, setV] = useState<GarageFormValues>(initial ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof GarageFormValues>(key: K, val: GarageFormValues[K]) {
    setV((prev) => ({ ...prev, [key]: val }));
  }

  function toggleAmenity(a: string) {
    setV((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name: v.name,
      address: v.address,
      neighborhood: v.neighborhood,
      lat: Number(v.lat),
      lng: Number(v.lng),
      creditsPerHour: Number(v.creditsPerHour),
      capacity: Number(v.capacity),
      description: v.description,
      amenities: v.amenities,
      openHour: Number(v.openHour),
      closeHour: Number(v.closeHour),
      accent: v.accent,
      listed: v.listed,
    };

    const url =
      mode === "create"
        ? "/api/operator/garages"
        : `/api/operator/garages/${v.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save garage");
        setLoading(false);
        return;
      }
      router.push("/operator/garages");
      router.refresh();
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-bold">Basics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="name">
              Garage name
            </label>
            <input
              id="name"
              className="input"
              value={v.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Downtown Central Garage"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="address">
              Address
            </label>
            <input
              id="address"
              className="input"
              value={v.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 Market St"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="neighborhood">
              Neighborhood
            </label>
            <input
              id="neighborhood"
              className="input"
              value={v.neighborhood}
              onChange={(e) => set("neighborhood", e.target.value)}
              placeholder="Financial District"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="input min-h-[90px]"
              value={v.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Tell drivers what makes this garage convenient…"
              required
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold">Capacity & pricing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="capacity">
              Total capacity (spaces)
            </label>
            <input
              id="capacity"
              type="number"
              min={1}
              className="input"
              value={v.capacity}
              onChange={(e) => set("capacity", Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="rate">
              Rate (credits / hour)
            </label>
            <input
              id="rate"
              type="number"
              min={1}
              className="input"
              value={v.creditsPerHour}
              onChange={(e) => set("creditsPerHour", Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="open">
              Opens (hour, 0–24)
            </label>
            <input
              id="open"
              type="number"
              min={0}
              max={24}
              className="input"
              value={v.openHour}
              onChange={(e) => set("openHour", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label" htmlFor="close">
              Closes (hour, 0–24)
            </label>
            <input
              id="close"
              type="number"
              min={0}
              max={24}
              className="input"
              value={v.closeHour}
              onChange={(e) => set("closeHour", Number(e.target.value))}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-400">
          Set opens 0 and closes 24 for a garage that never closes.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold">Location</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="lat">
              Latitude
            </label>
            <input
              id="lat"
              type="number"
              step="0.0001"
              className="input"
              value={v.lat}
              onChange={(e) => set("lat", Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="lng">
              Longitude
            </label>
            <input
              id="lng"
              type="number"
              step="0.0001"
              className="input"
              value={v.lng}
              onChange={(e) => set("lng", Number(e.target.value))}
              required
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-400">
          Coordinates position the garage pin on the explore map.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold">Amenities</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => {
            const on = v.amenities.includes(a);
            return (
              <button
                type="button"
                key={a}
                onClick={() => toggleAmenity(a)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  on
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 bg-white text-ink-600 hover:border-ink-300"
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>

        <h2 className="mt-6 text-lg font-bold">Card color</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACCENT_OPTIONS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => set("accent", c)}
              className={`h-9 w-9 rounded-full ring-2 ring-offset-2 transition ${
                v.accent === c ? "ring-ink-900" : "ring-transparent"
              }`}
              style={{ background: c }}
              aria-label={`Accent ${c}`}
            />
          ))}
        </div>

        <label className="mt-6 flex items-center gap-3">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            checked={v.listed}
            onChange={(e) => set("listed", e.target.checked)}
          />
          <span className="text-sm font-medium text-ink-700">
            Listed — visible and bookable on the explore map
          </span>
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading
            ? "Saving…"
            : mode === "create"
              ? "Add garage"
              : "Save changes"}
        </button>
        <Link href="/operator/garages" className="btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
