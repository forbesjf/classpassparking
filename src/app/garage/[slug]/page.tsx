import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import { getGarageBySlug } from "@/lib/garages";
import { getCurrentUser } from "@/lib/auth";
import {
  StarIcon,
  PinIcon,
  ClockIcon,
  CarIcon,
  CheckIcon,
  CoinIcon,
} from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const garage = await getGarageBySlug(params.slug);
  return { title: garage ? `${garage.name} · SpotPass` : "Garage · SpotPass" };
}

function hoursLabel(open: number, close: number) {
  if (open === 0 && close === 24) return "Open 24 hours";
  const fmt = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hh = h % 12 === 0 ? 12 : h % 12;
    return `${hh} ${period}`;
  };
  return `${fmt(open)} – ${fmt(close === 24 ? 0 : close)}`;
}

export default async function GaragePage({
  params,
}: {
  params: { slug: string };
}) {
  const [garage, user] = await Promise.all([
    getGarageBySlug(params.slug),
    getCurrentUser(),
  ]);
  if (!garage) notFound();

  const full = garage.spotsAvailable <= 0;

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/explore"
          className="text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          ← Back to explore
        </Link>

        {/* Hero banner */}
        <div
          className="relative mt-4 h-48 overflow-hidden rounded-2xl sm:h-60"
          style={{
            background: `linear-gradient(135deg, ${garage.accent}, ${garage.accent}bb)`,
          }}
        >
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#fff_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`pill ${
                  full
                    ? "bg-black/30 text-white"
                    : "bg-white/90 text-brand-700"
                }`}
              >
                {full ? "Full" : `${garage.spotsAvailable} spots open`}
              </span>
              <span className="pill bg-white/90 text-ink-800">
                <StarIcon className="h-3.5 w-3.5 text-amber-400" />
                {garage.rating.toFixed(1)} ({garage.reviewCount})
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              {garage.name}
            </h1>
          </div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Details */}
          <div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-600">
              <span className="inline-flex items-center gap-1.5">
                <PinIcon className="h-4 w-4 text-brand-600" />
                {garage.address}, {garage.neighborhood}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4 text-brand-600" />
                {hoursLabel(garage.openHour, garage.closeHour)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CarIcon className="h-4 w-4 text-brand-600" />
                {garage.capacity} total spaces
              </span>
            </div>

            <p className="mt-5 leading-relaxed text-ink-700">
              {garage.description}
            </p>

            <h2 className="mt-8 text-lg font-bold">Amenities</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {garage.amenities.map((a) => (
                <div
                  key={a}
                  className="flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-700"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-50 text-brand-600">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  {a}
                </div>
              ))}
            </div>

            <h2 className="mt-8 text-lg font-bold">Pricing</h2>
            <div className="mt-3 card flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-ink-500">Rate</p>
                <p className="text-2xl font-extrabold">
                  {garage.creditsPerHour}{" "}
                  <span className="text-base font-semibold text-ink-500">
                    credits / hour
                  </span>
                </p>
              </div>
              <div className="text-right text-sm text-ink-500">
                <p className="inline-flex items-center gap-1">
                  <CoinIcon className="h-4 w-4 text-brand-600" />~
                  {garage.creditsPerHour * 8} credits full day
                </p>
                <p className="mt-1">No hidden fees · credits only</p>
              </div>
            </div>
          </div>

          {/* Booking column */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            {user ? (
              <BookingForm garage={garage} userCredits={user.credits} />
            ) : (
              <div className="card p-6 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <CoinIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-lg font-bold">Log in to book</h3>
                <p className="mt-1 text-sm text-ink-500">
                  Join free and get 40 credits to start parking at{" "}
                  {garage.name}.
                </p>
                <Link href="/register" className="btn-primary mt-4 w-full">
                  Join free
                </Link>
                <Link href="/login" className="btn-ghost mt-2 w-full">
                  I already have an account
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
