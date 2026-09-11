"use server";

import { revalidatePath } from "next/cache";
import { STATUSES, updateStatus, type Status } from "@/lib/db";

export async function setStatus(form: FormData) {
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!id || !STATUSES.includes(status as Status)) return;
  await updateStatus(id, status as Status);
  revalidatePath("/admin");
}
