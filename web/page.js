// The single-page UI served at `/`. Plain template string (no `${}`, no inner
// backticks). All CSS/JS inline; no external assets.

export const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Schema Templates — copy-paste schema.org JSON-LD + validator</title>
<meta name="description" content="Ready-to-use schema.org JSON-LD templates (Organization, Product, FAQPage, Article…) plus a free validator for your own structured data.">
<style>
  :root {
    --bg: #0b0f17; --panel: #131a26; --line: #243042; --text: #e7edf5;
    --muted: #8b9bb4; --accent: #5b8def; --green: #3fb96b; --red: #e5544b;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--text);
    font: 16px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 820px; margin: 0 auto; padding: 48px 20px 80px; }
  header h1 { font-size: 1.7rem; margin: 0 0 6px; letter-spacing: -0.02em; }
  header p { color: var(--muted); margin: 0 0 24px; }
  .promo { margin: 0 0 26px; padding: 18px 20px; border: 1px solid var(--line); border-radius: 14px; background: var(--panel); display: flex; align-items: center; gap: 18px; justify-content: space-between; flex-wrap: wrap; }
  .promo .txt { font-size: .98rem; color: var(--text); flex: 1; min-width: 220px; }
  .promo .txt strong { color: var(--accent); }
  .promo-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  .promo-cta { background: var(--accent); color: #fff; font-weight: 600; font-size: .95rem; padding: 11px 18px; border-radius: 10px; text-decoration: none; white-space: nowrap; }
  .promo-cta:hover { opacity: .9; }
  .gh { font-size: .95rem; font-weight: 600; padding: 9px 16px; border: 1px solid var(--accent); border-radius: 9px; color: var(--accent); text-decoration: none; white-space: nowrap; }
  .gh:hover { background: var(--accent); color: #fff; }
  h2.sec { font-size: 1.05rem; margin: 30px 0 12px; }
  .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  select, textarea {
    background: var(--panel); color: var(--text); border: 1px solid var(--line); border-radius: 10px; font-size: 1rem;
  }
  select { padding: 11px 13px; min-width: 220px; }
  select:focus, textarea:focus { outline: none; border-color: var(--accent); }
  button {
    padding: 11px 18px; border-radius: 10px; border: 0; background: var(--accent);
    color: #fff; font-size: .95rem; font-weight: 600; cursor: pointer; white-space: nowrap;
  }
  .ghost { background: transparent; border: 1px solid var(--line); color: var(--text); }
  .ghost:hover { border-color: var(--accent); color: var(--accent); }
  .card { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 16px; margin-top: 12px; }
  .bar { display: flex; gap: 8px; margin-bottom: 10px; }
  .bar .grow { margin-right: auto; color: var(--muted); font-size: .9rem; align-self: center; }
  pre.code {
    margin: 0; padding: 16px; border-radius: 10px; background: #0c121c; border: 1px solid var(--line);
    overflow: auto; max-height: 420px; font-size: .85rem; line-height: 1.5;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; white-space: pre; color: #cdd9ea;
  }
  textarea#in { width: 100%; min-height: 150px; padding: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: .85rem; }
  .verdict { margin-top: 12px; padding: 12px 14px; border-radius: 10px; font-size: .92rem; }
  .ok { background: rgba(63,185,107,.12); border: 1px solid rgba(63,185,107,.4); color: #a9e6c0; }
  .bad { background: rgba(229,84,75,.12); border: 1px solid rgba(229,84,75,.4); color: #f2b6b1; }
  .bad ul { margin: 6px 0 0; padding-left: 18px; }
  footer { margin-top: 36px; color: var(--muted); font-size: .85rem; text-align: center; }
  footer a { color: var(--accent); text-decoration: none; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>🔖 Schema Templates</h1>
    <p>Copy-paste <a href="https://schema.org" target="_blank" rel="noopener" style="color:var(--accent)">schema.org</a> JSON-LD templates — and validate your own structured data.</p>
  </header>

  <div class="promo">
    <div class="txt"><strong>Built by GeoSuite</strong> — the AI-visibility platform that measures &amp; improves how ChatGPT, Gemini, Claude &amp; Perplexity describe your brand.</div>
    <div class="promo-actions">
      <a class="promo-cta" href="https://trygeosuite.it" target="_blank" rel="noopener">Explore GeoSuite →</a>
      <a class="gh" href="https://github.com/TryGeoSuite/schema-templates" target="_blank" rel="noopener">★ Star on GitHub</a>
    </div>
  </div>

  <h2 class="sec">Get a template</h2>
  <div class="row">
    <select id="type"><option>Loading…</option></select>
    <span style="color:var(--muted);font-size:.9rem">replace the <code>{{PLACEHOLDERS}}</code> with your values</span>
  </div>
  <div class="card">
    <div class="bar">
      <span class="grow" id="tname"></span>
      <button class="ghost" id="copy" type="button">Copy</button>
      <button class="ghost" id="dl" type="button">Download</button>
    </div>
    <pre class="code" id="tpl">…</pre>
  </div>

  <h2 class="sec">Validate your JSON-LD</h2>
  <textarea id="in" placeholder='Paste your JSON-LD here, e.g. { "@context": "https://schema.org", "@type": "Organization", ... }'></textarea>
  <div class="row" style="margin-top:10px">
    <button id="val" type="button">Validate</button>
    <span style="color:var(--muted);font-size:.85rem">Checks JSON, @context, @type, required fields, and leftover placeholders.</span>
  </div>
  <div id="vout"></div>

  <footer>
    Open source (MIT): <a href="https://github.com/TryGeoSuite/schema-templates">GitHub</a>
    · <a href="https://www.npmjs.com/package/@geosuite/schema-templates">npm</a>
    · <code>npx @geosuite/schema-templates show Organization</code><br>
    Built by <a href="https://github.com/matte97p">Matteo Perino</a> · a <a href="https://trygeosuite.it">GeoSuite</a> open-source tool.
  </footer>
</div>

<script>
  var sel = document.getElementById('type');
  var tpl = document.getElementById('tpl');
  var tname = document.getElementById('tname');
  var current = '';

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function loadTemplate(type){
    tpl.textContent = 'Loading…';
    fetch('/api/template?type=' + encodeURIComponent(type))
      .then(function(r){ return r.json(); })
      .then(function(d){ current = d.json || ''; tpl.textContent = current; tname.textContent = type; })
      .catch(function(){ tpl.textContent = 'Failed to load.'; });
  }

  fetch('/api/templates').then(function(r){ return r.json(); }).then(function(types){
    sel.innerHTML = '';
    types.forEach(function(t){ var o = document.createElement('option'); o.value = t; o.textContent = t; sel.appendChild(o); });
    var initial = (types.indexOf('Organization') >= 0) ? 'Organization' : types[0];
    sel.value = initial; loadTemplate(initial);
  });

  sel.addEventListener('change', function(){ loadTemplate(sel.value); });

  document.getElementById('copy').addEventListener('click', function(){
    navigator.clipboard.writeText(current).then(function(){
      var b = document.getElementById('copy'); b.textContent = 'Copied ✓'; setTimeout(function(){ b.textContent = 'Copy'; }, 1500);
    });
  });
  document.getElementById('dl').addEventListener('click', function(){
    var blob = new Blob([current], { type: 'application/ld+json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (sel.value || 'schema') + '.jsonld';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
  });

  document.getElementById('val').addEventListener('click', function(){
    var vout = document.getElementById('vout');
    var body = document.getElementById('in').value;
    vout.innerHTML = '<div class="verdict" style="color:var(--muted)">Validating…</div>';
    fetch('/api/validate', { method: 'POST', body: body })
      .then(function(r){ return r.json(); })
      .then(function(d){
        if (d.ok){ vout.innerHTML = '<div class="verdict ok">✓ Valid — passes the structural checks.</div>'; return; }
        var items = (d.errors || []).map(function(e){ return '<li>' + esc(e) + '</li>'; }).join('');
        vout.innerHTML = '<div class="verdict bad">✗ ' + (d.errors || []).length + ' issue(s):<ul>' + items + '</ul></div>';
      })
      .catch(function(){ vout.innerHTML = '<div class="verdict bad">Network error — try again.</div>'; });
  });
</script>
</body>
</html>`;
