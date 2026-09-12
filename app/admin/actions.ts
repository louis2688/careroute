"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { MOBILITY, oneOf } from "@/lib/booking";
import { STATUSES, insertDriver, insertFacility, isUuid, updateBooking, updateDriver } from "@/lib/db";
import { CREDENTIALS, type CredentialKey } from "@/lib/fleet";
import { notify, siteUrl } from "@/lib/notify";

const str = (form: FormData, k: string) => String(form.get(k) ?? "").trim();

export async function setStatus(form: FormData) {
  const id = str(form, "id");
  const status = str(form, "status");
  if (!isUuid(id) || !oneOf(STATUSES, status)) return;
  const row = await updateBooking(id, { status });
  revalidatePath("/admin", "layout");
  if (!row) return;
  const base = await siteUrl();
  after(() => notify(row, status, base));
}

export async function assignDriver(form: FormData) {
  const id = str(form, "id");
  const driver = str(form, "driver_id");
  if (!isUuid(id) || (driver && !isUuid(driver))) return;
  await updateBooking(id, { driver_id: driver || null });
  revalidatePath("/admin", "layout");
}

export async function saveDriver(form: FormData) {
  const id = str(form, "id");
  const vehicle_type = str(form, "vehicle_type");
  const pin = str(form, "pin");
  const d = {
    name: str(form, "name"),
    phone: str(form, "phone"),
    plate: str(form, "plate"),
    active: form.get("active") === "on",
  };
  if (!d.name || !d.phone || !d.plate || !oneOf(MOBILITY, vehicle_type)) return;
  if (id && !isUuid(id)) return;
  if (!/^\d{4,8}$/.test(pin) && !(id && pin === "")) return;
  const dates = Object.fromEntries(
    CREDENTIALS.map(([k]) => {
      const v = str(form, k);
      return [k, /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null];
    }),
  ) as Record<CredentialKey, string | null>;
  // ponytail: PINs are stored as typed. Hash them before real drivers use this.
  const patch = { ...d, ...dates, vehicle_type, ...(pin ? { pin } : {}) };
  if (id) await updateDriver(id, patch);
  else await insertDriver({ ...patch, pin });
  revalidatePath("/admin", "layout");
}

export async function saveFacility(form: FormData) {
  const f = {
    name: str(form, "name"),
    access_code: str(form, "access_code").toUpperCase(),
    contact_name: str(form, "contact_name") || null,
    phone: str(form, "phone") || null,
  };
  // ponytail: access codes are stored as typed and shared by phone with the facility. Hash before production.
  if (!f.name || !/^[A-Z0-9-]{6,32}$/.test(f.access_code)) return;
  await insertFacility(f);
  revalidatePath("/admin", "layout");
}
