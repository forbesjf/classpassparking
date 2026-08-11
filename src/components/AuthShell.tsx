import Link from "next/link";
import { ParkingIcon, CheckIcon } from "./icons";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const bullets = [
    "40 free credits when you join",
    "Book at 12+ garages across the city",
    "Cancel anytime — no lock-in",
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-b from-brand-900 to-ink-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_25%_15%,#fff_1px,transparent_1px)] [background-size:22px_22px]" />
        <Link href="/" className="relative flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
            <ParkingIcon className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold">
            Spot<span className="text-brand-300">Pass</span>
          </span>
        </Link>
        <div className="relative">
          <h2 className="max-w-sm text-3xl font-extrabold leading-tight">
            The membership that gets you parked in seconds.
          </h2>
          <ul className="mt-8 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-3 text-ink-100">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500/30 text-brand-200">
                  <CheckIcon className="h-4 w-4" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-ink-300">
          Demo account: demo@spotpass.app · password123
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-ink-50 px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 flex items-center gap-2 lg:hidden"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
              <ParkingIcon className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold">
              Spot<span className="text-brand-600">Pass</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-1 text-ink-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
