import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { formatCredits } from "@/lib/format";
import { ParkingIcon, CoinIcon } from "./icons";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
            <ParkingIcon className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink-900">
            Spot<span className="text-brand-600">Pass</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/explore" className="btn-ghost">
            Explore
          </Link>
          <Link href="/membership" className="btn-ghost">
            Membership
          </Link>
          {user && user.role !== "OPERATOR" && (
            <Link href="/dashboard" className="btn-ghost">
              Dashboard
            </Link>
          )}
          {user?.role === "OPERATOR" && (
            <Link href="/operator" className="btn-ghost">
              Operator
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "OPERATOR" ? (
                <span className="hidden items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1.5 text-sm font-semibold text-ink-600 sm:inline-flex">
                  Operator
                </span>
              ) : (
                <Link
                  href="/membership"
                  className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 sm:inline-flex"
                  title="Your credit balance"
                >
                  <CoinIcon className="h-4 w-4" />
                  {formatCredits(user.credits)} credits
                </Link>
              )}
              <Link
                href={user.role === "OPERATOR" ? "/operator" : "/dashboard"}
                className="btn-secondary"
              >
                {user.name.split(" ")[0]}
              </Link>
              <span className="hidden sm:inline-flex">
                <LogoutButton />
              </span>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/register" className="btn-primary">
                Join free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
