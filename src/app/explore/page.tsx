import Navbar from "@/components/Navbar";
import ExploreClient from "@/components/ExploreClient";
import { getGarages } from "@/lib/garages";

export const metadata = { title: "Explore garages · SpotPass" };

export default async function ExplorePage() {
  const garages = await getGarages();

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Find parking near you
        </h1>
        <p className="mt-1 text-ink-500">
          Live availability across the SpotPass network. Hover a garage to spot
          it on the map.
        </p>
      </div>
      <div className="mt-4">
        <ExploreClient garages={garages} />
      </div>
    </div>
  );
}
