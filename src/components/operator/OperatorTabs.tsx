"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/operator", label: "Overview" },
  { href: "/operator/garages", label: "My garages" },
];

export default function OperatorTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 border-b border-ink-100">
      {tabs.map((t) => {
        const active =
          t.href === "/operator"
            ? pathname === "/operator"
            : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-ink-500 hover:text-ink-800"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
