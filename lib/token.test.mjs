import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeSession, encodeSession } from "./token.ts";

test("session tokens round-trip and reject tampering", () => {
  const t = encodeSession({ role: "driver", id: "abc" }, "s3cret");
  assert.deepEqual(decodeSession(t, "s3cret"), { role: "driver", id: "abc" });
  assert.equal(decodeSession(t, "other"), null);
  assert.equal(decodeSession(t.replace("driver", "facility"), "s3cret"), null);
  assert.equal(decodeSession(t.slice(0, -1) + "x", "s3cret"), null);
  assert.equal(decodeSession("driver:abc", "s3cret"), null);
  assert.equal(decodeSession(t, ""), null);
});
