import assert from "node:assert/strict";
import { test } from "node:test";
import { checkBasicAuth } from "./auth.ts";

const basic = (user, pass) => `Basic ${btoa(`${user}:${pass}`)}`;

test("basic auth accepts only the shared password", () => {
  assert.equal(checkBasicAuth(basic("dispatch", "s3cret"), "s3cret"), true);
  assert.equal(checkBasicAuth(basic("anyone", "s3cret"), "s3cret"), true);
  assert.equal(checkBasicAuth(basic("dispatch", "wrong"), "s3cret"), false);
  assert.equal(checkBasicAuth(basic("dispatch", "s3cre"), "s3cret"), false);
  assert.equal(checkBasicAuth(null, "s3cret"), false);
  assert.equal(checkBasicAuth("Bearer x", "s3cret"), false);
  assert.equal(checkBasicAuth(basic("d", ""), ""), false);
  assert.equal(checkBasicAuth(basic("d", "x"), undefined), false);
});
