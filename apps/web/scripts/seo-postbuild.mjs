#!/usr/bin/env node
/**
 * SEO post-build step. Runs after `vite build` (see apps/web/package.json).
 *
 * Because the app is a client-rendered SPA, this step makes every public URL
 * crawlable without executing JavaScript:
 *
 *   dist/<page>.html          one static HTML file per public route, carrying that page's
 *                             <title>, description, canonical, robots, Open Graph, Twitter
 *                             tags, JSON-LD and crawlable content. React replaces the content
 *                             on load, so visitors still get the full interactive app.
 *   dist/announcements/*.html one file per published announcement (needs SEO_API_URL).
 *   dist/404.html             served by Vercel with a real 404 status for unknown URLs.
 *   dist/shell-private.html   app shell for /dashboard and /admin (noindex).
 *   dist/shell-article.html   app shell for announcements published after the build.
 *   dist/sitemap.xml          every indexable URL (+ announcements when the API is reachable).
 *
 * Environment (all optional):
 *   SEO_API_URL                 e.g. https://api.sicoinx.com  — enables announcement pages + sitemap entries
 *   SEO_GOOGLE_VERIFICATION     Google Search Console token (meta tag, applied by the Vite plugin)
 *   SEO_BING_VERIFICATION       Bing Webmaster token
 *
 * Usage:
 *   node scripts/seo-postbuild.mjs             full post-build (default)
 *   node scripts/seo-postbuild.mjs --sitemap   only write public/sitemap.xml (static pages, no network)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  SITE,
  PAGES,
  absoluteUrl,
  resolveSeo,
  announcementSeo,
  indexablePaths,
} from '../src/seo/core.js';
import { applyTemplate, renderPageBody, renderArticleBody, renderShellBody } from '../src/seo/html.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, '..');
const distDir = path.join(webRoot, 'dist');
const publicDir = path.join(webRoot, 'public');
const sitemapOnly = process.argv.includes('--sitemap');

const log = (msg) => console.log(`[seo] ${msg}`);
const warn = (msg) => console.warn(`[seo] WARNING: ${msg}`);

const xmlEsc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

/** Last git commit date of a source file (ISO), or undefined when git history is unavailable. */
function gitLastmod(rel) {
  if (!rel) return undefined;
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', rel], {
      cwd: webRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    return out ? out.slice(0, 10) : undefined;
  } catch {
    return undefined;
  }
}

const isoDay = (d) => {
  const t = d ? new Date(d) : null;
  return t && !Number.isNaN(t.getTime()) ? t.toISOString().slice(0, 10) : undefined;
};

// ---------------------------------------------------------------------------
// Announcements (optional, needs a reachable API)
// ---------------------------------------------------------------------------

async function fetchJson(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const json = JSON.parse(text); // throws on HTML/SPA fallback responses
    return json?.data !== undefined ? json.data : json;
  } finally {
    clearTimeout(timer);
  }
}

