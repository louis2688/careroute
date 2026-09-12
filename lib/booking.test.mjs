import assert from "node:assert/strict";
import { test } from "node:test";
import { occurrences, sanitizeIntake, validateBooking } from "./booking.ts";

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
  assert.equal(r.booking.coords, undefined);
});

test("standing orders", () => {
  // 2026-09-14 is a Monday. Mon/Wed/Fri for two weeks.
  assert.deepEqual(occurrences("2026-09-14", [1, 3, 5], "2026-09-25"), [
    "2026-09-14", "2026-09-16", "2026-09-18", "2026-09-21", "2026-09-23", "2026-09-25",
  ]);
  assert.equal(occurrences("2026-09-14", [1], "2027-09-14").length, 30);
  const f = valid();
  f.append("days", "1");
  assert.equal(validateBooking(f).ok, false, "days without an end date");
  f.set("until", "2020-01-01");
  assert.equal(validateBooking(f).ok, false, "end date before the first ride");
  f.set("until", new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10));
  assert.deepEqual(validateBooking(f).booking.recurrence.days, [1]);
});

test("keeps coordinates only when all four are sane", () => {
  const f = valid();
  for (const [k, v] of Object.entries({ pickup_lat: "40.7", pickup_lon: "-74.0", dropoff_lat: "40.8", dropoff_lon: "-73.9" })) f.set(k, v);
  assert.equal(validateBooking(f).booking.coords.dropoff.lon, -73.9);
  f.set("dropoff_lat", "999");
  assert.equal(validateBooking(f).booking.coords, undefined);
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

test("intake sanitizer keeps only form-safe values", () => {
  const out = sanitizeIntake({
    name: "  Rosa Diaz ", phone: "555-010-7788", email: "not-an-email", pickup: "45 Oak St", dropoff: "",
    date: "2026-10-05", time: "7:00", returnTime: "11:30", tripType: "round-trip", mobility: "jetpack",
    companions: "1", purpose: "Dialysis", notes: "two steps", days: [1, 3, 5, 5, 9], until: "December",
  });
  assert.deepEqual(out, {
    name: "Rosa Diaz", phone: "555-010-7788", pickup: "45 Oak St", date: "2026-10-05", returnTime: "11:30",
    tripType: "round-trip", companions: 1, purpose: "Dialysis", notes: "two steps", days: [1, 3, 5],
  });
  assert.deepEqual(sanitizeIntake("garbage"), {});
});
