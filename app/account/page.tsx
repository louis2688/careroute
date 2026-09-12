import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { STATUS_LABEL, listBookingsByEmail, type BookingRow, type Status } from "@/lib/db";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "My rides", robots: { index: false } };
export const dynamic = "force-dynamic";

const badge: Record<Status, string> = {
  new: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  en_route: "bg-sky-100 text-sky-900",
  picked_up: "bg-violet-100 text-violet-900",
  completed: "bg-slate-800 text-white",
  cancelled: "bg-slate-200 text-slate-700",
};

const errors: Record<string, string> = {
  config: "Google sign-in is not set up on this server yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
  state: "That sign-in link expired. Please try again.",
  token: "Google did not accept the sign-in. Please try again.",
  email: "Your Google account needs a verified email address.",
  access_denied: "Sign-in was cancelled.",
};

function SignIn({ error }: { error?: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold tracking-wide text-sky-700 uppercase">Passengers</p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900">My rides</h1>
      <p className="mt-3 text-slate-600">
        Sign in with the Google account you use when booking. Every ride booked with that email shows up
        here, with live tracking.
      </p>
      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {errors[error] ?? "Sign-in did not complete. Please try again."}
        </p>
      )}
      <a href="/auth/google" className="btn-primary mt-6 w-full">
        Sign in with Google
      </a>
      <p className="mt-4 text-sm text-slate-500">
        No account needed to book. Sign-in only saves you typing and keeps your history in one place.
      </p>
    </div>
  );
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getSession("user");
  if (!user) return <SignIn error={(await searchParams).error} />;
  let rides: BookingRow[] = [];
  let error = "";
  try {
    rides = await listBookingsByEmail(user.id);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-sky-700 uppercase">My rides</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900">
            Hi {user.name?.split(" ")[0] || "there"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">Rides booked with {user.id}.</p>
        </div>
        <Link href="/book" className="btn-primary">
          Book a ride
          <Icon name="arrow-right" className="size-4" />
        </Link>
      </div>

      {error ? (
        <p role="alert" className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Could not load your rides. {error}
        </p>
      ) : rides.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          No rides yet. Book one and it will appear here with live tracking.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {rides.map((r) => (
            <li key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-heading text-lg font-semibold text-slate-900">
                  {r.date} at {r.time.slice(0, 5)}
                </p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{r.pickup}</p>
              <p className="text-sm text-slate-500">to {r.dropoff}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <Link href={`/trip/${r.ref}`} className="font-medium text-sky-700 hover:underline">
                  Track {r.ref}
                </Link>
                <span className="text-slate-500 capitalize">
                  {r.mobility}
                  {r.driver && `, driver ${r.driver.name}`}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
