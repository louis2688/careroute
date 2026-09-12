import assert from "node:assert/strict";
import { test } from "node:test";
import { csvRow } from "./csv.ts";

test("csv escaping", () => {
  assert.equal(csvRow(["a", 1, null, 'say "hi"', "x,y", "line\nbreak"]), 'a,1,,"say ""hi""","x,y","line\nbreak"');
});
