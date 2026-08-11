import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OperatorTabs from "@/components/operator/OperatorTabs";
import { getCurrentUser } from "@/lib/auth";
import { getOperatorData } from "@/lib/operator";
import { formatCredits, formatDateTime, statusLabel } from "@/lib/format";
import {
  CoinIcon,
  CarIcon,
  ParkingIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@/components/icons";

export const metadata = { title: "Operator · SpotPass" };

const statusStyles: Record<string, string> = {
  CONFIRMED: "bg-brand-50 text-brand-700",
  ACTIVE: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-ink-100 text-ink-500",
  CANCELLED: "bg-red-50 text-red-500",
};

function occupancyColor(pct: number) {
  if (pct >= 85) return "bg-red-500";
  if (pct >= 60) return "bg-amber-500";
  return "bg-brand-500";
}

export default async function OperatorOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "OPERATOR") redirect("/dashboard");

  const { garages, totals, recentBookings } = await getOperatorData(user.id);

  const stats = [
    {
      icon: ParkingIcon,
      label: "Garages",
      value: `${totals.listedCount}/${totals.garageCount}`,
      sub: "listed / total",
    },
    {
      icon: CarIcon,
      label: "Occupancy now",
      value: `${totals.occupancyPct}%`,
      sub: `${totals.totalOccupied} of ${totals.totalCapacity} spaces`,
    },
    {
      icon: ClockIcon,
      label: "Active sessions",
      value: `${totals.activeSessions}`,
      sub: `${totals.upcomingCount} upcoming`,
    },
    {
      icon: CoinIcon,
      label: "Credits earned",
      value: formatCredits(totals.revenue),
      sub: "active + completed",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Operator console
            </h1>
            <p className="mt-1 text-ink-500">
              Welcome back, {user.name.split(" ")[0]}. Here&apos;s how your
              network is performing.
            </p>
          </div>
          <Link href="/operator/garages/new" className="btn-primary">
            Add a garage
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6">
          <OperatorTabs />
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-5">
              <div className="flex items-center gap-2 text-ink-500">
                <s.icon className="h-5 w-5 text-brand-600" />
                <span className="text-sm font-medium">{s.label}</span>
              </div>
              <p className="mt-2 text-3xl font-extrabold">{s.value}</p>
              <p className="mt-1 text-sm text-ink-400">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Occupancy by garage */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Occupancy by garage</h2>
              <Link
                href="/operator/garages"
                className="text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                Manage →
              </Link>
            </div>
            {garages.length === 0 ? (
              <div className="card mt-3 grid place-items-center p-10 text-center">
                <p className="font-semibold text-ink-700">No garages yet</p>
                <p className="mt-1 text-sm text-ink-500">
                  Add your first garage to start taking bookings.
                </p>
                <Link href="/operator/garages/new" className="btn-primary mt-4">
                  Add a garage
                </Link>
              </div>
            ) : (
              <div className="card mt-3 divide-y divide-ink-100">
                {garages.map((g) => (
                  <Link
                    key={g.id}
                    href={`/operator/garages/${g.id}`}
                    className="block p-4 transition hover:bg-ink-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-9 w-9 shrink-0 rounded-lg"
                          style={{ background: g.accent }}
                        />
                        <div>
                          <p className="font-semibold text-ink-800">
                            {g.name}
                            {!g.listed && (
                              <span className="ml-2 pill bg-ink-100 text-ink-500">
                                Unlisted
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-ink-400">
                            {g.neighborhood} · {g.creditsPerHour} cr/hr
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-ink-800">
                          {g.occupancyPct}%
                        </p>
                        <p className="text-xs text-ink-400">
                          {g.occupied}/{g.capacity}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink-100">
                      <div
                        className={`h-full rounded-full ${occupancyColor(
                          g.occupancyPct
                        )}`}
                        style={{ width: `${Math.min(100, g.occupancyPct)}%` }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Recent bookings */}
          <section>
            <h2 className="text-lg font-bold">Recent bookings</h2>
            {recentBookings.length === 0 ? (
              <p className="card mt-3 p-6 text-sm text-ink-500">
                Bookings at your garages will appear here.
              </p>
            ) : (
              <div className="card mt-3 divide-y divide-ink-100">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 p-4">
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white"
                      style={{ background: b.garageAccent }}
                    >
                      <CarIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-800">
                        {b.garageName}
                      </p>
                      <p className="truncate text-xs text-ink-400">
                        {b.driverName} · {formatDateTime(b.startTime)} · {b.hours}h
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-700">
                        +{b.creditsCost}
                      </p>
                      <span
                        className={`pill ${statusStyles[b.status]} mt-0.5`}
                      >
                        {statusLabel(b.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
