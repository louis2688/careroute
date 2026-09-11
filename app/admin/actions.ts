"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { oneOf } from "@/lib/booking";
import { STATUSES, updateStatus } from "@/lib/db";
import { notify, siteUrl } from "@/lib/notify";

export async function setStatus(form: FormData) {
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!id || !oneOf(STATUSES, status)) return;
  const row = await updateStatus(id, status);
  revalidatePath("/admin");
  if (!row) return;
  const base = await siteUrl();
  after(() => notify(row, status, base));
}
