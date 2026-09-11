import assert from "node:assert/strict";
import { test } from "node:test";
import { estimateFare } from "./pricing.ts";

test("fare table", () => {
  const tenMiles = 16.09344;
  assert.equal(estimateFare(tenMiles, "wheelchair", "one-way"), 5500 + 3000);
  assert.equal(estimateFare(tenMiles, "wheelchair", "round-trip"), Math.round(8500 * 1.9));
  assert.equal(estimateFare(0, "stretcher", "one-way"), 15000);
});
