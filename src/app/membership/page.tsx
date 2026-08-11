import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlanCard, { type PlanView } from "@/components/PlanCard";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Membership · SpotPass" };

const faqs = [
  {
    q: "How do credits work?",
    a: "Credits are SpotPass's currency. Every garage lists a per-hour credit rate, and credits are deducted when you book. One membership works across the entire network.",
  },
  {
    q: "Do unused credits roll over?",
    a: "Paid plans roll over a portion of unused credits each month (40 on Starter, 120 on Commuter). All-Access credits are meant to be used within the month.",
  },
  {
    q: "Can I change plans anytime?",
    a: "Yes. Upgrade, downgrade, or cancel whenever you like — changes take effect immediately and your new monthly credits are added right away.",
  },
  {
    q: "What if I cancel a booking?",
    a: "Cancel up to an hour before your arrival and the credits are refunded to your balance automatically.",
  },
];

export default async function MembershipPage() {
  const [user, plans] = await Promise.all([
    getCurrentUser(),
    prisma.plan.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const planViews: PlanView[] = plans.map((p) => ({
    key: p.key,
    name: p.name,
    monthlyCredits: p.monthlyCredits,
    priceCents: p.priceCents,
    tagline: p.tagline,
    highlight: p.highlight,
    features: JSON.parse(p.features) as string[],
  }));

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Choose your parking plan
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-500">
            Every plan unlocks the full network of garages. The more you drive,
            the more you save per hour.
          </p>
          {user && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm shadow-card">
              You have{" "}
              <span className="font-bold text-brand-700">
                {user.credits} credits
              </span>{" "}
              on the{" "}
              <span className="font-semibold">
                {planViews.find((p) => p.key === user.planKey)?.name}
              </span>{" "}
              plan
            </p>
          )}
          {user && user.role !== "OPERATOR" && (
            <p className="mt-3 text-sm text-ink-500">
              Just need a one-time boost?{" "}
              <Link
                href="/credits"
                className="font-semibold text-brand-700 hover:text-brand-800"
              >
                Buy a credit pack →
              </Link>
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {planViews.map((plan) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              currentPlanKey={user?.planKey ?? null}
              isLoggedIn={!!user}
            />
          ))}
        </div>

        <section className="mt-16">
          <h2 className="text-center text-2xl font-extrabold tracking-tight">
            Frequently asked
          </h2>
          <div className="mx-auto mt-6 grid max-w-3xl gap-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="card group p-5 [&_summary]:cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold text-ink-800 marker:content-['']">
                  {f.q}
                  <span className="text-brand-600 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
