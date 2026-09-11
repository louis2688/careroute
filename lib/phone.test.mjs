import assert from "node:assert/strict";
import { test } from "node:test";
import { toE164 } from "./phone.ts";

test("phone normalisation", () => {
  assert.equal(toE164("555-010-2020", "+1"), "+15550102020");
  assert.equal(toE164("1 (555) 010-2020", "+1"), "+15550102020");
  assert.equal(toE164("+63 917 123 4567", "+1"), "+639171234567");
  assert.equal(toE164("0917 123 4567", "+63"), "+639171234567");
  assert.equal(toE164("12", "+1"), null);
  assert.equal(toE164("+1", "+1"), null);
});
