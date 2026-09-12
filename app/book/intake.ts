"use server";

import Anthropic from "@anthropic-ai/sdk";
import { INTAKE_SCHEMA, sanitizeIntake, type Intake } from "@/lib/booking";
import { site } from "@/lib/site";

export type IntakeResult = { ok: true; fields: Partial<Intake> } | { ok: false; error: string };

const BY_HAND = "Please fill in the form by hand.";

// Turns "my mother needs a wheelchair van to dialysis Mon/Wed/Fri at 7" into form fields.
export async function parseRideRequest(text: string): Promise<IntakeResult> {
  const input = String(text ?? "").trim().slice(0, 2000);
  if (input.length < 10) return { ok: false, error: "Tell us a little more about the ride first." };
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "The assistant is not set up on this server yet (ANTHROPIC_API_KEY)." };
  }
  const today = new Date().toLocaleDateString("en-CA", { timeZone: site.timeZone });
  const client = new Anthropic();
  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      output_config: { effort: "low", format: { type: "json_schema", schema: INTAKE_SCHEMA } },
      system: [
        `You turn a passenger's description of a non-emergency medical transportation ride into fields for a booking form.`,
        `Today is ${today} in the ${site.timeZone} time zone. Resolve relative dates such as "tomorrow" or "next Monday" to YYYY-MM-DD.`,
        `Times are 24-hour HH:MM. If the text gives an appointment time but no pickup time, use 45 minutes before the appointment as the pickup time.`,
        `Leave a field empty when the text does not say. Never invent a phone number, email, or address.`,
        `mobility: wheelchair when the passenger rides in a wheelchair, stretcher when they must lie down, ambulatory when they can walk.`,
        `tripType: round-trip when they also need a ride back. days and until: only for rides that repeat every week.`,
        `notes: anything the driver should know, in the passenger's words.`,
      ].join(" "),
      messages: [{ role: "user", content: input }],
    });
    if (response.stop_reason === "refusal") return { ok: false, error: `We could not read that request. ${BY_HAND}` };
    const json = response.content.find((b) => b.type === "text")?.text ?? "";
    return { ok: true, fields: sanitizeIntake(JSON.parse(json)) };
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return { ok: false, error: `The assistant's API key was rejected. ${BY_HAND}` };
    if (e instanceof Anthropic.RateLimitError) return { ok: false, error: `The assistant is busy. Try again in a minute or ${BY_HAND.toLowerCase()}` };
    console.error("[intake]", e);
    return { ok: false, error: `The assistant is unavailable right now. ${BY_HAND}` };
  }
}
