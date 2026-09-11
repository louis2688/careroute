import type { Booking } from "@/lib/booking";
import type { Route } from "@/lib/geo";

export const STATUSES = ["new", "confirmed", "en_route", "completed", "cancelled"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  new: "Request received",
  confirmed: "Confirmed by dispatch",
  en_route: "Driver on the way",
  completed: "Ride completed",
  cancelled: "Cancelled",
};

// What dispatch can do next from each status.
export const NEXT_STEP: Partial<Record<Status, { status: Status; label: string }>> = {
  new: { status: "confirmed", label: "Confirm" },
  confirmed: { status: "en_route", label: "Driver en route" },
  en_route: { status: "completed", label: "Complete" },
};

export type BookingRow = {
  id: string;
  ref: string;
  created_at: string;
  status: Status;
  name: string;
  phone: string;
  email: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  trip_type: Booking["tripType"];
  return_time: string | null;
  mobility: Booking["mobility"];
  companions: number;
  purpose: string;
  notes: string;
  distance_km: number | null;
  duration_min: number | null;
  quote_cents: number | null;
};

export type TripRow = BookingRow & { booking_events: { status: Status; at: string }[] };

// ponytail: PostgREST over fetch, no SDK. Swap for @supabase/supabase-js if queries grow.
// The secret key bypasses RLS, so this module must only run on the server.
function api(path: string, init: RequestInit = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local");
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key,
      // New sb_secret_ keys are not JWTs and go on apikey only. Legacy service_role JWTs need both.
      ...(key.startsWith("sb_") ? {} : { Authorization: `Bearer ${key}` }),
      "Content-Type": "application/json",
      Prefer: "return=minimal",
      ...init.headers,
    },
  }).then(async (r) => {
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
    return r;
  });
}

export async function insertBooking(ref: string, b: Booking, quote: (Route & { cents: number }) | null) {
  await api("bookings", {
    method: "POST",
    body: JSON.stringify({
      ref,
      name: b.name,
      phone: b.phone,
      email: b.email,
      pickup: b.pickup,
      dropoff: b.dropoff,
      date: b.date,
      time: b.time,
      trip_type: b.tripType,
      return_time: b.returnTime || null,
      mobility: b.mobility,
      companions: b.companions,
      purpose: b.purpose,
      notes: b.notes,
      distance_km: quote ? Number(quote.km.toFixed(2)) : null,
      duration_min: quote ? Math.round(quote.minutes) : null,
      quote_cents: quote?.cents ?? null,
    }),
  });
}

export async function listBookings(): Promise<BookingRow[]> {
  const r = await api("bookings?select=*&order=created_at.desc&limit=200", {
    headers: { Prefer: "" },
  });
  return r.json();
}

export async function getBooking(ref: string): Promise<TripRow | null> {
  const r = await api(
    `bookings?ref=eq.${encodeURIComponent(ref)}&select=*,booking_events(status,at)&limit=1`,
    { headers: { Prefer: "" } },
  );
  const rows: TripRow[] = await r.json();
  return rows[0] ?? null;
}

export async function updateStatus(id: string, status: Status): Promise<BookingRow | null> {
  const r = await api(`bookings?id=eq.${encodeURIComponent(id)}&select=*`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ status }),
  });
  const rows: BookingRow[] = await r.json();
  return rows[0] ?? null;
}
