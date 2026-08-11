"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CREDIT_PACKS, centsPerCredit, getCreditPack } from "@/lib/credits";
import { formatPrice, formatCredits } from "@/lib/format";
import { CoinIcon, CheckIcon, ShieldIcon } from "./icons";

export default function CreditPurchase({
  currentCredits,
}: {
  currentCredits: number;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("value");
  const [name, setName] = useState("");
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [exp, setExp] = useState("12 / 30");
  const [cvc, setCvc] = useState("123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pack = getCreditPack(selected)!;

  async function purchase(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Only the pack id is sent — the demo card details never leave the browser.
      const res = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: pack.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Purchase failed");
        setLoading(false);
        return;
      }
      router.push(`/dashboard?purchased=${pack.credits}`);
      router.refresh();
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      {/* Pack picker */}
      <div>
        <div className="grid gap-4 sm:grid-cols-2">
          {CREDIT_PACKS.map((p) => {
            const active = p.id === selected;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                className={`relative rounded-2xl border p-5 text-left transition ${
                  active
                    ? "border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/30"
                    : "border-ink-200 bg-white hover:border-ink-300"
                }`}
              >
                {p.badge && (
                  <span
                    className={`pill absolute right-3 top-3 ${
                      p.highlight
                        ? "bg-brand-600 text-white"
                        : "bg-ink-900 text-white"
                    }`}
                  >
                    {p.badge}
                  </span>
                )}
                <div className="flex items-center gap-2 text-brand-700">
                  <CoinIcon className="h-6 w-6" />
                  <span className="text-2xl font-extrabold text-ink-900">
                    {formatCredits(p.credits)}
                  </span>
                  <span className="text-sm font-medium text-ink-400">
                    credits
                  </span>
                </div>
                <p className="mt-2 text-lg font-bold">
                  {formatPrice(p.priceCents)}
                </p>
                <p className="text-xs text-ink-400">{centsPerCredit(p)}</p>
                <p className="mt-2 text-sm text-ink-500">{p.label}</p>
                <span
                  className={`mt-3 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                    active
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-ink-300 text-transparent"
                  }`}
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-ink-100 px-4 py-3 text-sm text-ink-500">
          <CoinIcon className="h-4 w-4 text-brand-600" />
          Current balance:{" "}
          <span className="font-semibold text-ink-800">
            {formatCredits(currentCredits)} credits
          </span>
        </div>
      </div>

      {/* Checkout */}
      <form onSubmit={purchase} className="card h-fit p-6 lg:sticky lg:top-20">
        <h2 className="text-lg font-bold">Checkout</h2>

        <div className="mt-4 space-y-2 rounded-xl bg-ink-50 p-4 text-sm">
          <div className="flex justify-between text-ink-600">
            <span>{formatCredits(pack.credits)} credits</span>
            <span className="font-semibold text-ink-900">
              {formatPrice(pack.priceCents)}
            </span>
          </div>
          <div className="flex justify-between text-ink-600">
            <span>New balance</span>
            <span className="font-semibold text-brand-700">
              {formatCredits(currentCredits + pack.credits)} credits
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="cardname">
              Name on card
            </label>
            <input
              id="cardname"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Driver"
            />
          </div>
          <div>
            <label className="label" htmlFor="cardnum">
              Card number
            </label>
            <input
              id="cardnum"
              className="input tracking-widest"
              value={card}
              onChange={(e) => setCard(e.target.value)}
              inputMode="numeric"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="exp">
                Expiry
              </label>
              <input
                id="exp"
                className="input"
                value={exp}
                onChange={(e) => setExp(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="cvc">
                CVC
              </label>
              <input
                id="cvc"
                className="input"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary mt-5 w-full" disabled={loading}>
          {loading
            ? "Processing…"
            : `Pay ${formatPrice(pack.priceCents)} · get ${formatCredits(
                pack.credits
              )} credits`}
        </button>

        <p className="mt-3 flex items-start gap-2 text-xs text-ink-400">
          <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0" />
          Demo checkout — no real payment is processed and card details are
          never sent or stored. Credits are added instantly to your account.
        </p>
      </form>
    </div>
  );
}
