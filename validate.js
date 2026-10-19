#!/usr/bin/env node
/**
 * validate.js — local structural sanity check for every JSON-LD file
 * in templates/ and examples/.
 *
 * Checks performed (no network calls):
 *   1. file is well-formed JSON
 *   2. the shared JSON-LD check of src/validate.js (@context, @type, the
 *      required fields of REQUIRED_BY_TYPE, leftover placeholders in examples)
 *   3. house rules: the canonical "https://schema.org" @context and a
 *      string @type that REQUIRED_BY_TYPE knows
 *
 * Exits with non-zero status if any file fails.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { REQUIRED_BY_TYPE, SCHEMA_CONTEXT, validateJsonLd } from "./src/validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function listJsonFiles(dir) {
  if (!statSync(dir, { throwIfNoEntry: false })) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => join(dir, f));
}

// The shared check (src/validate.js, the same one the web tool and GeoSuite
// run), plus the house rules for the files we ship: one top-level object,
// the canonical "https://schema.org" context, a string @type we know.
// Templates keep their {{PLACEHOLDER}} tokens; examples must have none.
function checkFile(path) {
  const raw = readFileSync(path, "utf8");
  const isTemplate = basename(dirname(path)) === "templates";
  const result = validateJsonLd(raw, { placeholders: !isTemplate });
  if (result.parseError) return [`invalid JSON: ${result.parseError}`];

  const errors = [...result.errors];
  const doc = JSON.parse(raw);
  if (typeof doc !== "object" || doc === null || Array.isArray(doc)) {
    return ["top-level value must be a JSON object"];
  }
  if (doc["@context"] && doc["@context"] !== SCHEMA_CONTEXT) {
    errors.push(`"@context" must be "${SCHEMA_CONTEXT}", got ${JSON.stringify(doc["@context"])}`);
  }
  const type = doc["@type"];
  if (type && typeof type !== "string") {
    errors.push('"@type" must be a string at the top level');
  } else if (type && !REQUIRED_BY_TYPE[type]) {
    errors.push(`unknown @type "${type}" (add it to REQUIRED_BY_TYPE in src/validate.js)`);
  }
  return errors;
}

function main() {
  const dirs = [join(__dirname, "templates"), join(__dirname, "examples")];
  const files = dirs.flatMap(listJsonFiles).sort();

  if (files.length === 0) {
    console.error("no JSON files found in templates/ or examples/");
    process.exit(1);
  }

  let totalErrors = 0;
  let okCount = 0;

  for (const file of files) {
    const rel = file.slice(__dirname.length + 1);
    const errors = checkFile(file);
    if (errors.length === 0) {
      okCount += 1;
      console.log(`ok    ${rel}`);
    } else {
      totalErrors += errors.length;
      console.log(`FAIL  ${rel}`);
      for (const e of errors) console.log(`        - ${e}`);
    }
  }

  console.log("");
  console.log(
    `checked ${files.length} file(s): ${okCount} ok, ${
      files.length - okCount
    } failed, ${totalErrors} error(s) total`
  );

  process.exit(totalErrors === 0 ? 0 : 1);
}

main();
