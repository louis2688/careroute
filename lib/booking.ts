import type { Place } from "./geo";

export const TRIP_TYPES = ["one-way", "round-trip"] as const;
export const MOBILITY = ["ambulatory", "wheelchair", "stretcher"] as const;
export const PURPOSES = [
  "Dialysis",
  "Doctor visit",
  "Physical therapy",
  "Infusion or chemotherapy",
  "Imaging or lab work",
  "Hospital discharge",
  "Other",
] as const;

export type Booking = {
  name: string;
  phone: string;
  email: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  tripType: (typeof TRIP_TYPES)[number];
  returnTime: string;
  mobility: (typeof MOBILITY)[number];
  companions: number;
  purpose: string;
  notes: string;
  // Present when both addresses were picked from the suggestions.
  coords?: { pickup: Place; dropoff: Place };
};

type Result = { ok: true; booking: Booking } | { ok: false; error: string };

const REQUIRED = {
  name: "Full name",
  phone: "Phone number",
  email: "Email",
  pickup: "Pickup address",
  dropoff: "Destination",
  date: "Appointment date",
  time: "Pickup time",
};

export const oneOf = <T extends readonly string[]>(list: T, v: string): v is T[number] =>
  (list as readonly string[]).includes(v);

// Server-side backstop behind the browser's native validation. Server Actions are public endpoints.
export function validateBooking(form: FormData): Result {
  const s = (k: string) => String(form.get(k) ?? "").trim();
  for (const [key, label] of Object.entries(REQUIRED)) {
    if (!s(key)) return { ok: false, error: `${label} is required.` };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s("email"))) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (s("phone").replace(/\D/g, "").length < 7) {
    return { ok: false, error: "Enter a valid phone number." };
  }
  // A day of slack: the server clock is UTC, the passenger's is not.
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s("date")) || s("date") < yesterday) {
    return { ok: false, error: "The appointment date can't be in the past." };
  }
  const tripType = s("tripType");
  if (!oneOf(TRIP_TYPES, tripType)) return { ok: false, error: "Choose one-way or round trip." };
  const mobility = s("mobility");
  if (!oneOf(MOBILITY, mobility)) return { ok: false, error: "Choose a mobility option." };
  const companions = Number(s("companions") || 0);
  if (!Number.isInteger(companions) || companions < 0 || companions > 3) {
    return { ok: false, error: "Companions must be between 0 and 3." };
  }
  if (form.get("agree") !== "on") {
    return { ok: false, error: "Please accept the Terms & Conditions." };
  }

  // Coordinates are optional and only trusted within sane bounds. Bad values are ignored, not fatal.
  const num = (k: string, max: number) => {
    const v = Number(s(k));
    return s(k) && Number.isFinite(v) && Math.abs(v) <= max ? v : null;
  };
  const [plat, plon, dlat, dlon] = [
    num("pickup_lat", 90),
    num("pickup_lon", 180),
    num("dropoff_lat", 90),
    num("dropoff_lon", 180),
  ];
  const coords =
    plat !== null && plon !== null && dlat !== null && dlon !== null
      ? {
          pickup: { label: s("pickup"), lat: plat, lon: plon },
          dropoff: { label: s("dropoff"), lat: dlat, lon: dlon },
        }
      : undefined;

  return {
    ok: true,
    booking: {
      name: s("name"),
      phone: s("phone"),
      email: s("email"),
      pickup: s("pickup"),
      dropoff: s("dropoff"),
      date: s("date"),
      time: s("time"),
      tripType,
      returnTime: s("returnTime"),
      mobility,
      companions,
      purpose: s("purpose"),
      notes: s("notes").slice(0, 2000),
      coords,
    },
  };
}
