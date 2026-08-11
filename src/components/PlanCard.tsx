"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { CheckIcon } from "./icons";

export type PlanView = {
  key: string;
  name: string;
  monthlyCredits: number;
  priceCents: number;
  tagline: string;
  features: string[];
  highlight: boolean;
};

export default function PlanCard({
  plan,
  currentPlanKey,
  isLoggedIn,
}: {
  plan: PlanView;
  currentPlanKey: string | null;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCurrent = currentPlanKey === plan.key;

  async function choose() {
    if (!isLoggedIn) {
      router.push("/register");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey: plan.key }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not change plan");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div
      className={`card flex flex-col p-6 ${
        plan.highlight ? "ring-2 ring-brand-500" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{plan.name}</h3>
        {plan.highlight && (
          <span className="pill bg-brand-600 text-white">Popular</span>
        )}
      </div>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-4xl font-extrabold">
          {formatPrice(plan.priceCents)}
        </span>
        {plan.priceCents > 0 && (
          <span className="mb-1.5 text-sm text-ink-400">/month</span>
        )}
      </div>
      <p className="mt-1 text-sm font-semibold text-brand-700">
        {plan.monthlyCredits > 0
          ? `${plan.monthlyCredits} credits / month`
          : "Buy credits as you go"}
      </p>
      <p className="mt-3 text-sm text-ink-500">{plan.tagline}</p>

      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
              <CheckIcon className="h-3.5 w-3.5" />
            </span>
            {f}
          </li>
        ))}
      </ul>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={choose}
        disabled={loading || isCurrent}
        className={`mt-5 ${
          isCurrent
            ? "btn border border-ink-200 bg-ink-50 text-ink-400"
            : plan.highlight
              ? "btn-primary"
              : "btn-secondary"
        }`}
      >
        {isCurrent
          ? "Current plan"
          : loading
            ? "Updating…"
            : isLoggedIn
              ? `Switch to ${plan.name}`
              : `Get ${plan.name}`}
      </button>
    </div>
  );
}
