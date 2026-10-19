// "Schema Templates" — hosted free tool (Cloudflare Worker).
//
// Two jobs, both offline (no deps, no node:, no nodejs_compat needed):
//   1. Hand out copy-paste schema.org JSON-LD templates (the bundled
//      templates/*.json).
//   2. Validate pasted JSON-LD with ../src/validate.js, the check GeoSuite's
//      Schema Helper runs too (same golden cases on both sides).
//
// Routes:
//   GET  /                       → the page (web/page.js), locale from Accept-Language
//   GET  /en  /it                → the page in that locale
//   GET  /og.png                 → social share image
//   GET  /favicon.png  /favicon.ico  /favicon.svg  /apple-touch-icon.png
//                                → GeoSuite's favicon (the PNG on every path;
//                                  /favicon.svg is the old link, kept alive)
//   GET  /logos/{chatgpt,gemini,perplexity}.svg → engine logos in the CTA
//   GET  /api/templates          → ["Article", "Organization", …]
//   GET  /api/template?type=X     → { type, json }
//   POST /api/validate  (body=JSON-LD text) → { ok, errors, items[, parseError] }

import { TEMPLATES } from './templates-bundle.js';
import { renderPage } from './page.js';
import { validateJsonLd } from '../src/validate.js';
import OG_PNG from './og.png'; // bundled as ArrayBuffer via the wrangler "Data" rule
import FAVICON_PNG from './favicon.png'; // GeoSuite's official favicon, 96px
import APPLE_TOUCH_PNG from './apple-touch-icon.png'; // the same, 180px
import LOGO_CHATGPT from './logos/chatgpt.svg'; // bundled as text via the "Text" rule
import LOGO_GEMINI from './logos/gemini.svg';
import LOGO_PERPLEXITY from './logos/perplexity.svg';

const ENGINE_LOGOS = { chatgpt: LOGO_CHATGPT, gemini: LOGO_GEMINI, perplexity: LOGO_PERPLEXITY };

// '/it' → 'it', '/en' → 'en', '/' → first Accept-Language tag (it → 'it', else 'en').
function pickLang(request, path) {
  if (path === '/it') return 'it';
  if (path === '/en') return 'en';
  const first = (request.headers.get('accept-language') || '').split(',')[0].trim().toLowerCase();
  return first.startsWith('it') ? 'it' : 'en';
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
    if (path === '/favicon.png' || path === '/favicon.ico' || path === '/favicon.svg' || path === '/apple-touch-icon.png') {
      return new Response(path === '/apple-touch-icon.png' ? APPLE_TOUCH_PNG : FAVICON_PNG, {
        headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=86400' },
      });
    }
    const logo = path.match(/^\/logos\/(chatgpt|gemini|perplexity)\.svg$/);
    if (logo) {
      return new Response(ENGINE_LOGOS[logo[1]], {
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
      return json(validateJsonLd(await request.text()));
    }

    if (path === '/' || path === '/en' || path === '/it') {
      const lang = pickLang(request, path);
      const headers = {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      };
      // '/' is content-negotiated, so it must not be cached language-agnostically.
      if (path === '/') headers['vary'] = 'Accept-Language';
      return new Response(renderPage(lang, Object.keys(TEMPLATES).length), { headers });
    }

    return new Response('Not found', { status: 404 });
  },
};
