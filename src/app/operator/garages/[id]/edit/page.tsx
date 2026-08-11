import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GarageForm from "@/components/operator/GarageForm";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Edit garage · SpotPass" };

export default async function EditGaragePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "OPERATOR") redirect("/dashboard");

  const garage = await prisma.garage.findUnique({ where: { id: params.id } });
  if (!garage || garage.ownerId !== user.id) notFound();

  const initial = {
    id: garage.id,
    name: garage.name,
    address: garage.address,
    neighborhood: garage.neighborhood,
    lat: garage.lat,
    lng: garage.lng,
    creditsPerHour: garage.creditsPerHour,
    capacity: garage.capacity,
    description: garage.description,
    amenities: garage.amenities
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean),
    openHour: garage.openHour,
    closeHour: garage.closeHour,
    accent: garage.accent,
    listed: garage.listed,
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href={`/operator/garages/${garage.id}`}
          className="text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          ← Back to garage
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Edit {garage.name}
        </h1>
        <p className="mt-1 text-ink-500">
          Update pricing, capacity, amenities, and availability.
        </p>
        <div className="mt-6">
          <GarageForm mode="edit" initial={initial} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
