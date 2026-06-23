// "Schema Templates" — hosted free tool (Cloudflare Worker).
//
// Two jobs, both offline (no deps, no node:, no nodejs_compat needed):
//   1. Hand out copy-paste schema.org JSON-LD templates (the bundled
//      templates/*.json).
//   2. Validate pasted JSON-LD with the same structural checks as the repo's
//      validate.js (reimplemented here as a pure function — keep REQUIRED_BY_TYPE
//      in sync with validate.js).
//
// Routes:
//   GET  /                       → the page (web/page.js)
//   GET  /api/templates          → ["Article", "Organization", …]
//   GET  /api/template?type=X     → { type, json }
//   POST /api/validate  (body=JSON-LD text) → { ok, errors }

import { TEMPLATES } from './templates-bundle.js';
import { PAGE } from './page.js';

const SCHEMA_CONTEXT = 'https://schema.org';

// Mirror of REQUIRED_BY_TYPE in ../validate.js — keep in sync when that changes.
const REQUIRED_BY_TYPE = {
  SoftwareApplication: ['name', 'applicationCategory', 'operatingSystem', 'offers'],
  HowTo: ['name', 'step'],
  HowToTip: ['text'],
  DefinedTerm: ['name', 'description'],
  DefinedTermSet: ['name', 'hasDefinedTerm'],
  FAQPage: ['mainEntity'],
  QAPage: ['mainEntity'],
  Dataset: ['name', 'description', 'creator', 'distribution'],
  BreadcrumbList: ['itemListElement'],
  Organization: ['name', 'url', 'logo'],
  LocalBusiness: ['name', 'address', 'telephone'],
  BlogPosting: ['headline', 'author', 'publisher', 'datePublished'],
  Article: ['headline', 'author', 'publisher', 'datePublished'],
  ItemList: ['itemListElement'],
  ProfilePage: ['mainEntity'],
  Product: ['name', 'offers'],
  Review: ['author', 'itemReviewed', 'reviewRating'],
  Event: ['name', 'startDate', 'location'],
  Service: ['name', 'provider'],
  JobPosting: ['title', 'description', 'datePosted', 'hiringOrganization'],
  Course: ['name', 'description', 'provider'],
  Recipe: ['name', 'recipeIngredient', 'recipeInstructions'],
  VideoObject: ['name', 'description', 'thumbnailUrl', 'uploadDate'],
  WebSite: ['name', 'url'],
};

function validateJsonLd(text) {
  const errors = [];
  let doc;
  try {
    doc = JSON.parse(text);
  } catch (e) {
    return { ok: false, errors: ['invalid JSON: ' + e.message] };
  }
  if (typeof doc !== 'object' || doc === null || Array.isArray(doc)) {
    return { ok: false, errors: ['top-level value must be a JSON object'] };
  }

  const ctx = doc['@context'];
  if (!ctx) errors.push('missing "@context"');
  else if (ctx !== SCHEMA_CONTEXT) errors.push('"@context" must be "' + SCHEMA_CONTEXT + '", got ' + JSON.stringify(ctx));

  const type = doc['@type'];
  if (!type) return { ok: false, errors: errors.concat('missing "@type"') };
  if (typeof type !== 'string') return { ok: false, errors: errors.concat('"@type" must be a string at the top level') };

  const required = REQUIRED_BY_TYPE[type];
  if (!required) return { ok: false, errors: errors.concat('unknown @type "' + type + '" (not in the template set)') };

  for (const field of required) {
    const v = doc[field];
    if (v === undefined || v === null) {
      errors.push('missing required field "' + field + '" for @type "' + type + '"');
      continue;
    }
    if (Array.isArray(v) && v.length === 0) errors.push('required field "' + field + '" for @type "' + type + '" is empty');
    if (typeof v === 'string' && v.trim() === '') errors.push('required field "' + field + '" for @type "' + type + '" is blank');
  }

  if (/\{\{[A-Z0-9_]+\}\}/.test(text)) errors.push('still contains unfilled {{PLACEHOLDER}} tokens');

  return { ok: errors.length === 0, errors };
}

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'cache-control': 'public, max-age=300',
};
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: JSON_HEADERS });

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/api/templates') {
      return json(Object.keys(TEMPLATES).sort());
    }

    if (url.pathname === '/api/template') {
      const type = url.searchParams.get('type');
      const tpl = type && TEMPLATES[type];
      if (!tpl) return json({ error: 'unknown template type: ' + type }, 404);
      return json({ type, json: JSON.stringify(tpl, null, 2) });
    }

    if (url.pathname === '/api/validate') {
      if (request.method !== 'POST') return json({ error: 'POST your JSON-LD as the request body.' }, 405);
      const text = await request.text();
      if (!text.trim()) return json({ ok: false, errors: ['empty input'] });
      return json(validateJsonLd(text));
    }

    if (url.pathname === '/') {
      return new Response(PAGE, {
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
