import Link from "next/link";
import { ParkingIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <ParkingIcon className="h-4 w-4" />
          </span>
          <span className="font-extrabold tracking-tight">
            Spot<span className="text-brand-600">Pass</span>
          </span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
          <Link href="/explore" className="hover:text-ink-900">
            Explore garages
          </Link>
          <Link href="/membership" className="hover:text-ink-900">
            Membership
          </Link>
          <Link href="/dashboard" className="hover:text-ink-900">
            Dashboard
          </Link>
        </nav>
        <p className="text-sm text-ink-400">
          A demo app · Not a real parking service
        </p>
      </div>
    </footer>
  );
}
