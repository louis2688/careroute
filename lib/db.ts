import type { Booking } from "@/lib/booking";

export const STATUSES = ["new", "confirmed", "cancelled"] as const;
export type Status = (typeof STATUSES)[number];

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
};

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

export async function insertBooking(ref: string, b: Booking) {
  const { tripType, returnTime, ...rest } = b;
  await api("bookings", {
    method: "POST",
    body: JSON.stringify({ ref, ...rest, trip_type: tripType, return_time: returnTime || null }),
  });
}

export async function listBookings(): Promise<BookingRow[]> {
  const r = await api("bookings?select=*&order=created_at.desc&limit=200", {
    headers: { Prefer: "" },
  });
  return r.json();
}

export async function updateStatus(id: string, status: Status) {
  await api(`bookings?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
