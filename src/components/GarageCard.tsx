import Link from "next/link";
import type { GarageDTO } from "@/lib/garages";
import { StarIcon, PinIcon, CoinIcon, BoltIcon } from "./icons";

function availabilityTone(available: number, capacity: number) {
  const ratio = capacity > 0 ? available / capacity : 0;
  if (available <= 0)
    return { text: "Full", cls: "bg-ink-100 text-ink-500" };
  if (ratio < 0.08)
    return { text: `${available} left`, cls: "bg-amber-100 text-amber-700" };
  return { text: `${available} open`, cls: "bg-brand-50 text-brand-700" };
}

export default function GarageCard({
  garage,
  distanceMi,
  active = false,
  onMouseEnter,
  onMouseLeave,
}: {
  garage: GarageDTO;
  distanceMi?: number;
  active?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const avail = availabilityTone(garage.spotsAvailable, garage.capacity);
  const hasEv = garage.amenities.some((a) => a.toLowerCase().includes("ev"));

  return (
    <Link
      href={`/garage/${garage.slug}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group block overflow-hidden rounded-2xl border bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg ${
        active ? "border-brand-500 ring-2 ring-brand-500/30" : "border-ink-100"
      }`}
    >
      <div
        className="relative h-28 w-full"
        style={{
          background: `linear-gradient(135deg, ${garage.accent}, ${garage.accent}bb)`,
        }}
      >
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#fff_1px,transparent_1px)] [background-size:14px_14px]" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className={`pill ${avail.cls}`}>{avail.text}</span>
          {hasEv && (
            <span className="pill bg-white/90 text-brand-700">
              <BoltIcon className="h-3.5 w-3.5" /> EV
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-ink-800 backdrop-blur">
          <span className="inline-flex items-center gap-1">
            <CoinIcon className="h-3.5 w-3.5 text-brand-600" />
            {garage.creditsPerHour}
            <span className="font-medium text-ink-500">/hr</span>
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-tight text-ink-900 group-hover:text-brand-700">
            {garage.name}
          </h3>
          <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-ink-800">
            <StarIcon className="h-4 w-4 text-amber-400" />
            {garage.rating.toFixed(1)}
          </span>
        </div>

        <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
          <PinIcon className="h-4 w-4 shrink-0" />
          {garage.neighborhood}
          {typeof distanceMi === "number" && (
            <span className="text-ink-400">· {distanceMi.toFixed(1)} mi</span>
          )}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {garage.amenities.slice(0, 3).map((a) => (
            <span key={a} className="chip">
              {a}
            </span>
          ))}
          {garage.amenities.length > 3 && (
            <span className="chip">+{garage.amenities.length - 3}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
