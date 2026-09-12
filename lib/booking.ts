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
  // Standing order: repeat on these weekdays (0 = Sunday) until this date.
  recurrence?: { days: number[]; until: string };
};

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const MAX_SERIES = 30;

// Dates for a standing order: the first date, then every selected weekday after it through `until`.
export function occurrences(date: string, days: number[], until: string, max = MAX_SERIES): string[] {
  const out = [date];
  const d = new Date(`${date}T00:00:00Z`);
  const end = new Date(`${until}T00:00:00Z`);
  for (d.setUTCDate(d.getUTCDate() + 1); d <= end && out.length < max; d.setUTCDate(d.getUTCDate() + 1)) {
    if (days.includes(d.getUTCDay())) out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

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

  // Standing order, optional. Both parts or neither.
  const days = [...new Set(form.getAll("days").map(Number))].filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
  const until = s("until");
  let recurrence: Booking["recurrence"];
  if (days.length || until) {
    if (!days.length) return { ok: false, error: "Pick at least one weekday for the standing order." };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(until) || until <= s("date")) {
      return { ok: false, error: "Pick an end date after the first ride for the standing order." };
    }
    if (Date.parse(until) - Date.parse(s("date")) > 84 * 864e5) {
      return { ok: false, error: "Standing orders run up to 12 weeks. Dispatch can extend them later." };
    }
    recurrence = { days, until };
  }

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
      recurrence,
    },
  };
}

// ---- AI intake: free text -> form fields ----

export type Intake = {
  name: string;
  phone: string;
  email: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  returnTime: string;
  tripType: Booking["tripType"] | "";
  mobility: Booking["mobility"] | "";
  companions: number;
  purpose: string;
  notes: string;
  days: number[];
  until: string;
};

const str = (description: string) => ({ type: "string", description });

// JSON schema the model must follow. Every field is required; unknown values are empty strings.
export const INTAKE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "name", "phone", "email", "pickup", "dropoff", "date", "time", "returnTime",
    "tripType", "mobility", "companions", "purpose", "notes", "days", "until",
  ],
  properties: {
    name: str("Passenger's full name"),
    phone: str("Phone number exactly as written, or empty"),
    email: str("Email address exactly as written, or empty"),
    pickup: str("Pickup street address, or empty"),
    dropoff: str("Destination name and address, or empty"),
    date: str("First ride date as YYYY-MM-DD, or empty"),
    time: str("Pickup time as 24-hour HH:MM, or empty"),
    returnTime: str("Return pickup time as 24-hour HH:MM for round trips, or empty"),
    tripType: { type: "string", enum: [...TRIP_TYPES, ""], description: "round-trip when a ride back is needed" },
    mobility: { type: "string", enum: [...MOBILITY, ""], description: "wheelchair, stretcher (must lie down), or ambulatory (can walk)" },
    companions: { type: "integer", description: "People riding along, a whole number from 0 to 3" },
    purpose: { type: "string", enum: [...PURPOSES, ""], description: "Reason for the trip" },
    notes: str("Anything the driver should know: oxygen, stairs, language, equipment"),
    days: { type: "array", items: { type: "integer" }, description: "Weekdays for a recurring ride as whole numbers 0 to 6, 0 = Sunday. Empty for a single ride" },
    until: str("Last date of a recurring ride as YYYY-MM-DD, or empty"),
  },
} as const;

// Model output is untrusted. Keep only values the form can hold.
export function sanitizeIntake(raw: unknown): Partial<Intake> {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const text = (k: string, max = 200) => (typeof r[k] === "string" ? r[k].trim().slice(0, max) : "");
  const date = (k: string) => (/^\d{4}-\d{2}-\d{2}$/.test(text(k)) ? text(k) : "");
  const time = (k: string) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(text(k)) ? text(k) : "");
  const out: Partial<Intake> = {};
  const put = <K extends keyof Intake>(k: K, v: Intake[K]) => {
    if (v !== "" && !(Array.isArray(v) && v.length === 0)) out[k] = v;
  };
  put("name", text("name"));
  put("phone", text("phone", 40));
  put("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text("email")) ? text("email") : "");
  put("pickup", text("pickup"));
  put("dropoff", text("dropoff"));
  put("date", date("date"));
  put("time", time("time"));
  put("returnTime", time("returnTime"));
  const tripType = text("tripType");
  if (oneOf(TRIP_TYPES, tripType)) put("tripType", tripType);
  const mobility = text("mobility");
  if (oneOf(MOBILITY, mobility)) put("mobility", mobility);
  const companions = Number(r.companions);
  if (Number.isInteger(companions) && companions >= 1 && companions <= 3) put("companions", companions);
  const purpose = text("purpose");
  if (oneOf(PURPOSES, purpose)) put("purpose", purpose);
  put("notes", text("notes", 2000));
  const days = Array.isArray(r.days)
    ? [...new Set(r.days.map(Number))].filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
    : [];
  put("days", days);
  put("until", date("until"));
  return out;
}
