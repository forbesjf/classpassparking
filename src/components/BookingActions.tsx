"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Action = "cancel" | "checkin" | "complete";

export default function BookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: Action) {
    if (action === "cancel" && !confirm("Cancel this booking and refund credits?"))
      return;
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Action failed");
        setLoading(null);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        {status === "CONFIRMED" && (
          <>
            <button
              onClick={() => run("checkin")}
              className="btn-primary px-3 py-2 text-xs"
              disabled={loading !== null}
            >
              {loading === "checkin" ? "…" : "Check in"}
            </button>
            <button
              onClick={() => run("cancel")}
              className="btn-secondary px-3 py-2 text-xs"
              disabled={loading !== null}
            >
              {loading === "cancel" ? "…" : "Cancel"}
            </button>
          </>
        )}
        {status === "ACTIVE" && (
          <button
            onClick={() => run("complete")}
            className="btn-primary px-3 py-2 text-xs"
            disabled={loading !== null}
          >
            {loading === "complete" ? "…" : "Check out"}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
