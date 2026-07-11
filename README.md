<p align="center"><img src="./assets/logo.svg" alt="GeoSuite Open" width="72"></p>

# schema-templates

> Curated, copy-paste-ready schema.org JSON-LD templates to help your site speak clearly to search engines and AI assistants.
>
> Created and invented by **[Matteo Perino](https://github.com/matte97p)** ([LinkedIn](https://www.linkedin.com/in/matteo-perino-27642016b/)). Maintained by [GeoSuite(Matteo Perino)](https://trygeosuite.it).

[![CI](https://github.com/TryGeoSuite/schema-templates/actions/workflows/ci.yml/badge.svg)](https://github.com/TryGeoSuite/schema-templates/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@geosuite/schema-templates.svg)](https://www.npmjs.com/package/@geosuite/schema-templates)
[![npm downloads](https://img.shields.io/npm/dm/@geosuite/schema-templates.svg)](https://www.npmjs.com/package/@geosuite/schema-templates)
[![GitHub stars](https://img.shields.io/github/stars/TryGeoSuite/schema-templates?style=flat&logo=github)](https://github.com/TryGeoSuite/schema-templates/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

### ▶ [Try it live](https://schema-templates.geosuite.workers.dev) — pick a template, validate your JSON-LD

No install: copy any schema.org JSON-LD template, or paste yours and validate it against the structural checks. Or use the CLI below.

## Why JSON-LD matters for GEO

Generative Engine Optimization (GEO) is the practice of making your content legible to AI assistants — ChatGPT, Perplexity, Gemini, Claude, Google's AI Overviews, and the long tail of LLM-powered search surfaces. These systems do not run a full browser the way Googlebot does; they parse the markup they find. Structured data in JSON-LD is the most explicit, least ambiguous way to tell a machine what a page is about: who wrote it, what product is on offer, what steps a how-to takes, what a term means.

JSON-LD is **necessary but not sufficient**. It will not, on its own, cause an AI to cite you. Authority, freshness, factual accuracy, and how often your content is referenced elsewhere matter at least as much. But valid, accurate structured data removes a class of avoidable failures: it prevents the AI from guessing your prices, your author, your FAQ answers, or whether a number on the page is a benchmark or a typo. Treat these templates as the floor, not the ceiling.

## How to use these templates

1. Pick a template from the catalog below that matches the page you are marking up.
2. Copy the file from `templates/`. Each placeholder is wrapped in double curly braces, e.g. `{{COMPANY_NAME}}`.
3. Replace every placeholder with real values. Do not leave `{{...}}` in production output — most validators will flag them, and AI parsers will treat them as literal text.
4. Drop the resulting JSON into a `<script type="application/ld+json">` tag inside your `<head>`. One block per page is fine; multiple blocks per page are also valid.
5. Validate (see Validators section).
6. Look at `examples/` for a fully populated version of each template using a fictional Italian SaaS company so you can see what realistic values look like.

Each template ships with only the properties that are truly recommended for that use case. We have intentionally avoided padding templates with every optional schema.org field — extra noise dilutes the signal. If you need a property that is not in a template, consult [schema.org](https://schema.org/) directly and add it yourself.

## Catalog

| Schema type | Use case | Template | Example |
|---|---|---|---|
| SoftwareApplication | SaaS / app product page | [templates/SoftwareApplication.json](templates/SoftwareApplication.json) | [examples/SoftwareApplication.example.json](examples/SoftwareApplication.example.json) |
| HowTo | Step-by-step tutorial page | [templates/HowTo.json](templates/HowTo.json) | [examples/HowTo.example.json](examples/HowTo.example.json) |
| DefinedTerm | Single glossary entry | [templates/DefinedTerm.json](templates/DefinedTerm.json) | [examples/DefinedTerm.example.json](examples/DefinedTerm.example.json) |
| DefinedTermSet | Glossary index page | [templates/DefinedTermSet.json](templates/DefinedTermSet.json) | [examples/DefinedTermSet.example.json](examples/DefinedTermSet.example.json) |
| FAQPage | FAQ section / page | [templates/FAQPage.json](templates/FAQPage.json) | [examples/FAQPage.example.json](examples/FAQPage.example.json) |
| Dataset | Benchmark, study, or report | [templates/Dataset.json](templates/Dataset.json) | [examples/Dataset.example.json](examples/Dataset.example.json) |
| BreadcrumbList | Site navigation breadcrumbs | [templates/BreadcrumbList.json](templates/BreadcrumbList.json) | [examples/BreadcrumbList.example.json](examples/BreadcrumbList.example.json) |
| Organization | Company / about page | [templates/Organization.json](templates/Organization.json) | [examples/Organization.example.json](examples/Organization.example.json) |
| Article (BlogPosting) | Blog post or editorial article | [templates/Article.json](templates/Article.json) | [examples/Article.example.json](examples/Article.example.json) |
| ItemList | Comparison / listicle / ranking | [templates/ItemList.json](templates/ItemList.json) | [examples/ItemList.example.json](examples/ItemList.example.json) |
| ProfilePage | Author bio page | [templates/ProfilePage.json](templates/ProfilePage.json) | [examples/ProfilePage.example.json](examples/ProfilePage.example.json) |
| Product | Physical or digital product | [templates/Product.json](templates/Product.json) | [examples/Product.example.json](examples/Product.example.json) |
| Review | Standalone review of any item | [templates/Review.json](templates/Review.json) | [examples/Review.example.json](examples/Review.example.json) |

## Validators

After replacing placeholders, run your JSON through at least one of these:

- [Schema.org Validator](https://validator.schema.org/) — checks that your JSON-LD conforms to the schema.org vocabulary. The most strict and the most useful for generic JSON-LD.
- [Google Rich Results Test](https://search.google.com/test/rich-results) — checks the subset of properties Google uses for rich results. Helpful but narrower than the schema.org validator.
- The bundled `validate.js` script in this repo runs a fast structural sanity check (`@context`, `@type`, required fields) without any network calls. Run it with `npm run validate` or `node validate.js`.

The recommended order is: `validate.js` first to catch typos, then the schema.org validator, then the Google test if you specifically care about Google rich results.

## Repo scripts

```bash
npm run validate   # local structural check on every templates/*.json and examples/*.json
npm test           # node --test test/
```

No runtime or dev dependencies. There is no build step.

## Contributing

We welcome new templates and improvements to existing ones. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR. The short version: every new template must (a) follow the file-naming convention, (b) ship a matching `examples/*.example.json` with realistic values, (c) declare its required fields in `validate.js`, and (d) pass `npm run validate` and `npm test`.

## CLI (0.2+)

A small `geosuite-schema` CLI ships alongside the templates:

```bash
npm install -g @geosuite/schema-templates
# or run without installing:
npx @geosuite/schema-templates list

geosuite-schema list                                 # list available types
geosuite-schema show Product                         # print the raw template
geosuite-schema fill FAQPage --url https://example.com/faq --ai
```

The first two commands are deterministic and don't touch the network.
`fill` needs `--ai` and an LLM API key — there's no honest way to
populate the placeholders from a URL without one.

### AI mode

```bash
export OPENAI_API_KEY=sk-…       # or ANTHROPIC_API_KEY=sk-ant-…
geosuite-schema fill Organization --url https://example.com --ai
```

What the CLI sends to the provider:

- The chosen template (which is public anyway — same as `templates/<Type>.json`).
- The page's `<title>` and ~8 KB of stripped visible text.

What it doesn't send:

- The full HTML, scripts, or anything off-page.

Costs land under a cent for a single page on small models (`gpt-5-mini`,
`claude-haiku-4-5`). Don't enable `--ai` against URLs you wouldn't
paste into the provider's UI.

## Related: GeoSuite open-source tools

`schema-templates` is part of a small family of zero-dependency CLIs we maintain to make Generative Engine Optimization (GEO) measurable from the terminal:

- [`@geosuite/ai-crawler-bots`](https://github.com/TryGeoSuite/ai-crawler-bots) — curated AI bot user-agent list with a CLI that tells you whether GPTBot, ClaudeBot, PerplexityBot and friends can read your site and where the block came from.
- [`@geosuite/llms-txt-generator`](https://github.com/TryGeoSuite/llms-txt-generator) — turn a `sitemap.xml` into the `llms.txt` standard from [llmstxt.org](https://llmstxt.org/), so LLMs can index your most useful pages.
- [`@geosuite/sitemap-builder`](https://github.com/TryGeoSuite/sitemap-builder) — crawl a site and emit a valid `sitemap.xml`, for sites that ship without one.

The same checks are also surfaced as a hosted product at [trygeosuite.it](https://trygeosuite.it) for teams who want history, alerts, and CTAs wired into their content pipeline.

## Creator

**Created and invented by [Matteo Perino](https://github.com/matte97p)** — [LinkedIn](https://www.linkedin.com/in/matteo-perino-27642016b/) · [matte97.p@gmail.com](mailto:matte97.p@gmail.com).

Ideated, designed and validated by Matteo Perino. Implementation written with AI assistance, maintained under GeoSuite.

## License

[MIT](LICENSE) — © 2026 Matteo Perino and GeoSuite.

## Related tools — the GeoSuite GEO toolkit

- [ai-crawler-bots](https://github.com/TryGeoSuite/ai-crawler-bots) — which AI crawlers can read your site (robots.txt audit + CI gate)
- [llms-txt-generator](https://github.com/TryGeoSuite/llms-txt-generator) — sitemap.xml → llms.txt (the llmstxt.org standard)
- [schema-templates](https://github.com/TryGeoSuite/schema-templates) — validated, copy-paste schema.org JSON-LD
- [sitemap-builder](https://github.com/TryGeoSuite/sitemap-builder) — crawl a site, emit a valid sitemap.xml

Also from the same author: [rlsgrid](https://github.com/matte97p/rlsgrid) · [pentest-framework](https://github.com/matte97p/pentest-framework) · [demowright](https://github.com/matte97p/demowright)

---

⭐ If `schema-templates` is useful, [give it a star](https://github.com/TryGeoSuite/schema-templates) — it helps other people find the toolkit.

---

## Built by GeoSuite

This is part of the open-source toolkit behind **[GeoSuite](https://trygeosuite.it)** — the platform that measures and improves how AI engines (ChatGPT, Gemini, Claude, Perplexity) cite your brand. [Explore the platform →](https://trygeosuite.it)


---

<sub>🌐 Built by **Matteo Perino** — [matteoperino.dev](https://matteoperino.dev)</sub>
