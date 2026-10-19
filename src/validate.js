// The JSON-LD structural check, shared by validate.js (the repo check), the
// web tool (web/worker.js) and anyone importing the package.
//
// GeoSuite's Schema Helper runs the same check on every JSON-LD block it finds
// on a page (backend/services/tools/schema_helper_service.py, `validate_jsonld`
// and `_validate`). The two must give the same answer for the same input:
// test/fixtures/golden.json holds the cases, and both repos run them (GeoSuite
// keeps a copy in backend/tests/fixtures/schema_templates_golden.json). Change a
// rule here, update the fixture, then port the change and copy the fixture there.
//
// Pure functions, no `node:` imports: the Cloudflare Worker bundles this file.

export const SCHEMA_CONTEXT = 'https://schema.org';

// The @context values we accept: schema.org over https or http, with or
// without the trailing slash. Any non-string @context (an array or an object,
// both valid JSON-LD) is accepted as is.
const ACCEPTED_CONTEXTS = new Set(['https://schema.org', 'http://schema.org']);

const PLACEHOLDER = /\{\{[A-Z0-9_]+\}\}/;

// Required top-level fields per @type. Keep this minimal: only the fields
// that are genuinely necessary for the snippet to be useful, not every
// recommended field. When adding a new template, add an entry here.
export const REQUIRED_BY_TYPE = {
  Article: ['headline', 'author', 'publisher', 'datePublished'],
  BlogPosting: ['headline', 'author', 'publisher', 'datePublished'],
  BreadcrumbList: ['itemListElement'],
  Course: ['name', 'description', 'provider'],
  Dataset: ['name', 'description', 'creator', 'distribution'],
  DefinedTerm: ['name', 'description'],
  DefinedTermSet: ['name', 'hasDefinedTerm'],
  Event: ['name', 'startDate', 'location'],
  FAQPage: ['mainEntity'],
  HowTo: ['name', 'step'],
  HowToTip: ['text'],
  ItemList: ['itemListElement'],
  JobPosting: ['title', 'description', 'datePosted', 'hiringOrganization'],
  LocalBusiness: ['name', 'address', 'telephone'],
  Organization: ['name', 'url', 'logo'],
  Product: ['name', 'offers'],
  ProfilePage: ['mainEntity'],
  QAPage: ['mainEntity'],
  Recipe: ['name', 'recipeIngredient', 'recipeInstructions'],
  Review: ['author', 'itemReviewed', 'reviewRating'],
  Service: ['name', 'provider'],
  SoftwareApplication: ['name', 'applicationCategory', 'operatingSystem', 'offers'],
  VideoObject: ['name', 'description', 'thumbnailUrl', 'uploadDate'],
  WebSite: ['name', 'url'],
};

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// Absent, null, '', [] and {} all count as "not there" (Python's falsy, so
// the platform port reads the same).
function isEmpty(v) {
  if (v === undefined || v === null || v === '') return true;
  if (Array.isArray(v)) return v.length === 0;
  if (isObject(v)) return Object.keys(v).length === 0;
  return false;
}

function hasPlaceholder(node) {
  if (typeof node === 'string') return PLACEHOLDER.test(node);
  if (Array.isArray(node)) return node.some(hasPlaceholder);
  if (isObject(node)) return Object.values(node).some(hasPlaceholder);
  return false;
}

/**
 * The label of a node: its @type, or the first string of an @type list.
 * Null when there is none.
 */
export function nodeType(node) {
  const raw = node['@type'];
  const types = typeof raw === 'string' ? [raw] : Array.isArray(raw) ? raw : [];
  const first = types.find((t) => typeof t === 'string' && t.trim() !== '');
  return first === undefined ? null : first;
}

/**
 * Every JSON-LD object in a parsed document: arrays and @graph are expanded,
 * and a node inherits the @context of the wrapper it sits in (that is how
 * JSON-LD works, and how most CMSs ship it).
 * @returns {Array<{ node: object, context: unknown }>}
 */
export function flattenJsonLd(doc, context) {
  if (Array.isArray(doc)) return doc.flatMap((item) => flattenJsonLd(item, context));
  if (!isObject(doc)) return [];
  const own = isEmpty(doc['@context']) ? context : doc['@context'];
  if (Array.isArray(doc['@graph'])) return doc['@graph'].flatMap((item) => flattenJsonLd(item, own));
  return [{ node: doc, context: own }];
}

/**
 * Checks one JSON-LD object. `context` is the @context it inherits.
 * Unknown @types are not an error: schema.org has hundreds, we only know the
 * required fields of the ones we ship a template for.
 * @returns {{ type: string, valid: boolean, errors: string[] }}
 */
export function validateNode(node, context, { placeholders = true } = {}) {
  const errors = [];
  const ctx = isEmpty(node['@context']) ? context : node['@context'];
  if (isEmpty(ctx)) errors.push('missing "@context"');
  else if (typeof ctx === 'string' && !ACCEPTED_CONTEXTS.has(ctx.replace(/\/+$/, ''))) {
    errors.push('unexpected "@context": ' + JSON.stringify(ctx));
  }

  const type = nodeType(node);
  if (type === null) {
    errors.push('missing "@type"');
    return { type: 'Unknown', valid: false, errors };
  }

  for (const field of REQUIRED_BY_TYPE[type] || []) {
    const v = node[field];
    if (v === undefined || v === null) errors.push('missing required field "' + field + '" for @type "' + type + '"');
    else if (Array.isArray(v) && v.length === 0) errors.push('required field "' + field + '" for @type "' + type + '" is empty');
    else if (typeof v === 'string' && v.trim() === '') errors.push('required field "' + field + '" for @type "' + type + '" is blank');
  }

  if (placeholders && hasPlaceholder(node)) errors.push('still contains unfilled {{PLACEHOLDER}} tokens');

  return { type, valid: errors.length === 0, errors };
}

/**
 * Checks a pasted JSON-LD text: one object, an array or a @graph.
 * `errors` is every node's errors in order; `items` has them per node.
 * `parseError` is the parser's own message when the text is not JSON (it
 * depends on the engine, so it is kept apart from `errors`).
 * @returns {{ ok: boolean, errors: string[], items: Array<{type: string, valid: boolean, errors: string[]}>, parseError?: string }}
 */
export function validateJsonLd(text, opts = {}) {
  if (typeof text !== 'string' || !text.trim()) return { ok: false, errors: ['empty input'], items: [] };
  let doc;
  try {
    doc = JSON.parse(text);
  } catch (e) {
    return { ok: false, errors: ['invalid JSON'], items: [], parseError: e.message };
  }
  const items = flattenJsonLd(doc).map(({ node, context }) => validateNode(node, context, opts));
  if (!items.length) return { ok: false, errors: ['no JSON-LD object found'], items };
  const errors = items.flatMap((item) => item.errors);
  return { ok: errors.length === 0, errors, items };
}
