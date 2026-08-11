import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OperatorTabs from "@/components/operator/OperatorTabs";
import ListedToggle from "@/components/operator/ListedToggle";
import { getCurrentUser } from "@/lib/auth";
import { getOperatorData } from "@/lib/operator";
import { formatCredits } from "@/lib/format";
import { ArrowRightIcon, CoinIcon } from "@/components/icons";

export const metadata = { title: "My garages · SpotPass" };

export default async function OperatorGaragesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "OPERATOR") redirect("/dashboard");

  const { garages } = await getOperatorData(user.id);

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              My garages
            </h1>
            <p className="mt-1 text-ink-500">
              {garages.length} {garages.length === 1 ? "garage" : "garages"} in
              your network.
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

        <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
          {/* Header row (desktop) */}
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-ink-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-400 md:grid">
            <span>Garage</span>
            <span>Rate</span>
            <span>Occupancy</span>
            <span>Earned</span>
            <span className="text-right">Listed</span>
          </div>

          {garages.length === 0 ? (
            <div className="grid place-items-center p-12 text-center">
              <p className="font-semibold text-ink-700">No garages yet</p>
              <p className="mt-1 text-sm text-ink-500">
                Add your first garage to start taking bookings.
              </p>
              <Link href="/operator/garages/new" className="btn-primary mt-4">
                Add a garage
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-ink-100">
              {garages.map((g) => (
                <div
                  key={g.id}
                  className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center md:gap-4"
                >
                  <Link
                    href={`/operator/garages/${g.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <span
                      className="h-10 w-10 shrink-0 rounded-lg"
                      style={{ background: g.accent }}
                    />
                    <div>
                      <p className="font-semibold text-ink-800 group-hover:text-brand-700">
                        {g.name}
                      </p>
                      <p className="text-xs text-ink-400">{g.neighborhood}</p>
                    </div>
                  </Link>

                  <div className="text-sm text-ink-700">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <CoinIcon className="h-4 w-4 text-brand-600" />
                      {g.creditsPerHour}
                    </span>
                    <span className="text-ink-400"> / hr</span>
                  </div>

                  <div className="text-sm">
                    <span className="font-semibold text-ink-800">
                      {g.occupancyPct}%
                    </span>
                    <span className="text-ink-400">
                      {" "}
                      · {g.occupied}/{g.capacity}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-brand-700">
                    {formatCredits(g.revenue)} cr
                  </div>

                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <span className="text-xs text-ink-400 md:hidden">
                      {g.listed ? "Listed" : "Unlisted"}
                    </span>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/operator/garages/${g.id}/edit`}
                        className="text-sm font-semibold text-ink-500 hover:text-ink-800"
                      >
                        Edit
                      </Link>
                      <ListedToggle garageId={g.id} listed={g.listed} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
