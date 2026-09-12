"use server";

import { redirect } from "next/navigation";
import { findFacilityByCode } from "@/lib/db";
import { clearSession, setSession } from "@/lib/session";

export async function facilityLogin(form: FormData) {
  const code = String(form.get("code") ?? "").trim().toUpperCase();
  // ponytail: no rate limit on the access code. Add one before real facilities use this.
  const facility = /^[A-Z0-9-]{6,32}$/.test(code) ? await findFacilityByCode(code) : null;
  if (!facility) redirect("/facility?error=1");
  await setSession({ role: "facility", id: facility.id, name: facility.name });
  redirect("/facility");
}

export async function facilityLogout() {
  await clearSession();
  redirect("/facility");
}
