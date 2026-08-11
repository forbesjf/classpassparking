import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GarageForm from "@/components/operator/GarageForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Add a garage · SpotPass" };

export default async function NewGaragePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "OPERATOR") redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/operator/garages"
          className="text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          ← Back to my garages
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Add a garage
        </h1>
        <p className="mt-1 text-ink-500">
          List a new facility on the SpotPass network. You can unlist it any
          time.
        </p>
        <div className="mt-6">
          <GarageForm mode="create" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
