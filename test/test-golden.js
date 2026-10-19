// The golden cases shared with GeoSuite's Schema Helper
// (backend/tests/tools/test_schema_helper_golden.py runs the same file).
// A failure here means the check changed: update test/fixtures/golden.json
// on purpose, then port the change and copy the fixture to GeoSuite.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { REQUIRED_BY_TYPE, validateJsonLd } from "../src/validate.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const golden = JSON.parse(readFileSync(join(repoRoot, "test/fixtures/golden.json"), "utf8"));

test("REQUIRED_BY_TYPE is the one in the golden file", () => {
  assert.deepEqual(REQUIRED_BY_TYPE, golden.required_by_type);
});

test("the golden file pins every shipped template", () => {
  const actual = {};
  for (const name of readdirSync(join(repoRoot, "templates")).filter((f) => f.endsWith(".json")).sort()) {
    actual[name] = createHash("sha256").update(readFileSync(join(repoRoot, "templates", name))).digest("hex");
  }
  assert.deepEqual(actual, golden.templates_sha256);
});

for (const c of golden.validate_cases) {
  test(`golden: ${c.name}`, () => {
    const { ok, errors, items } = validateJsonLd(c.input);
    assert.deepEqual({ ok, errors, items }, c.expected);
  });
}

test("a parse error keeps the parser's message apart", () => {
  const out = validateJsonLd("{oops");
  assert.deepEqual(out.errors, ["invalid JSON"]);
  assert.ok(out.parseError);
});

test("the templates themselves pass when placeholders are allowed", () => {
  const raw = readFileSync(join(repoRoot, "templates/Organization.json"), "utf8");
  assert.equal(validateJsonLd(raw).ok, false);
  assert.equal(validateJsonLd(raw, { placeholders: false }).ok, true);
});
