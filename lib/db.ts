import type { Booking } from "@/lib/booking";
import type { Route } from "@/lib/geo";

export const STATUSES = ["new", "confirmed", "en_route", "picked_up", "completed", "cancelled"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  new: "Request received",
  confirmed: "Confirmed by dispatch",
  en_route: "Driver on the way",
  picked_up: "Passenger on board",
  completed: "Ride completed",
  cancelled: "Cancelled",
};

// What happens next from each status.
export const NEXT_STEP: Partial<Record<Status, { status: Status; label: string }>> = {
  new: { status: "confirmed", label: "Confirm" },
  confirmed: { status: "en_route", label: "Driver en route" },
  en_route: { status: "picked_up", label: "Picked up" },
  picked_up: { status: "completed", label: "Complete" },
};

export type Driver = {
  id: string;
  name: string;
  phone: string;
  pin: string;
  vehicle_type: Booking["mobility"];
  plate: string;
  license_expires: string | null;
  cpr_expires: string | null;
  background_expires: string | null;
  inspection_expires: string | null;
  insurance_expires: string | null;
  active: boolean;
  created_at: string;
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
  driver_id: string | null;
  last_lat: number | null;
  last_lon: number | null;
  signature: string | null;
  series_id: string | null;
  facility_id: string | null;
  driver?: Pick<Driver, "name" | "phone" | "vehicle_type" | "plate"> | null;
  facility?: Pick<Facility, "name"> | null;
};

export type Facility = {
  id: string;
  name: string;
  access_code: string;
  contact_name: string | null;
  phone: string | null;
  created_at: string;
};

export type TripRow = BookingRow & {
  booking_events: { status: Status; at: string; lat: number | null; lon: number | null }[];
};

export const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

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

const read = (path: string) => api(path, { headers: { Prefer: "" } }).then((r) => r.json());

const DRIVER = "driver:drivers(name,phone,vehicle_type,plate),facility:facilities(name)";

export type Quote = Route & { cents: number };

// One row of the bookings table, ready to insert.
export function bookingRow(
  ref: string,
  b: Booking,
  quote: Quote | null,
  extra: { date?: string; series_id?: string | null; facility_id?: string | null } = {},
) {
  return {
    ref,
    name: b.name,
    phone: b.phone,
    email: b.email,
    pickup: b.pickup,
    dropoff: b.dropoff,
    date: extra.date ?? b.date,
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
    series_id: extra.series_id ?? null,
    facility_id: extra.facility_id ?? null,
  };
}

// One request for one ride or a whole standing order.
export async function insertBookings(rows: ReturnType<typeof bookingRow>[]) {
  await api("bookings", { method: "POST", body: JSON.stringify(rows) });
}

// Newest first by default. Filtered by day or range, the schedule in pickup order.
export function listBookings(
  filter: { date?: string; from?: string; open?: boolean; facility?: string } = {},
): Promise<BookingRow[]> {
  const where = [
    filter.date && `date=eq.${filter.date}`,
    filter.from && `date=gte.${filter.from}`,
    filter.open && "status=in.(new,confirmed,en_route,picked_up)",
    filter.facility && `facility_id=eq.${encodeURIComponent(filter.facility)}`,
  ]
    .filter(Boolean)
    .map((w) => `&${w}`)
    .join("");
  const order = filter.date || filter.from ? "date.asc,time.asc" : filter.facility ? "date.desc,time.desc" : "created_at.desc";
  return read(`bookings?select=*,${DRIVER}&order=${order}&limit=200${where}`);
}

// The other rides in a standing order.
export const listSeries = (seriesId: string): Promise<Pick<BookingRow, "ref" | "date" | "status">[]> =>
  read(`bookings?select=ref,date,status&series_id=eq.${encodeURIComponent(seriesId)}&order=date.asc`);

export const listFacilities = (): Promise<Facility[]> => read("facilities?select=*&order=name.asc");

export const findFacilityByCode = async (code: string): Promise<Facility | null> =>
  (await read(`facilities?select=*&access_code=eq.${encodeURIComponent(code)}&limit=1`))[0] ?? null;

export async function insertFacility(f: Omit<Facility, "id" | "created_at">) {
  await api("facilities", { method: "POST", body: JSON.stringify(f) });
}

export async function getBooking(ref: string): Promise<TripRow | null> {
  const rows: TripRow[] = await read(
    `bookings?ref=eq.${encodeURIComponent(ref)}&select=*,${DRIVER},booking_events(status,at,lat,lon)&limit=1`,
  );
  return rows[0] ?? null;
}

export async function updateBooking(
  id: string,
  patch: Partial<Pick<BookingRow, "status" | "driver_id" | "last_lat" | "last_lon" | "signature">>,
): Promise<BookingRow | null> {
  const r = await api(`bookings?id=eq.${encodeURIComponent(id)}&select=*`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
  const rows: BookingRow[] = await r.json();
  return rows[0] ?? null;
}

export const listDrivers = (): Promise<Driver[]> => read("drivers?select=*&order=name.asc");

export const findDriversByPin = (pin: string): Promise<Driver[]> =>
  read(`drivers?select=*&pin=eq.${encodeURIComponent(pin)}&active=is.true`);

export const getDriver = async (id: string): Promise<Driver | null> =>
  (await read(`drivers?select=*&id=eq.${encodeURIComponent(id)}&limit=1`))[0] ?? null;

// A signed-in passenger's own rides, newest first.
export const listBookingsByEmail = (email: string): Promise<BookingRow[]> =>
  read(`bookings?select=*,${DRIVER}&email=eq.${encodeURIComponent(email)}&order=date.desc,time.desc&limit=100`);

export const getBookingById = async (id: string): Promise<BookingRow | null> =>
  (await read(`bookings?select=*&id=eq.${encodeURIComponent(id)}&limit=1`))[0] ?? null;

// A driver's open rides, soonest first.
export const listDriverRides = (driverId: string): Promise<BookingRow[]> =>
  read(
    `bookings?select=*&driver_id=eq.${encodeURIComponent(driverId)}&status=not.in.(completed,cancelled)&order=date.asc,time.asc`,
  );

// Everything a biller needs, with the status history and driver, oldest first.
export function listForExport(from: string, to: string): Promise<TripRow[]> {
  const range = (from ? `&date=gte.${from}` : "") + (to ? `&date=lte.${to}` : "");
  return read(`bookings?select=*,${DRIVER},booking_events(status,at,lat,lon)&order=date.asc,time.asc${range}`);
}

export type DriverInput = Omit<Driver, "id" | "created_at">;

export async function insertDriver(d: DriverInput) {
  await api("drivers", { method: "POST", body: JSON.stringify(d) });
}

export async function updateDriver(id: string, patch: Partial<DriverInput>) {
  await api(`drivers?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
}
