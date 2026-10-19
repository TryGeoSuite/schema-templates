#!/usr/bin/env node
// Refreshes the parts of test/fixtures/golden.json that are derived from the
// repo (the templates' sha256 and REQUIRED_BY_TYPE). The expected verdicts in
// `validate_cases` are written by hand on purpose: this script never touches
// them. Copy the result to GeoSuite (backend/tests/fixtures/schema_templates_golden.json)
// together with templates/ (backend/data/schema_templates/).
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { REQUIRED_BY_TYPE } from "../src/validate.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "test/fixtures/golden.json");
const golden = JSON.parse(readFileSync(path, "utf8"));

const hashes = {};
for (const name of readdirSync(join(root, "templates")).filter((f) => f.endsWith(".json")).sort()) {
  hashes[name] = createHash("sha256").update(readFileSync(join(root, "templates", name))).digest("hex");
}
golden.required_by_type = REQUIRED_BY_TYPE;
golden.templates_sha256 = hashes;
writeFileSync(path, JSON.stringify(golden, null, 2) + "\n");
console.log(`golden.json: ${Object.keys(hashes).length} template hash(es), ${Object.keys(REQUIRED_BY_TYPE).length} type(s)`);
