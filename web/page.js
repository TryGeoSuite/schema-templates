// The single-page UI served at `/`, `/en`, `/it`. Bilingual (en/it): the worker
// picks a locale and calls renderPage(lang, typeCount); all visitor-facing copy
// lives in the S dictionary below. schema.org type NAMES and JSON-LD
// template/sample content are product content: they stay verbatim, never
// translated.
//
// It wears GeoSuite's design (theme.js, copied from the hub at
// tools.trygeosuite.it), so the tool reads as part of the same site. Fonts come
// from Google Fonts, the engine logos and favicon from this Worker; CSS and JS
// are inline. The inline <script> reads its visitor-visible strings from a
// JSON-serialised I18N blob injected just before it.

import { FONTS, BASE_CSS, ENGINES } from './theme.js';

const BASE = 'https://schema-templates.geosuite.workers.dev';
const HUB = 'https://tools.trygeosuite.it';
const GITHUB = 'https://github.com/TryGeoSuite/schema-templates';
const NPM = 'https://www.npmjs.com/package/@geosuite/schema-templates';
const ANALYSIS = 'https://trygeosuite.it/analisi-gratuita?utm_source=geosuite-open&utm_medium=tool&utm_campaign=schema-templates';
const CLI = 'npx @geosuite/schema-templates show';

// State icons (copied from geo-toolkit/check-page.js), always next to a text
// verdict, never the only signal.
const ICONS = {
  ok: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9"/><path d="M6 10.5l2.6 2.6L14 7.7" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  missing: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9"/><path d="M7 7l6 6M13 7l-6 6" fill="none" stroke-width="2" stroke-linecap="round"/></svg>',
};
// Line icon, drawn with currentColor: decoration next to the label.
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"><path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>';

const S = {
  en: {
    title: 'Schema Templates: copy-paste schema.org JSON-LD and a validator',
    desc: 'Ready-to-use schema.org JSON-LD templates (Organization, Product, FAQPage, Article…) plus a free validator for your own structured data.',
    tools: 'Free tools',
    eyebrow: 'A free GeoSuite tool',
    h1: 'Schema Templates',
    lead: 'Copy-paste <a href="https://schema.org" target="_blank" rel="noopener">schema.org</a> JSON-LD templates (Organization, Product, FAQPage, Article and more), and validate your own structured data before it goes live.',
    facts: ['Free', 'No sign-up', 'Open source (MIT)'],
    typeCount: (n) => `<strong>${n}</strong> schema.org types`,
    termLabel: 'Also in your terminal',
    termNote: 'A zero-dependency CLI on npm: <code>list</code> shows every type, <code>show</code> prints one.',
    star: 'Star on GitHub',
    secTemplate: 'Get a template',
    placeholderHint: 'Pick a type, copy the JSON-LD, then replace the <code>{{PLACEHOLDERS}}</code> with your values.',
    typeLabel: 'Schema type',
    codeLabel: 'JSON-LD template',
    copy: 'Copy',
    download: 'Download',
    secValidate: 'Validate your JSON-LD',
    inLabel: 'Your JSON-LD',
    inPlaceholder: 'Paste your JSON-LD here, e.g. { "@context": "https://schema.org", "@type": "Organization", ... }',
    validate: 'Validate',
    validateHint: 'Checks the JSON, @context, @type, the required fields and leftover placeholders.',
    ctaTitle: 'Readable is step one. Recommended is the goal.',
    ctaText: 'Structured data tells AI what your business is. GeoSuite checks whether ChatGPT, Gemini and Perplexity actually recommend it: it asks them the questions your customers really ask, and tells you where you appear, who wins instead and what to fix first. The report arrives by email.',
    ctaButton: 'Get the free analysis',
    footerOpen: `Open source (MIT) by <a href="https://github.com/matte97p">Matteo Perino</a>, maintained under <a href="https://trygeosuite.it">GeoSuite</a>, the Italian platform for AI visibility.`,
    footerBuilt: `Code on <a href="${GITHUB}">GitHub</a>, package on <a href="${NPM}">npm</a>.`,
    js: {
      loading: 'Loading…',
      loadFailed: 'Failed to load.',
      copied: 'Copied',
      copy: 'Copy',
      copyLabel: 'Copy the command',
      validating: 'Validating…',
      valid: 'Valid: passes the structural checks.',
      issuesPre: '',
      issuesPost: ' issue(s) to fix:',
      networkError: 'Network error, try again.',
    },
  },
  it: {
    title: 'Schema Templates: JSON-LD schema.org da copiare e un validatore',
    desc: 'Template JSON-LD schema.org pronti all\'uso (Organization, Product, FAQPage, Article…) più un validatore gratuito per i tuoi dati strutturati.',
    tools: 'Strumenti gratuiti',
    eyebrow: 'Uno strumento gratuito di GeoSuite',
    h1: 'Schema Templates',
    lead: 'Template JSON-LD <a href="https://schema.org" target="_blank" rel="noopener">schema.org</a> pronti da copiare (Organization, Product, FAQPage, Article e altri), e un validatore per controllare i tuoi dati strutturati prima di pubblicarli.',
    facts: ['Gratis', 'Senza registrazione', 'Open source (MIT)'],
    typeCount: (n) => `<strong>${n}</strong> tipi schema.org`,
    termLabel: 'Anche dal terminale',
    termNote: 'Una CLI su npm senza dipendenze: <code>list</code> elenca tutti i tipi, <code>show</code> ne stampa uno.',
    star: 'Metti una stella su GitHub',
    secTemplate: 'Scegli un template',
    placeholderHint: 'Scegli un tipo, copia il JSON-LD e sostituisci i <code>{{PLACEHOLDERS}}</code> con i tuoi valori.',
    typeLabel: 'Tipo di schema',
    codeLabel: 'Template JSON-LD',
    copy: 'Copia',
    download: 'Scarica',
    secValidate: 'Valida il tuo JSON-LD',
    inLabel: 'Il tuo JSON-LD',
    inPlaceholder: 'Incolla qui il tuo JSON-LD, ad esempio { "@context": "https://schema.org", "@type": "Organization", ... }',
    validate: 'Valida',
    validateHint: 'Controlla il JSON, @context, @type, i campi obbligatori e i placeholder rimasti.',
    ctaTitle: 'Farsi leggere è il primo passo. Farsi consigliare è l’obiettivo.',
    ctaText: 'I dati strutturati dicono alle AI chi sei. GeoSuite verifica se ChatGPT, Gemini e Perplexity ti consigliano davvero: fa loro le domande che fanno i tuoi clienti e ti dice dove compari, chi vince al posto tuo e cosa correggere per primo. Il report arriva via mail.',
    ctaButton: 'Richiedi l’analisi gratuita',
    footerOpen: `Open source (MIT) di <a href="https://github.com/matte97p">Matteo Perino</a>, mantenuto da <a href="https://trygeosuite.it">GeoSuite</a>, la piattaforma italiana per la visibilità sulle AI.`,
    footerBuilt: `Codice su <a href="${GITHUB}">GitHub</a>, pacchetto su <a href="${NPM}">npm</a>.`,
    js: {
      loading: 'Caricamento…',
      loadFailed: 'Caricamento fallito.',
      copied: 'Copiato',
      copy: 'Copia',
      copyLabel: 'Copia il comando',
      validating: 'Validazione…',
      valid: 'Valido: supera i controlli strutturali.',
      issuesPre: 'Problemi da correggere: ',
      issuesPost: '',
      networkError: 'Errore di rete, riprova.',
    },
  },
};

