"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { oneOf } from "@/lib/booking";
import { NEXT_STEP, STATUSES, findDriversByPin, getBookingById, isUuid, updateBooking } from "@/lib/db";
import { notify, siteUrl } from "@/lib/notify";
import { clearSession, getSession, setSession } from "@/lib/session";

const str = (form: FormData, k: string) => String(form.get(k) ?? "").trim();

export async function driverLogin(form: FormData) {
  const pin = str(form, "pin");
  const phone = str(form, "phone").replace(/\D/g, "");
  // ponytail: no rate limit on the PIN. Add one (or move to real auth) before drivers use this.
  if (/^\d{4,8}$/.test(pin) && phone.length >= 4) {
    const match = (await findDriversByPin(pin)).find((d) =>
      d.phone.replace(/\D/g, "").endsWith(phone.slice(-7)),
    );
    if (match) {
      await setSession({ role: "driver", id: match.id });
      redirect("/driver");
    }
  }
  redirect("/driver?error=1");
}

export async function driverLogout() {
  await clearSession();
  redirect("/driver");
}

export async function driverUpdate(form: FormData) {
  const session = await getSession("driver");
  if (!session) redirect("/driver");
  const id = str(form, "id");
  const status = str(form, "status");
  if (!isUuid(id) || !oneOf(STATUSES, status)) return;
  const booking = await getBookingById(id);
  // Only the assigned driver, and only the next step in the sequence.
  if (!booking || booking.driver_id !== session.id || NEXT_STEP[booking.status]?.status !== status) return;

  const num = (k: string) => {
    const v = Number(str(form, k));
    return str(form, k) && Number.isFinite(v) ? v : null;
  };
  const signature = str(form, "signature");
  const signed = status === "completed" && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(signature) && signature.length < 200_000;
  const row = await updateBooking(id, {
    status,
    last_lat: num("lat"),
    last_lon: num("lon"),
    ...(signed ? { signature } : {}),
  });
  revalidatePath("/driver");
  if (!row) return;
  const base = await siteUrl();
  after(() => notify(row, status, base));
}
