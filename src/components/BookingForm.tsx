"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { GarageDTO } from "@/lib/garages";
import { CoinIcon, ClockIcon, CheckIcon } from "./icons";

function defaultStart(): string {
  // Next full hour, formatted for a datetime-local input in local time.
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BookingForm({
  garage,
  userCredits,
}: {
  garage: GarageDTO;
  userCredits: number;
}) {
  const router = useRouter();
  const [start, setStart] = useState(defaultStart());
  const [hours, setHours] = useState(2);
  const [plate, setPlate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cost = garage.creditsPerHour * hours;
  const afterBalance = userCredits - cost;
  const canAfford = afterBalance >= 0;
  const isFull = garage.spotsAvailable <= 0;

  const endLabel = useMemo(() => {
    if (!start) return "";
    const d = new Date(start);
    if (Number.isNaN(d.getTime())) return "";
    d.setHours(d.getHours() + hours);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }, [start, hours]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const startIso = new Date(start).toISOString();
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garageId: garage.id,
          startTime: startIso,
          hours,
          vehiclePlate: plate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not complete booking");
        setLoading(false);
        return;
      }
      router.push(`/dashboard?booked=1`);
      router.refresh();
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-bold">Reserve a spot</h3>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          <CoinIcon className="h-4 w-4" />
          {garage.creditsPerHour} / hr
        </span>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="label" htmlFor="start">
            Arrival
          </label>
          <input
            id="start"
            type="datetime-local"
            className="input"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Duration</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-ink-200 bg-white">
              <button
                type="button"
                onClick={() => setHours((h) => Math.max(1, h - 1))}
                className="grid h-10 w-10 place-items-center text-lg font-bold text-ink-500 hover:text-ink-900"
                aria-label="Decrease hours"
              >
                −
              </button>
              <span className="w-16 text-center text-sm font-semibold">
                {hours} {hours === 1 ? "hour" : "hours"}
              </span>
              <button
                type="button"
                onClick={() => setHours((h) => Math.min(24, h + 1))}
                className="grid h-10 w-10 place-items-center text-lg font-bold text-ink-500 hover:text-ink-900"
                aria-label="Increase hours"
              >
                +
              </button>
            </div>
            {endLabel && (
              <span className="inline-flex items-center gap-1 text-sm text-ink-500">
                <ClockIcon className="h-4 w-4" />
                until {endLabel}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="plate">
            License plate{" "}
            <span className="font-normal text-ink-400">(optional)</span>
          </label>
          <input
            id="plate"
            className="input uppercase"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="7ABC123"
            maxLength={12}
          />
        </div>
      </div>

      <div className="mt-5 space-y-1.5 rounded-xl bg-ink-50 p-4 text-sm">
        <div className="flex justify-between text-ink-600">
          <span>
            {garage.creditsPerHour} credits × {hours}h
          </span>
          <span className="font-semibold text-ink-900">{cost} credits</span>
        </div>
        <div className="flex justify-between text-ink-600">
          <span>Balance after booking</span>
          <span
            className={`font-semibold ${
              canAfford ? "text-brand-700" : "text-red-600"
            }`}
          >
            {afterBalance} credits
          </span>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isFull ? (
        <p className="mt-4 rounded-xl bg-ink-100 px-4 py-3 text-center text-sm font-semibold text-ink-500">
          This garage is currently full
        </p>
      ) : canAfford ? (
        <button
          type="submit"
          className="btn-primary mt-4 w-full"
          disabled={loading}
        >
          {loading ? (
            "Booking…"
          ) : (
            <>
              <CheckIcon className="h-4 w-4" />
              Confirm booking · {cost} credits
            </>
          )}
        </button>
      ) : (
        <div className="mt-4">
          <p className="mb-2 text-center text-sm text-red-600">
            You need {cost - userCredits} more credits for this booking.
          </p>
          <Link href="/credits" className="btn-secondary w-full">
            Buy more credits
          </Link>
        </div>
      )}
    </form>
  );
}
