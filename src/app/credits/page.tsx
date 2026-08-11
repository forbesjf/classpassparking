import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CreditPurchase from "@/components/CreditPurchase";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Buy credits · SpotPass" };

export default async function CreditsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "OPERATOR") redirect("/operator");

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          ← Back to dashboard
        </Link>
        <div className="mt-4 max-w-2xl">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Buy credits
          </h1>
          <p className="mt-2 text-ink-500">
            Top up any time — one-time credit packs never expire and stack on
            top of your monthly plan. Bigger packs cost less per credit.
          </p>
          <p className="mt-2 text-sm text-ink-400">
            Prefer a recurring allowance?{" "}
            <Link
              href="/membership"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              Compare membership plans →
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <CreditPurchase currentCredits={user.credits} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
