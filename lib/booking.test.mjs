import assert from "node:assert/strict";
import { test } from "node:test";
import { validateBooking } from "./booking.ts";

const valid = () => {
  const f = new FormData();
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const fields = {
    name: "Ana Reyes",
    phone: "555-010-2020",
    email: "ana@example.com",
    pickup: "12 Elm St",
    dropoff: "City Dialysis Center",
    date: tomorrow,
    time: "08:30",
    tripType: "round-trip",
    mobility: "wheelchair",
    companions: "1",
    agree: "on",
  };
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};

test("accepts a complete request", () => {
  const r = validateBooking(valid());
  assert.equal(r.ok, true);
  assert.equal(r.booking.mobility, "wheelchair");
  assert.equal(r.booking.companions, 1);
});

test("rejects bad input", () => {
  const bad = [
    ["name", " "],
    ["email", "nope"],
    ["date", "2020-01-01"],
    ["mobility", "jetpack"],
    ["companions", "9"],
    ["agree", ""],
  ];
  for (const [k, v] of bad) {
    const f = valid();
    f.set(k, v);
    assert.equal(validateBooking(f).ok, false, `should reject ${k}=${v}`);
  }
});
