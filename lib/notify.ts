import { headers } from "next/headers";
import type { Status } from "@/lib/db";
import { toE164 } from "@/lib/phone";
import { site } from "@/lib/site";

type Recipient = { ref: string; name: string; email: string; phone: string; date: string; time: string };

// Which channels have credentials. Missing ones log the message instead of sending it.
export const channels = () => ({
  email: Boolean(process.env.RESEND_API_KEY),
  sms: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM),
});

export async function siteUrl() {
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

function message(b: Recipient, status: Status, base: string) {
  const first = b.name.split(" ")[0];
  const when = `${b.date} at ${b.time.slice(0, 5)}`;
  const track = `Track it: ${base}/trip/${b.ref}`;
  const text = {
    new: `Hi ${first}, ${site.name} received your ride request ${b.ref} for ${when}. Dispatch will confirm within one business hour. ${track}`,
    confirmed: `Hi ${first}, your ${site.name} ride ${b.ref} is confirmed for ${when}. Your driver will arrive 10 to 15 minutes early. ${track}`,
    en_route: `Hi ${first}, your ${site.name} driver is on the way for ride ${b.ref}. Please be ready at the pickup point. ${track}`,
    picked_up: `Hi ${first}, you are on board for ride ${b.ref}. ${track}`,
    completed: `Hi ${first}, ride ${b.ref} is complete. Thank you for riding with ${site.name}.`,
    cancelled: `Hi ${first}, your ${site.name} ride ${b.ref} for ${when} was cancelled. Questions? Call ${site.phone}.`,
  }[status];
  const subject = `${site.name} ride ${b.ref}: ${
    { new: "request received", confirmed: "confirmed", en_route: "driver on the way", picked_up: "on board", completed: "completed", cancelled: "cancelled" }[status]
  }`;
  return { subject, text };
}

export async function notify(b: Recipient, status: Status, base: string, note = "") {
  const m = message(b, status, base);
  if (note) m.text += ` ${note}`;
  const results = await Promise.allSettled([sendEmail(b.email, m.subject, m.text), sendSms(b.phone, m.text)]);
  for (const r of results) if (r.status === "rejected") console.error(`[notify ${b.ref}]`, r.reason);
}

async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return console.log(`[email off] to ${to} | ${subject}\n${text}`);
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? `${site.name} <onboarding@resend.dev>`,
      to,
      subject,
      text,
    }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

async function sendSms(to: string, text: string) {
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_FROM: from } = process.env;
  if (!sid || !token || !from) return console.log(`[sms off] to ${to}\n${text}`);
  const e164 = toE164(to, site.defaultCountryCode);
  if (!e164) return console.warn(`[sms skipped] cannot normalise ${to}`);
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ From: from, To: e164, Body: text }),
  });
  if (!r.ok) throw new Error(`Twilio ${r.status}: ${await r.text()}`);
}
