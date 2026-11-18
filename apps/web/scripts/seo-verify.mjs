#!/usr/bin/env node
/**
 * SEO audit of the production build (apps/web/dist). Run after `npm run build`:
 *
 *   npm run seo:check -w @sicoin/web
 *
 * Exits non-zero when any check fails, so it can also gate CI.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, PAGES, absoluteUrl, NAV_LINKS, indexablePaths } from '../src/seo/core.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, '..');
const dist = path.join(webRoot, 'dist');
const repoRoot = path.resolve(webRoot, '..', '..');

let failures = 0;
let checks = 0;
const fail = (msg) => {
  failures++;
  console.error(`  ✗ ${msg}`);
};
const ok = (cond, msg) => {
  checks++;
  if (!cond) fail(msg);
};
const section = (t) => console.log(`\n${t}`);

const read = (rel) => fs.readFileSync(path.join(dist, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(dist, rel));

const attr = (html, re) => {
  const m = re.exec(html);
  return m ? m[1] : undefined;
};
const unesc = (s) => String(s).replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const metaContent = (html, key, by = 'name') =>
  attr(html, new RegExp(`<meta ${by}="${key}" content="([^"]*)"`));

function fileForPath(p) {
  return p === '/' ? 'index.html' : `${p.slice(1)}.html`;
}

function jsonLdBlocks(html) {
  const out = [];
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

// ---------------------------------------------------------------------------
section('Pre-rendered pages');
const titles = new Map();
const descs = new Map();
for (const [p, cfg] of Object.entries(PAGES)) {
  const file = fileForPath(p);
  if (!exists(file)) {
    fail(`${p}: ${file} missing`);
    continue;
  }
  const html = read(file);
  const title = unesc(attr(html, /<title>([^<]*)<\/title>/) ?? '');
  const desc = unesc(metaContent(html, 'description') ?? '');
  const robots = metaContent(html, 'robots') ?? '';
  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);

  ok((html.match(/<title>/g) || []).length === 1, `${p}: must have exactly one <title>`);
  ok(title === cfg.title, `${p}: <title> does not match config`);
  ok(title.length >= 15 && title.length <= 62, `${p}: title length ${title.length} outside 15-62`);
  ok(desc.length >= 60 && desc.length <= 165, `${p}: description length ${desc.length} outside 60-165`);
  ok((html.match(/<meta name="description"/g) || []).length === 1, `${p}: must have exactly one meta description`);
  ok((html.match(/<meta name="robots"/g) || []).length === 1, `${p}: must have exactly one meta robots`);
  ok((html.match(/<h1[ >]/g) || []).length === 1, `${p}: must have exactly one <h1> in the static HTML`);
  ok(/<html lang="en"/.test(html), `${p}: <html lang> missing`);
  ok(/name="viewport"/.test(html), `${p}: viewport meta missing`);

  if (cfg.index) {
    ok(canonical === absoluteUrl(p), `${p}: canonical should be ${absoluteUrl(p)} (got ${canonical})`);
    ok(/^index, follow/.test(robots), `${p}: indexable page has robots="${robots}"`);
    ok(!titles.has(title), `${p}: duplicate title with ${titles.get(title)}`);
    ok(!descs.has(desc), `${p}: duplicate description with ${descs.get(desc)}`);
    titles.set(title, p);
    descs.set(desc, p);
  } else {
    ok(/noindex/.test(robots), `${p}: private page must be noindex (got "${robots}")`);
    ok(!canonical, `${p}: noindex page should not declare a canonical`);
  }

  for (const k of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type', 'og:site_name']) {
    ok(!!metaContent(html, k, 'property'), `${p}: ${k} missing`);
  }
  ok(/^https:\/\/www\.sicoinx\.com\//.test(metaContent(html, 'og:image', 'property') ?? ''), `${p}: og:image must be absolute https URL`);
  ok(metaContent(html, 'twitter:card') === 'summary_large_image', `${p}: twitter:card missing`);

  const blocks = jsonLdBlocks(html);
  ok(blocks.length >= 2, `${p}: expected site-wide Organization + WebSite JSON-LD`);
  for (const b of blocks) {
    try {
      JSON.parse(b);
    } catch (e) {
      fail(`${p}: invalid JSON-LD (${e.message})`);
    }
  }
  if (cfg.index && p !== '/') {
    ok(blocks.some((b) => b.includes('BreadcrumbList')), `${p}: BreadcrumbList JSON-LD missing`);
  }
  // Every internal link in the static shell must resolve to a built file.
  for (const [href] of NAV_LINKS) ok(exists(fileForPath(href)), `${p}: nav link ${href} has no built page`);
}

// ---------------------------------------------------------------------------
section('Special pages');
for (const f of ['404.html', 'shell-private.html', 'shell-article.html']) {
  ok(exists(f), `${f} missing`);
  if (!exists(f)) continue;
  const html = read(f);
  if (f === 'shell-article.html') {
    ok(!/<link rel="canonical"/.test(html), `${f}: must not declare a canonical (it serves many URLs)`);
  } else {
    ok(/noindex/.test(metaContent(html, 'robots') ?? ''), `${f}: must be noindex`);
  }
  ok(/<script type="module"/.test(html), `${f}: app bundle script missing`);
}
{
  const idx = read('index.html');
  ok(/<script type="module"/.test(idx), 'index.html: app bundle script missing');
  ok(idx.includes('<div id="root"><!--seo:body:start-->'), 'index.html: #root/body markers missing');
  ok(idx.includes('rel="sitemap"'), 'index.html: sitemap <link> missing');
}

// ---------------------------------------------------------------------------
section('sitemap.xml');
if (!exists('sitemap.xml')) {
  fail('sitemap.xml missing');
} else {
  const xml = read('sitemap.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  ok(/^<\?xml version="1.0" encoding="UTF-8"\?>/.test(xml), 'sitemap: XML declaration missing');
  ok(locs.length > 0, 'sitemap: no URLs');
  ok(new Set(locs).size === locs.length, 'sitemap: duplicate URLs');
  ok(locs.length <= 50000, 'sitemap: more than 50,000 URLs');
  for (const p of indexablePaths()) ok(locs.includes(absoluteUrl(p)), `sitemap: missing ${absoluteUrl(p)}`);
  for (const loc of locs) {
    ok(loc.startsWith(`${SITE.url}/`) || loc === SITE.url, `sitemap: ${loc} not on ${SITE.url}`);
    const p = loc.slice(SITE.url.length) || '/';
    if (p.startsWith('/announcements/')) {
      ok(exists(`${p.slice(1)}.html`), `sitemap: ${loc} has no pre-rendered file`);
    } else {
      ok(!!PAGES[p] && PAGES[p].index, `sitemap: ${loc} is not an indexable page`);
    }
    ok(!/[?#]/.test(loc) && !/\/$/.test(p === '/' ? 'x' : p), `sitemap: ${loc} must have no query/hash/trailing slash`);
  }
  for (const m of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
    ok(/^\d{4}-\d{2}-\d{2}/.test(m[1]) && !Number.isNaN(Date.parse(m[1])), `sitemap: bad lastmod ${m[1]}`);
  }
  console.log(`  ${locs.length} URLs`);
}

// ---------------------------------------------------------------------------
section('robots.txt / discovery files');
if (!exists('robots.txt')) {
  fail('robots.txt missing');
} else {
  const r = read('robots.txt');
  ok(r.includes(`Sitemap: ${SITE.url}/sitemap.xml`), 'robots: Sitemap directive missing/wrong');
  ok(/User-agent: \*/.test(r), 'robots: no wildcard group');
  ok(!/^Disallow:\s*\/\s*$/m.test(r), 'robots: must not disallow the whole site');
  ok(!/^Disallow:\s*\/api/m.test(r), 'robots: /api must stay crawlable so pages can render');
  ok(!/^Disallow:\s*\/assets/m.test(r), 'robots: /assets must stay crawlable (JS/CSS needed for rendering)');
}
for (const f of ['llms.txt', 'site.webmanifest', 'favicon.ico', 'apple-touch-icon.png', 'logo.png', 'og-image.png', 'android-chrome-512x512.png']) {
  ok(exists(f), `${f} missing`);
}
if (exists('og-image.png')) {
  const buf = fs.readFileSync(path.join(dist, 'og-image.png'));
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  ok(w === SITE.ogImageWidth && h === SITE.ogImageHeight, `og-image.png is ${w}x${h}, expected ${SITE.ogImageWidth}x${SITE.ogImageHeight}`);
  ok(buf.length < 600 * 1024, 'og-image.png should be under 600 KB');
}
if (exists('site.webmanifest')) {
  try {
    const mf = JSON.parse(read('site.webmanifest'));
    ok(mf.name && mf.start_url && mf.icons?.length >= 2, 'manifest: name/start_url/icons incomplete');
    for (const i of mf.icons || []) ok(exists(i.src.slice(1)), `manifest: icon ${i.src} missing`);
  } catch (e) {
    fail(`manifest invalid JSON: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
section('vercel.json routing');
for (const rel of ['vercel.json', 'apps/web/vercel.json']) {
  const file = path.join(repoRoot, rel);
  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    fail(`${rel}: ${e.message}`);
    continue;
  }
  ok(cfg.cleanUrls === true && cfg.trailingSlash === false, `${rel}: cleanUrls/trailingSlash not set`);
  const catchAll = (cfg.rewrites || []).find((r) => /^\/\(\(\?!/.test(r.source) || r.source === '/(.*)' || r.source === '/:path*');
  ok(!catchAll, `${rel}: catch-all rewrite would turn every unknown URL into a soft 404`);
  for (const r of cfg.rewrites || []) {
    if (r.destination.startsWith('/')) ok(exists(r.destination.slice(1)), `${rel}: rewrite destination ${r.destination} missing from dist`);
  }
  ok((cfg.redirects || []).some((r) => r.has?.some((h) => h.value === 'sicoinx.com')), `${rel}: apex -> www redirect missing`);
}

// ---------------------------------------------------------------------------
section('bundle size');
const assets = fs.readdirSync(path.join(dist, 'assets')).filter((f) => f.endsWith('.js'));
const entry = /<script type="module"[^>]*src="\/assets\/([^"]+)"/.exec(read('index.html'))?.[1];
if (entry) {
  const kb = fs.statSync(path.join(dist, 'assets', entry)).size / 1024;
  console.log(`  entry chunk ${entry}: ${kb.toFixed(0)} KB (${assets.length} JS chunks total)`);
  ok(kb < 900, `entry chunk is ${kb.toFixed(0)} KB — code splitting regressed`);
}

console.log(`\n${checks} checks, ${failures} failure(s).`);
process.exit(failures ? 1 : 0);
