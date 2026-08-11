import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingActions from "@/components/BookingActions";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  formatCredits,
  formatDateTime,
  statusLabel,
} from "@/lib/format";
import {
  CoinIcon,
  CarIcon,
  PinIcon,
  CheckIcon,
  CalendarIcon,
  ArrowRightIcon,
} from "@/components/icons";

const statusStyles: Record<string, string> = {
  CONFIRMED: "bg-brand-50 text-brand-700",
  ACTIVE: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-ink-100 text-ink-500",
  CANCELLED: "bg-red-50 text-red-500",
};

export const metadata = { title: "Dashboard · SpotPass" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { booked?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [bookings, plan, transactions] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: user.id },
      include: { garage: true },
      orderBy: { startTime: "desc" },
    }),
    prisma.plan.findUnique({ where: { key: user.planKey } }),
    prisma.creditTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const upcoming = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "ACTIVE"
  );
  const past = bookings.filter(
    (b) => b.status === "COMPLETED" || b.status === "CANCELLED"
  );
  const totalSpent = transactions.length
    ? await prisma.creditTransaction.aggregate({
        where: { userId: user.id, type: "BOOKING" },
        _sum: { amount: true },
      })
    : { _sum: { amount: 0 } };
  const spent = Math.abs(totalSpent._sum.amount ?? 0);

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Hi, {user.name.split(" ")[0]} 👋
            </h1>
            <p className="mt-1 text-ink-500">Here's your parking at a glance.</p>
          </div>
          <Link href="/explore" className="btn-primary">
            Book parking
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {searchParams.booked && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-brand-800">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-white">
              <CheckIcon className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold">
              Booking confirmed! Your spot is reserved — see it below.
            </p>
          </div>
        )}

        {/* Stat cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-ink-500">
              <CoinIcon className="h-5 w-5 text-brand-600" />
              <span className="text-sm font-medium">Credit balance</span>
            </div>
            <p className="mt-2 text-3xl font-extrabold">
              {formatCredits(user.credits)}
            </p>
            <Link
              href="/membership"
              className="mt-1 inline-block text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Add credits →
            </Link>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-ink-500">
              <CalendarIcon className="h-5 w-5 text-brand-600" />
              <span className="text-sm font-medium">Current plan</span>
            </div>
            <p className="mt-2 text-3xl font-extrabold">{plan?.name ?? "—"}</p>
            <Link
              href="/membership"
              className="mt-1 inline-block text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Manage plan →
            </Link>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-ink-500">
              <CarIcon className="h-5 w-5 text-brand-600" />
              <span className="text-sm font-medium">Credits spent parking</span>
            </div>
            <p className="mt-2 text-3xl font-extrabold">
              {formatCredits(spent)}
            </p>
            <p className="mt-1 text-sm text-ink-400">
              {bookings.length} total bookings
            </p>
          </div>
        </div>

        {/* Upcoming */}
        <section className="mt-10">
          <h2 className="text-lg font-bold">Upcoming & active</h2>
          {upcoming.length === 0 ? (
            <div className="card mt-3 grid place-items-center p-10 text-center">
              <p className="font-semibold text-ink-700">No upcoming bookings</p>
              <p className="mt-1 text-sm text-ink-500">
                Find a garage and reserve your next spot.
              </p>
              <Link href="/explore" className="btn-primary mt-4">
                Explore garages
              </Link>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {upcoming.map((b) => (
                <div
                  key={b.id}
                  className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
                      style={{ background: b.garage.accent }}
                    >
                      <CarIcon className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/garage/${b.garage.slug}`}
                          className="font-bold hover:text-brand-700"
                        >
                          {b.garage.name}
                        </Link>
                        <span
                          className={`pill ${statusStyles[b.status]}`}
                        >
                          {statusLabel(b.status)}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
                        <PinIcon className="h-4 w-4" />
                        {b.garage.neighborhood}
                      </p>
                      <p className="mt-1 text-sm text-ink-600">
                        {formatDateTime(b.startTime)} · {b.hours}h ·{" "}
                        <span className="font-semibold text-ink-800">
                          {b.creditsCost} credits
                        </span>
                        {b.vehiclePlate && (
                          <span className="ml-1 text-ink-400">
                            · {b.vehiclePlate}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <BookingActions bookingId={b.id} status={b.status} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* History + activity */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section>
            <h2 className="text-lg font-bold">Booking history</h2>
            {past.length === 0 ? (
              <p className="card mt-3 p-6 text-sm text-ink-500">
                Your completed and cancelled bookings will show up here.
              </p>
            ) : (
              <div className="card mt-3 divide-y divide-ink-100">
                {past.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 p-4"
                  >
                    <div>
                      <p className="font-semibold text-ink-800">
                        {b.garage.name}
                      </p>
                      <p className="text-sm text-ink-500">
                        {formatDateTime(b.startTime)} · {b.hours}h
                      </p>
                    </div>
                    <span className={`pill ${statusStyles[b.status]}`}>
                      {statusLabel(b.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold">Credit activity</h2>
            <div className="card mt-3 divide-y divide-ink-100">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-ink-800">
                      {t.description}
                    </p>
                    <p className="text-xs text-ink-400">
                      {formatDateTime(t.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-bold ${
                      t.amount >= 0 ? "text-brand-700" : "text-ink-500"
                    }`}
                  >
                    {t.amount >= 0 ? "+" : ""}
                    {t.amount}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
