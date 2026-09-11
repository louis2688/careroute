"use server";

import { validateBooking } from "@/lib/booking";
import { insertBooking } from "@/lib/db";

export type BookingState = { ok: true; ref: string } | { ok: false; error: string } | null;

export async function submitBooking(_prev: BookingState, form: FormData): Promise<BookingState> {
  const result = validateBooking(form);
  if (!result.ok) return { ok: false, error: result.error };
  const ref = `CR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  try {
    await insertBooking(ref, result.booking);
  } catch (e) {
    console.error(`[booking ${ref}] save failed`, e);
    return { ok: false, error: "We could not save your request. Please call dispatch." };
  }
  return { ok: true, ref };
}
