"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ListedToggle({
  garageId,
  listed,
}: {
  garageId: string;
  listed: boolean;
}) {
  const router = useRouter();
  const [on, setOn] = useState(listed);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !on;
    setLoading(true);
    setOn(next); // optimistic
    try {
      const res = await fetch(`/api/operator/garages/${garageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listed: next }),
      });
      if (!res.ok) {
        setOn(!next); // revert
      } else {
        router.refresh();
      }
    } catch {
      setOn(!next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        on ? "bg-brand-600" : "bg-ink-300"
      } disabled:opacity-60`}
      role="switch"
      aria-checked={on}
      aria-label={on ? "Listed" : "Unlisted"}
      title={on ? "Listed — click to unlist" : "Unlisted — click to list"}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
