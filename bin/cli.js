#!/usr/bin/env node
// geosuite-schema — small CLI around @geosuite/schema-templates.
//
// Usage:
//   geosuite-schema list
//   geosuite-schema show <Type>
//   geosuite-schema fill <Type> --url <url> [--ai] [--out=path]
//
// `fill` is the only command that touches the network. Without `--ai`
// it errors out — there's no deterministic way to populate placeholder
// values from a URL. Set OPENAI_API_KEY or ANTHROPIC_API_KEY to enable
// the LLM-powered fill.

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chat, detectProvider } from '../src/ai.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = resolve(__dirname, '..', 'templates');

const HELP = `geosuite-schema — JSON-LD schema templates with optional AI fill

USAGE
  geosuite-schema list
  geosuite-schema show <Type>
  geosuite-schema fill <Type> --url <url> [--ai] [--out=path]

ARGUMENTS
  <Type>          schema.org @type (e.g. Organization, Product, FAQPage).

OPTIONS
  --url <url>     Public URL the LLM will scrape to fill the placeholders.
  --ai            (required for fill) Use the LLM to populate placeholders.
                  Without it, fill exits with an error — there is no
                  deterministic way to invent the values.
  --out <path>    Write result to a file instead of stdout.
  --help, -h      Show this help.

AI mode
  Set OPENAI_API_KEY or ANTHROPIC_API_KEY to enable --ai. The CLI sends
  only the page's title + visible text (truncated) to the provider.
`;

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (tok === '--help' || tok === '-h') {
      out.help = true;
    } else if (tok.startsWith('--')) {
      const eq = tok.indexOf('=');
      if (eq !== -1) {
        out[tok.slice(2, eq)] = tok.slice(eq + 1);
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        out[tok.slice(2)] = argv[++i];
      } else {
        out[tok.slice(2)] = true;
      }
    } else {
      out._.push(tok);
    }
  }
  return out;
}

async function listTemplates() {
  const files = (await readdir(TEMPLATES_DIR))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
  for (const t of files) process.stdout.write(`${t}\n`);
}

async function showTemplate(type) {
  const path = join(TEMPLATES_DIR, `${type}.json`);
  const body = await readFile(path, 'utf8');
  process.stdout.write(body.endsWith('\n') ? body : `${body}\n`);
}

async function fillTemplate(type, args) {
  if (!args.url) {
    process.stderr.write('error: fill requires --url\n');
    process.exit(2);
  }
  if (!args.ai) {
    process.stderr.write(
      'error: fill requires --ai. Without an LLM, the placeholders cannot be populated from a URL.\n',
    );
    process.exit(2);
  }
  if (!detectProvider()) {
    process.stderr.write(
      'error: --ai requested but no LLM API key found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.\n',
    );
    process.exit(2);
  }

  const path = join(TEMPLATES_DIR, `${type}.json`);
  const template = await readFile(path, 'utf8');
  const page = await fetchPageText(args.url);

  const prompt = [
    {
      role: 'system',
      content:
        'You receive a JSON-LD template containing {{PLACEHOLDER}} tokens and the title + visible text of a public web page. Replace every placeholder with a value supported by the page. If the page does not support a value, leave the placeholder unchanged so the operator can fill it in. Output strictly the resulting JSON, no commentary, no markdown.',
    },
    {
      role: 'user',
      content: `URL: ${args.url}\n\nTitle: ${page.title}\n\nText (truncated):\n${page.text}\n\nTemplate:\n${template}`,
    },
  ];
  const filled = await chat(prompt, { maxTokens: 1500, temperature: 0.1 });
  const cleaned = filled.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  if (args.out) {
    await writeFile(args.out, cleaned + '\n', 'utf8');
    process.stderr.write(`wrote ${cleaned.length} bytes to ${args.out}\n`);
  } else {
    process.stdout.write(cleaned + '\n');
  }
}

async function fetchPageText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(url, {
      headers: {
        'user-agent': 'geosuite-schema-fill/0.2.0',
        accept: 'text/html, */*',
      },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    const html = await res.text();
    return parseHtml(html);
  } finally {
    clearTimeout(timer);
  }
}

function parseHtml(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? collapse(stripTags(titleMatch[1])) : '';
  // Drop scripts/styles, then strip tags.
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const text = collapse(stripTags(stripped)).slice(0, 8_000);
  return { title, text };
}

function stripTags(s) {
  return String(s || '').replace(/<[^>]+>/g, ' ');
}

function collapse(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(HELP);
    return;
  }
  const cmd = args._[0];
  if (!cmd) {
    process.stdout.write(HELP);
    process.exit(1);
  }
  if (cmd === 'list') return listTemplates();
  if (cmd === 'show') {
    if (!args._[1]) {
      process.stderr.write('error: show requires a Type argument\n');
      process.exit(2);
    }
    return showTemplate(args._[1]);
  }
  if (cmd === 'fill') {
    if (!args._[1]) {
      process.stderr.write('error: fill requires a Type argument\n');
      process.exit(2);
    }
    return fillTemplate(args._[1], args);
  }
  process.stderr.write(`unknown command: ${cmd}\n\n${HELP}`);
  process.exit(2);
}

main().catch((err) => {
  process.stderr.write(`error: ${err && err.message ? err.message : err}\n`);
  process.exit(1);
});
