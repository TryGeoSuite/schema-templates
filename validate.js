#!/usr/bin/env node
/**
 * validate.js — local structural sanity check for every JSON-LD file
 * in templates/ and examples/.
 *
 * Checks performed (no network calls):
 *   1. file is well-formed JSON
 *   2. @context is present and equals "https://schema.org"
 *   3. @type is present
 *   4. all required fields for the declared @type exist (per the
 *      REQUIRED_BY_TYPE map below)
 *
 * Exits with non-zero status if any file fails.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Required top-level fields per @type. Keep this minimal: only the fields
// that are genuinely necessary for the snippet to be useful, not every
// recommended field. When adding a new template, add an entry here.
const REQUIRED_BY_TYPE = {
  SoftwareApplication: ["name", "applicationCategory", "operatingSystem", "offers"],
  HowTo: ["name", "step"],
  HowToTip: ["text"],
  DefinedTerm: ["name", "description"],
  DefinedTermSet: ["name", "hasDefinedTerm"],
  FAQPage: ["mainEntity"],
  QAPage: ["mainEntity"],
  Dataset: ["name", "description", "creator", "distribution"],
  BreadcrumbList: ["itemListElement"],
  Organization: ["name", "url", "logo"],
  LocalBusiness: ["name", "address", "telephone"],
  BlogPosting: ["headline", "author", "publisher", "datePublished"],
  Article: ["headline", "author", "publisher", "datePublished"],
  ItemList: ["itemListElement"],
  ProfilePage: ["mainEntity"],
  Product: ["name", "offers"],
  Review: ["author", "itemReviewed", "reviewRating"],
  Event: ["name", "startDate", "location"],
  Service: ["name", "provider"],
  JobPosting: ["title", "description", "datePosted", "hiringOrganization"],
  Course: ["name", "description", "provider"],
  Recipe: ["name", "recipeIngredient", "recipeInstructions"],
  VideoObject: ["name", "description", "thumbnailUrl", "uploadDate"],
  WebSite: ["name", "url"],
};

const SCHEMA_CONTEXT = "https://schema.org";

function listJsonFiles(dir) {
  if (!statSync(dir, { throwIfNoEntry: false })) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => join(dir, f));
}

function checkFile(path) {
  const errors = [];
  const raw = readFileSync(path, "utf8");

  let doc;
  try {
    doc = JSON.parse(raw);
  } catch (err) {
    errors.push(`invalid JSON: ${err.message}`);
    return errors;
  }

  if (typeof doc !== "object" || doc === null || Array.isArray(doc)) {
    errors.push("top-level value must be a JSON object");
    return errors;
  }

  const ctx = doc["@context"];
  if (!ctx) {
    errors.push('missing "@context"');
  } else if (ctx !== SCHEMA_CONTEXT) {
    errors.push(`"@context" must be "${SCHEMA_CONTEXT}", got ${JSON.stringify(ctx)}`);
  }

  const type = doc["@type"];
  if (!type) {
    errors.push('missing "@type"');
    return errors;
  }
  if (typeof type !== "string") {
    errors.push('"@type" must be a string at the top level');
    return errors;
  }

  const required = REQUIRED_BY_TYPE[type];
  if (!required) {
    errors.push(
      `unknown @type "${type}" — add it to REQUIRED_BY_TYPE in validate.js`
    );
    return errors;
  }

  for (const field of required) {
    const v = doc[field];
    if (v === undefined || v === null) {
      errors.push(`missing required field "${field}" for @type "${type}"`);
      continue;
    }
    if (Array.isArray(v) && v.length === 0) {
      errors.push(`required field "${field}" for @type "${type}" is empty`);
    }
    if (typeof v === "string" && v.trim() === "") {
      errors.push(`required field "${field}" for @type "${type}" is blank`);
    }
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