async function loadAnnouncements() {
  const base = (process.env.SEO_API_URL || '').trim().replace(/\/+$/, '');
  if (!base) {
    log('SEO_API_URL not set — announcement pages are not pre-rendered and are left out of the sitemap.');
    return [];
  }
  try {
    const list = await fetchJson(`${base}/api/v1/content/announcements`);
    if (!Array.isArray(list)) throw new Error('unexpected response shape');
    const valid = list.filter((a) => a && typeof a.slug === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(a.slug) && a.title);
    const out = [];
    for (let i = 0; i < valid.length; i += 5) {
      const batch = await Promise.all(
        valid.slice(i, i + 5).map(async (a) => {
          try {
            const full = await fetchJson(`${base}/api/v1/content/announcements/${encodeURIComponent(a.slug)}`);
            return { ...a, ...(full && typeof full === 'object' ? full : {}) };
          } catch {
            return a; // list data is enough for metadata
          }
        })
      );
      out.push(...batch);
    }
    log(`loaded ${out.length} announcement(s) from the API.`);
    return out;
  } catch (e) {
    warn(`could not load announcements from ${base} (${e.message}); continuing without them.`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

function buildSitemap(announcements) {
  const urls = indexablePaths().map((p) => {
    const cfg = PAGES[p];
    return {
      loc: absoluteUrl(p),
      lastmod: gitLastmod(cfg.source),
      changefreq: cfg.changefreq,
      priority: cfg.priority,
      image: p === '/' ? { loc: `${SITE.url}${SITE.ogImage}`, title: SITE.ogImageAlt } : undefined,
    };
  });
  for (const a of announcements) {
    urls.push({
      loc: absoluteUrl(`/announcements/${a.slug}`),
      lastmod: isoDay(a.updatedAt || a.publishedAt || a.createdAt),
      changefreq: 'monthly',
      priority: 0.6,
    });
  }
  const body = urls
    .map((u) => {
      const lines = [`  <url>`, `    <loc>${xmlEsc(u.loc)}</loc>`];
      if (u.lastmod) lines.push(`    <lastmod>${u.lastmod}</lastmod>`);
      if (u.changefreq) lines.push(`    <changefreq>${u.changefreq}</changefreq>`);
      if (u.priority !== undefined) lines.push(`    <priority>${u.priority.toFixed(1)}</priority>`);
      if (u.image) {
        lines.push(
          `    <image:image>`,
          `      <image:loc>${xmlEsc(u.image.loc)}</image:loc>`,
          `      <image:title>${xmlEsc(u.image.title)}</image:title>`,
          `    </image:image>`
        );
      }
      lines.push(`  </url>`);
      return lines.join('\n');
    })
    .join('\n');
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    `${body}\n</urlset>\n`
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (sitemapOnly) {
    writeFile(path.join(publicDir, 'sitemap.xml'), buildSitemap([]));
    log(`wrote public/sitemap.xml (${indexablePaths().length} static URLs).`);
    return;
  }

  const templateFile = path.join(distDir, 'index.html');
  if (!fs.existsSync(templateFile)) throw new Error('dist/index.html not found — run `vite build` first.');
  const template = fs.readFileSync(templateFile, 'utf8');

  // 1. Static HTML for every configured public route.
  let count = 0;
  for (const p of Object.keys(PAGES)) {
    if (p === '/') continue; // already rendered into index.html by the Vite plugin
    const html = applyTemplate(template, { model: resolveSeo(p), body: renderPageBody(p) });
    writeFile(path.join(distDir, `${p.slice(1)}.html`), html);
    count++;
  }
  log(`pre-rendered ${count} route(s) + index.html.`);

  // 2. Real 404 page + app shells used by the Vercel rewrites.
  writeFile(
    path.join(distDir, '404.html'),
    applyTemplate(template, { model: resolveSeo('/404-not-found'), body: renderShellBody() })
  );
  writeFile(
    path.join(distDir, 'shell-private.html'),
    applyTemplate(template, { model: resolveSeo('/dashboard'), body: renderShellBody() })
  );
  const articleShell = { ...resolveSeo('/announcements/shell'), path: '/announcements', canonical: null };
  writeFile(
    path.join(distDir, 'shell-article.html'),
    applyTemplate(template, { model: articleShell, body: renderShellBody() })
  );

  // 3. Announcements.
  const announcements = await loadAnnouncements();
  for (const a of announcements) {
    const model = announcementSeo(a);
    writeFile(
      path.join(distDir, 'announcements', `${a.slug}.html`),
      applyTemplate(template, { model, body: renderArticleBody(a) })
    );
  }

  // 4. Sitemap (overwrites the static copy that Vite copied from public/).
  writeFile(path.join(distDir, 'sitemap.xml'), buildSitemap(announcements));
  log(`wrote sitemap.xml (${indexablePaths().length + announcements.length} URLs).`);
}

main().catch((e) => {
  console.error(`[seo] FAILED: ${e.stack || e.message}`);
  process.exit(1);
});
