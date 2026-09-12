import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeSession, encodeSession } from "./token.ts";

test("session tokens round-trip and reject tampering", () => {
  const s = { role: "user", id: "ana@example.com", name: "Ana" };
  const t = encodeSession(s, "s3cret");
  assert.deepEqual(decodeSession(t, "s3cret"), s);
  assert.equal(decodeSession(t, "other"), null);
  const forged = Buffer.from(JSON.stringify({ ...s, role: "driver" })).toString("base64url") + "." + t.split(".")[1];
  assert.equal(decodeSession(forged, "s3cret"), null);
  assert.equal(decodeSession(t.slice(0, -1) + "x", "s3cret"), null);
  assert.equal(decodeSession("nope", "s3cret"), null);
  assert.equal(decodeSession(t, ""), null);
});
