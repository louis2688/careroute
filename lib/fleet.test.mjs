import assert from "node:assert/strict";
import { test } from "node:test";
import { expiryTone } from "./fleet.ts";

test("credential expiry tones", () => {
  const today = "2026-09-12";
  assert.equal(expiryTone(null, today), "missing");
  assert.equal(expiryTone("2026-09-11", today), "expired");
  assert.equal(expiryTone("2026-09-12", today), "soon");
  assert.equal(expiryTone("2026-10-12", today), "soon");
  assert.equal(expiryTone("2026-10-13", today), "ok");
});
