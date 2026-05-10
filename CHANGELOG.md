# Changelog

All notable changes to this project are documented here. The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows semantic versioning where it makes sense for a content repository.

## 0.2.0 — 2026-05-10

### Added (templates)

- 10 new templates with matching populated examples and validator
  rules: `Event`, `LocalBusiness`, `Service`, `JobPosting`, `Course`,
  `Recipe`, `VideoObject`, `WebSite` (with `SearchAction`), `QAPage`,
  `HowToTip`. Brings the catalog to **23 templates / 23 examples**.
- `assets/logo.svg` — shared GeoSuite Open mark; rendered as the README
  hero. Monochrome on transparent, uses `currentColor`.

### Removed

- `devDependencies.ajv` — declared but never imported. Dropping it makes
  `npm install` a no-op and keeps the repo truly zero-dependency.

### Added

- `bin/cli.js` (`geosuite-schema`) — small CLI with `list` / `show` /
  `fill` subcommands. The first two are deterministic (no network).
- `geosuite-schema fill <Type> --url <url> --ai` — fetches the page,
  extracts title + visible text, and asks the LLM to populate every
  `{{PLACEHOLDER}}` in the template using only what the page supports.
  Placeholders that the page doesn't support are left intact so the
  operator can fill them by hand.
- `src/ai.js` — optional LLM helper (auto-detects `OPENAI_API_KEY` or
  `ANTHROPIC_API_KEY`, native `fetch`, no third-party SDK).

### Notes on privacy and cost

- AI mode is **opt-in**. The deterministic side of the repo (templates,
  validator) is unchanged.
- `fill` requires `--ai` because there is no deterministic way to guess
  the values from a URL — without it, the command exits with an error.
- A typical `fill` run sends only the page title + ~8 KB of stripped
  visible text. Costs are well under a cent on small models
  (`gpt-5-mini`, `claude-haiku-4-5`).

## 0.1.0 — Initial release

- First public release of `@geosuite/schema-templates`.
- 13 JSON-LD templates: `SoftwareApplication`, `HowTo`, `DefinedTerm`, `DefinedTermSet`, `FAQPage`, `Dataset`, `BreadcrumbList`, `Organization`, `Article` (BlogPosting variant), `ItemList`, `ProfilePage`, `Product`, `Review`.
- Matching populated `examples/*.example.json` for every template.
- `validate.js` local structural checker (no network calls) covering `@context`, `@type` and per-type required fields.
- Smoke test under `test/test-validate.js` using `node:test`.
- GitHub Actions CI on Node 20.
