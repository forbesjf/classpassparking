import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListedToggle from "@/components/operator/ListedToggle";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCredits, formatDateTime, statusLabel } from "@/lib/format";
import { CoinIcon, CarIcon, ClockIcon, PinIcon } from "@/components/icons";

const statusStyles: Record<string, string> = {
  CONFIRMED: "bg-brand-50 text-brand-700",
  ACTIVE: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-ink-100 text-ink-500",
  CANCELLED: "bg-red-50 text-red-500",
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const garage = await prisma.garage.findUnique({ where: { id: params.id } });
  return { title: garage ? `${garage.name} · Operator` : "Garage · Operator" };
}

export default async function OperatorGarageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "OPERATOR") redirect("/dashboard");

  const garage = await prisma.garage.findUnique({
    where: { id: params.id },
    include: {
      bookings: {
        include: { user: { select: { name: true } } },
        orderBy: { startTime: "desc" },
      },
    },
  });
  if (!garage || garage.ownerId !== user.id) notFound();

  const occupied = Math.max(0, garage.capacity - garage.spotsAvailable);
  const occupancyPct =
    garage.capacity > 0 ? Math.round((occupied / garage.capacity) * 100) : 0;
  const active = garage.bookings.filter((b) => b.status === "ACTIVE").length;
  const upcoming = garage.bookings.filter((b) => b.status === "CONFIRMED").length;
  const revenue = garage.bookings
    .filter((b) => b.status === "ACTIVE" || b.status === "COMPLETED")
    .reduce((s, b) => s + b.creditsCost, 0);

  const stats = [
    { icon: CarIcon, label: "Occupancy", value: `${occupancyPct}%`, sub: `${occupied}/${garage.capacity}` },
    { icon: ClockIcon, label: "Active", value: `${active}`, sub: `${upcoming} upcoming` },
    { icon: CoinIcon, label: "Earned", value: formatCredits(revenue), sub: "credits" },
    { icon: CoinIcon, label: "Rate", value: `${garage.creditsPerHour}`, sub: "cr / hour" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/operator/garages"
          className="text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          ← Back to my garages
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="h-12 w-12 shrink-0 rounded-xl"
              style={{ background: garage.accent }}
            />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                {garage.name}
                {!garage.listed && (
                  <span className="ml-2 align-middle pill bg-ink-100 text-ink-500">
                    Unlisted
                  </span>
                )}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
                <PinIcon className="h-4 w-4" />
                {garage.address}, {garage.neighborhood}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2">
              <span className="text-sm font-medium text-ink-600">Listed</span>
              <ListedToggle garageId={garage.id} listed={garage.listed} />
            </div>
            <Link
              href={`/operator/garages/${garage.id}/edit`}
              className="btn-primary"
            >
              Edit garage
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center gap-2 text-ink-500">
                <s.icon className="h-5 w-5 text-brand-600" />
                <span className="text-sm font-medium">{s.label}</span>
              </div>
              <p className="mt-2 text-3xl font-extrabold">{s.value}</p>
              <p className="mt-1 text-sm text-ink-400">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <section className="mt-8">
          <h2 className="text-lg font-bold">
            Bookings{" "}
            <span className="font-medium text-ink-400">
              ({garage.bookings.length})
            </span>
          </h2>
          {garage.bookings.length === 0 ? (
            <p className="card mt-3 p-6 text-sm text-ink-500">
              No bookings yet for this garage.
            </p>
          ) : (
            <div className="mt-3 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
              <div className="hidden grid-cols-[1.4fr_1.4fr_0.8fr_0.8fr_auto] gap-4 border-b border-ink-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-400 sm:grid">
                <span>Driver</span>
                <span>When</span>
                <span>Duration</span>
                <span>Earned</span>
                <span className="text-right">Status</span>
              </div>
              <div className="divide-y divide-ink-100">
                {garage.bookings.map((b) => (
                  <div
                    key={b.id}
                    className="grid grid-cols-2 gap-2 px-5 py-3.5 text-sm sm:grid-cols-[1.4fr_1.4fr_0.8fr_0.8fr_auto] sm:items-center sm:gap-4"
                  >
                    <div className="font-semibold text-ink-800">
                      {b.user.name}
                      {b.vehiclePlate && (
                        <span className="ml-1 font-normal text-ink-400">
                          · {b.vehiclePlate}
                        </span>
                      )}
                    </div>
                    <div className="text-ink-600">
                      {formatDateTime(b.startTime)}
                    </div>
                    <div className="text-ink-600">{b.hours}h</div>
                    <div className="font-semibold text-brand-700">
                      +{b.creditsCost}
                    </div>
                    <div className="sm:text-right">
                      <span className={`pill ${statusStyles[b.status]}`}>
                        {statusLabel(b.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
