export const CREDENTIALS = [
  ["license_expires", "Driver's license"],
  ["cpr_expires", "CPR / first aid"],
  ["background_expires", "Background check"],
  ["inspection_expires", "Vehicle inspection"],
  ["insurance_expires", "Vehicle insurance"],
] as const;

export type CredentialKey = (typeof CREDENTIALS)[number][0];
export type Tone = "expired" | "soon" | "ok" | "missing";

export const todayISO = () => new Date().toISOString().slice(0, 10);

// Expired, expiring within 30 days, fine, or never recorded.
export function expiryTone(date: string | null, today = todayISO()): Tone {
  if (!date) return "missing";
  if (date < today) return "expired";
  return (Date.parse(date) - Date.parse(today)) / 864e5 <= 30 ? "soon" : "ok";
}
