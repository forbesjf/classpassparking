import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GarageCard from "@/components/GarageCard";
import { getFeaturedGarages } from "@/lib/garages";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import {
  SearchIcon,
  CoinIcon,
  CarIcon,
  ShieldIcon,
  BoltIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@/components/icons";

export default async function HomePage() {
  const [featured, plans, garageCount] = await Promise.all([
    getFeaturedGarages(3),
    prisma.plan.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.garage.count(),
  ]);

  const steps = [
    {
      icon: CoinIcon,
      title: "Pick a plan",
      body: "Choose a monthly credit bundle that fits how much you drive. Credits are your currency across the whole network.",
    },
    {
      icon: SearchIcon,
      title: "Find a spot",
      body: "Browse garages near your destination on the map. See live availability and the credit cost per hour before you go.",
    },
    {
      icon: CarIcon,
      title: "Book & park",
      body: "Reserve in a tap, pull in, and check in from the app. Credits are deducted automatically — no meters, no cash.",
    },
  ];

  const perks = [
    { icon: BoltIcon, label: "EV charging at select garages" },
    { icon: ShieldIcon, label: "Secured, well-lit facilities" },
    { icon: ClockIcon, label: "Free cancellation up to 1 hr before" },
    { icon: CheckIcon, label: "One membership, every partner lot" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 to-ink-900 text-white">
        <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_25%_15%,#fff_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-200">
            <CoinIcon className="h-4 w-4" /> Parking, on subscription
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            One membership.{" "}
            <span className="text-brand-300">Every garage</span> in the city.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-200">
            SpotPass is like ClassPass, but for parking. Get monthly credits and
            book a guaranteed spot at {garageCount}+ partner garages — no
            per-lot apps, no meters, no circling the block.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary px-5 py-3 text-base">
              Start parking free
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/explore"
              className="btn px-5 py-3 text-base border border-white/25 bg-white/5 text-white hover:bg-white/10"
            >
              <SearchIcon className="h-4 w-4" />
              Explore garages
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-300">
            Try the demo:{" "}
            <span className="font-semibold text-white">demo@spotpass.app</span> ·{" "}
            <span className="font-semibold text-white">password123</span>
          </p>

          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
            {perks.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-2 text-sm text-ink-200"
              >
                <p.icon className="h-5 w-5 text-brand-300" />
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">
            How SpotPass works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-500">
            Membership credits replace the mess of meters, tickets, and a dozen
            different garage apps.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="card p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <s.icon className="h-6 w-6" />
                </span>
                <span className="text-sm font-bold text-ink-300">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured garages */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Popular this week
              </h2>
              <p className="mt-2 text-ink-500">
                A few of the most-booked garages in the network.
              </p>
            </div>
            <Link
              href="/explore"
              className="hidden shrink-0 items-center gap-1 font-semibold text-brand-700 hover:text-brand-800 sm:inline-flex"
            >
              See all <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((g) => (
              <GarageCard key={g.id} garage={g} />
            ))}
          </div>
        </div>
      </section>

      {/* Membership teaser */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Plans for every commute
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-500">
            Start free and pay as you go, or subscribe for monthly credits at a
            lower effective rate.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`card flex flex-col p-6 ${
                plan.highlight ? "ring-2 ring-brand-500" : ""
              }`}
            >
              {plan.highlight && (
                <span className="mb-3 self-start pill bg-brand-600 text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-3xl font-extrabold">
                  {formatPrice(plan.priceCents)}
                </span>
                {plan.priceCents > 0 && (
                  <span className="mb-1 text-sm text-ink-400">/mo</span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-brand-700">
                {plan.monthlyCredits > 0
                  ? `${plan.monthlyCredits} credits / month`
                  : "No monthly credits"}
              </p>
              <p className="mt-3 flex-1 text-sm text-ink-500">{plan.tagline}</p>
              <Link
                href="/membership"
                className={`mt-5 ${
                  plan.highlight ? "btn-primary" : "btn-secondary"
                }`}
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6">
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white">
            Stop hunting for parking. Start using SpotPass.
          </h2>
          <Link
            href="/register"
            className="btn bg-white px-6 py-3 text-base font-bold text-brand-700 hover:bg-brand-50"
          >
            Create your free account
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
