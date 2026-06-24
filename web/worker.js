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
//   GET  /                       → the page (web/page.js), locale from Accept-Language
//   GET  /en  /it                → the page in that locale
//   GET  /og.png  /favicon.svg    → social/share assets
//   GET  /api/templates          → ["Article", "Organization", …]
//   GET  /api/template?type=X     → { type, json }
//   POST /api/validate  (body=JSON-LD text) → { ok, errors }

import { TEMPLATES } from './templates-bundle.js';
import { renderPage } from './page.js';
import OG_PNG from './og.png'; // bundled as ArrayBuffer via the wrangler "Data" rule

const SCHEMA_CONTEXT = 'https://schema.org';

// A geo "location pin" mark in the GeoSuite accent — inline SVG, no binary.
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0b0f17"/><path d="M32 13c-8.3 0-15 6.4-15 14.6C17 38 32 51 32 51s15-13 15-23.4C47 19.4 40.3 13 32 13z" fill="#5b8def"/><circle cx="32" cy="27.5" r="5.6" fill="#0b0f17"/></svg>`;

// '/it' → 'it', '/en' → 'en', '/' → first Accept-Language tag (it → 'it', else 'en').
function pickLang(request, path) {
  if (path === '/it') return 'it';
  if (path === '/en') return 'en';
  const first = (request.headers.get('accept-language') || '').split(',')[0].trim().toLowerCase();
  return first.startsWith('it') ? 'it' : 'en';
}

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
    const path = url.pathname;

    // --- Static assets ---
    if (path === '/og.png') {
      return new Response(OG_PNG, {
        headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=86400' },
      });
    }
    if (path === '/favicon.svg') {
      return new Response(FAVICON, {
        headers: { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'public, max-age=86400' },
      });
    }

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

    if (path === '/' || path === '/en' || path === '/it') {
      const lang = pickLang(request, path);
      const headers = {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      };
      // '/' is content-negotiated, so it must not be cached language-agnostically.
      if (path === '/') headers['vary'] = 'Accept-Language';
      return new Response(renderPage(lang), { headers });
    }

    return new Response('Not found', { status: 404 });
  },
};
