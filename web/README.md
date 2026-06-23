# Schema Templates — hosted tool

A [Cloudflare Worker](https://developers.cloudflare.com/workers/) that puts
[`schema-templates`](../) on the web: pick a schema.org type and copy the
JSON-LD template, or paste your own JSON-LD and validate it. The validator uses
the same structural checks as the repo's `validate.js`.

- `GET /` — the page (`page.js`)
- `GET /api/templates` — list of available types
- `GET /api/template?type=Organization` — one template (`{ type, json }`)
- `POST /api/validate` — body is your JSON-LD; returns `{ ok, errors }`

No database, no tracking, no network calls — the templates are bundled and the
validator runs in the Worker.

## Run locally

```bash
cd web
npx wrangler dev
# open http://localhost:8787
```

## Deploy

```bash
cd web
npx wrangler deploy
```

⚠️ Deploy to your **personal / GeoSuite** Cloudflare account, not the work one
(`wrangler whoami` to check). Publishes to
`https://schema-templates.<your-subdomain>.workers.dev`.

## Auto-deploy (CI)

[`.github/workflows/deploy-web.yml`](../.github/workflows/deploy-web.yml)
redeploys on every push to `main` touching `web/` or `templates/`. Add two repo
secrets (Settings → Secrets and variables → Actions):

- `CLOUDFLARE_API_TOKEN` — token scoped **Edit Cloudflare Workers** from the
  account that owns the Worker.
- `CLOUDFLARE_ACCOUNT_ID` — that account's id.

## Notes

- `web/templates-bundle.js` imports every `templates/*.json`; add a line there
  when you add a template. The validator's `REQUIRED_BY_TYPE` in `worker.js`
  mirrors `../validate.js` — keep them in sync.
- This directory is **not** part of the npm package, so it never ships to
  registry consumers.
