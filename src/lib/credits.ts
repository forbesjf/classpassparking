// Credit top-up packs. Prices drop per-credit as packs get larger.
// This is the single source of truth used by both the UI and the purchase API,
// so the server never trusts a client-supplied credit amount or price.

export type CreditPack = {
  id: string;
  credits: number;
  priceCents: number;
  label: string;
  badge?: string;
  highlight?: boolean;
};

export const CREDIT_PACKS: CreditPack[] = [
  { id: "starter", credits: 50, priceCents: 600, label: "Quick top-up" },
  { id: "standard", credits: 150, priceCents: 1500, label: "A week of commuting" },
  {
    id: "value",
    credits: 400,
    priceCents: 3600,
    label: "Best for regulars",
    badge: "Most popular",
    highlight: true,
  },
  {
    id: "bulk",
    credits: 1000,
    priceCents: 8000,
    label: "Stock up and save",
    badge: "Best value",
  },
];

export function getCreditPack(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}

// Effective price per credit, e.g. "8.0¢ / credit".
export function centsPerCredit(pack: CreditPack): string {
  return `${(pack.priceCents / pack.credits).toFixed(1)}¢ / credit`;
}