const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// JSON for an inline <script>: `<` escaped so no string can close the tag.
const inlineJson = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

// lang: 'en' | 'it'. typeCount: how many templates the Worker bundles (the
// facts line drops it when absent).
export function renderPage(lang, typeCount) {
  const t = S[lang] || S.en;
  const facts = t.facts.map((f) => `<li>${ICONS.ok}${f}</li>`);
  if (typeCount) facts.push(`<li>${ICONS.ok}${t.typeCount(typeCount)}</li>`);

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.title}</title>
<meta name="description" content="${t.desc}">
<link rel="canonical" href="${BASE}/${lang}">
<link rel="alternate" hreflang="en" href="${BASE}/en">
<link rel="alternate" hreflang="it" href="${BASE}/it">
<link rel="alternate" hreflang="x-default" href="${BASE}/">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GeoSuite Open">
<meta property="og:title" content="${t.title}">
<meta property="og:description" content="${t.desc}">
<meta property="og:url" content="${BASE}/${lang}">
<meta property="og:image" content="${BASE}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${lang === 'it' ? 'it_IT' : 'en_US'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t.title}">
<meta name="twitter:description" content="${t.desc}">
<meta name="twitter:image" content="${BASE}/og.png">
${FONTS}
<style>
${BASE_CSS}
  :root { color-scheme:light; }
  @media (prefers-color-scheme: dark) { :root { color-scheme:dark; } }
  .sr { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
  code, pre, textarea { font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  p code, li code { font-size:.875em; background:var(--sunk); padding:1px 5px; border-radius:4px; }
  .lead a { color:var(--accent-ink); }

  .hero > * { min-width:0; }
  .term { padding:20px; }
  .term .label { margin-bottom:12px; }
  .term p { color:var(--ink-2); font-size:.9375rem; margin:0 0 16px; }
  .cmd { display:flex; align-items:center; gap:8px; padding:4px 4px 4px 12px; background:var(--surface-2); border:1px solid var(--line); border-radius:8px; margin:0 0 14px; }
  .cmd code { flex:1; min-width:0; overflow-x:auto; white-space:nowrap; color:var(--ink-2); font-size:.8125rem; padding:6px 0; }
  .term .cmd code { white-space:normal; overflow-wrap:anywhere; }
  .cmd button { flex:none; min-height:36px; padding:4px 12px; font-size:.8125rem; }
  a.ghost { display:inline-flex; align-items:center; gap:6px; text-decoration:none; }
  a.ghost svg { width:16px; height:16px; }

  .tool { padding:24px; margin-top:24px; }
  .tool:first-of-type { margin-top:40px; }
  .tool h2 { font-size:1.375rem; line-height:1.25; letter-spacing:-.015em; margin:0 0 6px; }
  .tool .sub { color:var(--ink-2); margin:0 0 20px; max-width:62ch; }
  .pick { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .pick label { font-weight:600; font-size:.9375rem; }
  select { height:44px; min-width:260px; padding:0 12px; background:var(--surface); color:var(--ink); border:1px solid var(--line-2); border-radius:8px; font:inherit; font-size:1rem; }
  .codehead { display:flex; align-items:center; gap:8px; margin:20px 0 8px; }
  .codehead .tname { margin-right:auto; min-width:0; overflow-wrap:anywhere; font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size:.875rem; font-weight:600; color:var(--ink-2); }
  pre.code { margin:0; padding:16px; background:var(--surface-2); border:1px solid var(--line); border-radius:8px; overflow:auto; max-height:440px; font-size:.8125rem; line-height:1.6; white-space:pre; color:var(--ink); tab-size:2; }
  textarea { display:block; width:100%; min-height:180px; padding:14px; background:var(--surface); color:var(--ink); border:1px solid var(--line-2); border-radius:8px; font-size:.8125rem; line-height:1.6; resize:vertical; }
  textarea::placeholder { color:var(--ink-3); }
  .valrow { display:flex; align-items:center; gap:16px; flex-wrap:wrap; margin-top:12px; }
  .valrow .hint { color:var(--ink-3); font-size:.875rem; margin:0; flex:1; min-width:200px; }

  .verdict { margin-top:16px; padding:14px 16px; border:1px solid var(--line); border-left-width:3px; border-radius:8px; background:var(--surface-2); font-size:.9375rem; }
  .verdict:empty { display:none; }
  .verdict .v-head { display:flex; align-items:center; gap:8px; margin:0; font-weight:600; }
  .verdict svg { width:18px; height:18px; flex:none; }
  .verdict svg path { stroke:#fff; }
  .verdict.wait { color:var(--ink-3); }
  .verdict.ok { background:var(--ok-soft); border-left-color:var(--ok); }
  .verdict.ok .v-head { color:var(--ok); }
  .verdict.ok svg circle { fill:var(--ok); }
  .verdict.bad { background:var(--crit-soft); border-left-color:var(--crit); }
  .verdict.bad .v-head { color:var(--crit); }
  .verdict.bad svg circle { fill:var(--crit); }
  .verdict ul { margin:8px 0 0; padding-left:24px; color:var(--ink-2); }
  .verdict li { margin:2px 0; overflow-wrap:anywhere; }

  .cta { margin-top:32px; }
  @media (max-width:640px) {
    .tool { padding:18px; }
    .tool:first-of-type { margin-top:32px; }
    .pick select { flex:1 1 100%; min-width:0; width:100%; }
  }
</style>
</head>
<body>
<div class="wrap">
  <header class="bar">
    <a class="brand" href="https://trygeosuite.it">GeoSuite</a>
    <nav aria-label="Language">
      <a href="${HUB}/${lang}">${t.tools}</a>
      <a href="/en"${lang === 'en' ? ' aria-current="page"' : ''} hreflang="en">EN</a>
      <a href="/it"${lang === 'it' ? ' aria-current="page"' : ''} hreflang="it">IT</a>
    </nav>
  </header>

  <main>
    <div class="hero">
      <div>
        <p class="eyebrow">${t.eyebrow}</p>
        <h1>${t.h1}</h1>
        <p class="lead">${t.lead}</p>
        <ul class="facts">${facts.join('')}</ul>
      </div>
      <aside class="panel term">
        <p class="label">${t.termLabel}</p>
        <div class="cmd"><code id="cli">${CLI} Organization</code></div>
        <p>${t.termNote}</p>
        <a class="ghost" href="${GITHUB}" target="_blank" rel="noopener">${STAR}${t.star}</a>
      </aside>
    </div>

    <section class="panel tool" aria-labelledby="sec-template">
      <h2 id="sec-template">${t.secTemplate}</h2>
      <p class="sub">${t.placeholderHint}</p>
      <div class="pick">
        <label for="type">${t.typeLabel}</label>
        <select id="type"><option>${t.js.loading}</option></select>
      </div>
      <div class="codehead">
        <span class="tname" id="tname"></span>
        <button class="ghost" id="copy" type="button">${t.copy}</button>
        <button class="ghost" id="dl" type="button">${t.download}</button>
      </div>
      <pre class="code" id="tpl" tabindex="0" aria-label="${t.codeLabel}">…</pre>
    </section>

    <section class="panel tool" aria-labelledby="sec-validate">
      <h2 id="sec-validate">${t.secValidate}</h2>
      <label class="sr" for="in">${t.inLabel}</label>
      <textarea id="in" spellcheck="false" placeholder="${attr(t.inPlaceholder)}"></textarea>
      <div class="valrow">
        <button class="primary" id="val" type="button">${t.validate}</button>
        <p class="hint">${t.validateHint}</p>
      </div>
      <div id="vout" aria-live="polite"></div>
    </section>

    <section class="panel cta">
      <div>
        <h2>${t.ctaTitle}</h2>
        <p>${t.ctaText}</p>
        ${ENGINES}
      </div>
      <a class="primary" href="${ANALYSIS}" target="_blank" rel="noopener">${t.ctaButton}</a>
    </section>
  </main>

  <footer>${t.footerOpen} ${t.footerBuilt}</footer>
</div>

<script>var I18N = ${inlineJson(t.js)}; var ICONS = ${inlineJson(ICONS)}; var CLI = ${inlineJson(CLI)};</script>
<script>
  var sel = document.getElementById('type');
  var tpl = document.getElementById('tpl');
  var tname = document.getElementById('tname');
  var cli = document.getElementById('cli');
  var current = '';

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function loadTemplate(type){
    tpl.textContent = I18N.loading;
    cli.textContent = CLI + ' ' + type;
    fetch('/api/template?type=' + encodeURIComponent(type))
      .then(function(r){ return r.json(); })
      .then(function(d){ current = d.json || ''; tpl.textContent = current; tname.textContent = type; })
      .catch(function(){ tpl.textContent = I18N.loadFailed; });
  }

  fetch('/api/templates').then(function(r){ return r.json(); }).then(function(types){
    sel.innerHTML = '';
    types.forEach(function(t){ var o = document.createElement('option'); o.value = t; o.textContent = t; sel.appendChild(o); });
    var initial = (types.indexOf('Organization') >= 0) ? 'Organization' : types[0];
    sel.value = initial; loadTemplate(initial);
  });

  sel.addEventListener('change', function(){ loadTemplate(sel.value); });

  function copied(b, label){
    b.textContent = I18N.copied; setTimeout(function(){ b.textContent = label; }, 1500);
  }

  document.getElementById('copy').addEventListener('click', function(){
    var b = this;
    navigator.clipboard.writeText(current).then(function(){ copied(b, I18N.copy); }).catch(function(){});
  });
  document.getElementById('dl').addEventListener('click', function(){
    var blob = new Blob([current], { type: 'application/ld+json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (sel.value || 'schema') + '.jsonld';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
  });

  // The CLI command box gets its copy button only where the clipboard exists.
  if (navigator.clipboard) {
    var cb = document.createElement('button');
    cb.type = 'button'; cb.className = 'ghost'; cb.textContent = I18N.copy; cb.setAttribute('aria-label', I18N.copyLabel);
    cb.addEventListener('click', function(){
      navigator.clipboard.writeText(cli.textContent.trim()).then(function(){ copied(cb, I18N.copy); }).catch(function(){});
    });
    cli.parentNode.appendChild(cb);
  }

  document.getElementById('val').addEventListener('click', function(){
    var vout = document.getElementById('vout');
    var body = document.getElementById('in').value;
    vout.innerHTML = '<div class="verdict wait"><p class="v-head">' + I18N.validating + '</p></div>';
    fetch('/api/validate', { method: 'POST', body: body })
      .then(function(r){ return r.json(); })
      .then(function(d){
        if (d.ok){ vout.innerHTML = '<div class="verdict ok"><p class="v-head">' + ICONS.ok + '<span>' + I18N.valid + '</span></p></div>'; return; }
        var items = (d.errors || []).map(function(e){ return '<li>' + esc(e) + '</li>'; }).join('');
        vout.innerHTML = '<div class="verdict bad"><p class="v-head">' + ICONS.missing + '<span>' + I18N.issuesPre + (d.errors || []).length + I18N.issuesPost + '</span></p><ul>' + items + '</ul></div>';
      })
      .catch(function(){ vout.innerHTML = '<div class="verdict bad"><p class="v-head">' + ICONS.missing + '<span>' + I18N.networkError + '</span></p></div>'; });
  });
</script>
</body>
</html>`;
}
