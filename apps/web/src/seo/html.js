// Static HTML rendering of the SEO model. Runs at build time only (inside the
// Vite plugin and scripts/seo-postbuild.mjs) — never shipped to the browser.

import {
  SITE,
  PAGES,
  NAV_LINKS,
  organizationJsonLd,
  websiteJsonLd,
  absoluteUrl,
} from './core.js';

export const HEAD_START = '<!--seo:head:start-->';
export const HEAD_END = '<!--seo:head:end-->';
export const BODY_START = '<!--seo:body:start-->';
export const BODY_END = '<!--seo:body:end-->';
export const VERIFY_MARK = '<!--seo:verification-->';
export const GLOBAL_LD_MARK = '<!--seo:global-jsonld-->';
export const SHELL_CSS_MARK = '<!--seo:shell-css-->';

/** Minimal styling for the crawlable fallback markup shown until the app mounts. */
export const SHELL_CSS = `<style>
#seo-shell{font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#10213A;max-width:72rem;margin:0 auto;padding:0 1rem 3rem}
#seo-shell .seo-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem 1.5rem;padding:1rem 0;border-bottom:1px solid #DFE8F5}
#seo-shell .seo-brand{display:inline-flex;align-items:center;gap:.6rem;font-weight:800;font-size:1.25rem;color:#10213A;text-decoration:none}
#seo-shell nav ul{display:flex;flex-wrap:wrap;gap:.25rem 1rem;list-style:none;margin:0;padding:0;font-size:.875rem}
#seo-shell a{color:#175CFF}
#seo-shell h1{font-size:clamp(1.9rem,5vw,3rem);line-height:1.15;font-weight:800;margin:2.5rem 0 1rem;letter-spacing:-.02em}
#seo-shell main p{color:#475569;line-height:1.7;max-width:46rem}
#seo-shell main ul{color:#334155;line-height:1.8;padding-left:1.25rem}
#seo-shell footer{margin-top:3rem;padding-top:1rem;border-top:1px solid #DFE8F5;font-size:.8rem;color:#64748B}
/* Branded splash for visitors with JavaScript (markup in index.html, removed by RemoveSplash in src/main.tsx).
   The crawlable shell stays in the DOM for crawlers and no-JS visitors. */
html.js #seo-shell{display:none}
#app-splash{display:none}
html.js #app-splash{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#F7FAFF;color:#64748B;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:14px}
#app-splash .spin{width:30px;height:30px;border-radius:50%;border:3px solid #DFE8F5;border-top-color:#175CFF;animation:app-splash-spin .8s linear infinite}
#app-splash[data-failed] .spin{display:none}
#app-splash button{padding:9px 18px;border:0;border-radius:12px;cursor:pointer;background:#175CFF;color:#fff;font:inherit;font-weight:600}
@keyframes app-splash-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){#app-splash .spin{animation-duration:2.4s}}
</style>`;

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const ld = (obj, id) =>
  `<script type="application/ld+json"${id ? ` id="${id}"` : ''}>${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

/** <head> tags that vary per page. Mirrors applySeo() in dom.ts. */
export function renderHead(m) {
  const url = m.canonical ?? absoluteUrl(m.path);
  const lines = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<meta name="robots" content="${esc(m.robots)}" />`,
  ];
  if (m.canonical) {
    lines.push(
      `<link rel="canonical" href="${esc(m.canonical)}" />`,
      `<link rel="alternate" hreflang="en" href="${esc(m.canonical)}" />`,
      `<link rel="alternate" hreflang="x-default" href="${esc(m.canonical)}" />`
    );
  }
  lines.push(
    `<meta property="og:type" content="${esc(m.ogType)}" />`,
    `<meta property="og:site_name" content="${esc(SITE.name)}" />`,
    `<meta property="og:locale" content="${esc(SITE.locale)}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(m.image)}" />`,
    `<meta property="og:image:secure_url" content="${esc(m.image)}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="${SITE.ogImageWidth}" />`,
    `<meta property="og:image:height" content="${SITE.ogImageHeight}" />`,
    `<meta property="og:image:alt" content="${esc(m.imageAlt)}" />`
  );
  if (m.publishedTime) lines.push(`<meta property="article:published_time" content="${esc(m.publishedTime)}" />`);
  if (m.modifiedTime) lines.push(`<meta property="article:modified_time" content="${esc(m.modifiedTime)}" />`);
  lines.push(
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${esc(m.image)}" />`,
    `<meta name="twitter:image:alt" content="${esc(m.imageAlt)}" />`
  );
  if (SITE.twitterHandle) {
    lines.push(`<meta name="twitter:site" content="${esc(SITE.twitterHandle)}" />`);
  }
  if (m.jsonLd) lines.push(ld(m.jsonLd, 'seo-jsonld'));
  return lines.map((l) => `    ${l}`).join('\n');
}

/** Site-wide Organization + WebSite structured data (identical on every page). */
export function renderGlobalJsonLd() {
  return [ld(organizationJsonLd()), ld(websiteJsonLd())].map((l) => `    ${l}`).join('\n');
}

export function renderVerification(env = {}) {
  const tags = [];
  if (env.SEO_GOOGLE_VERIFICATION) tags.push(`<meta name="google-site-verification" content="${esc(env.SEO_GOOGLE_VERIFICATION)}" />`);
  if (env.SEO_BING_VERIFICATION) tags.push(`<meta name="msvalidate.01" content="${esc(env.SEO_BING_VERIFICATION)}" />`);
  if (env.SEO_YANDEX_VERIFICATION) tags.push(`<meta name="yandex-verification" content="${esc(env.SEO_YANDEX_VERIFICATION)}" />`);
  return tags.map((t) => `    ${t}`).join('\n');
}

const paragraphs = (text) =>
  String(text || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br />')}</p>`)
    .join('');

function chrome(inner) {
  const nav = NAV_LINKS.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('');
  return (
    `<div id="seo-shell">` +
    `<header class="seo-bar"><a class="seo-brand" href="/"><img src="/logo.png" width="36" height="36" alt="${esc(SITE.name)}" />${esc(SITE.name)}</a>` +
    `<nav aria-label="Primary"><ul>${nav}</ul></nav></header>` +
    `<main>${inner}</main>` +
    `<footer><p>&copy; ${esc(SITE.legalName)}. ${esc(SITE.name)} reference prices are informational and are not an offer or an executable quote. Digital assets involve risk.</p></footer>` +
    `<noscript><p>Please enable JavaScript to use the interactive features of ${esc(SITE.name)}.</p></noscript>` +
    `</div>`
  );
}

/** Crawlable content placed inside #root for a configured page (replaced by React on load). */
export function renderPageBody(path) {
  const cfg = PAGES[path];
  const points = (cfg.points || []).map((p) => `<li>${esc(p)}</li>`).join('');
  return chrome(`<h1>${esc(cfg.h1)}</h1><p>${esc(cfg.lead)}</p>${points ? `<ul>${points}</ul>` : ''}`);
}

/** Crawlable content for an announcement. */
export function renderArticleBody(a) {
  const when = a.publishedAt || a.createdAt;
  const d = when ? new Date(when) : null;
  const date = d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : '';
  return chrome(
    `<article><p><a href="/announcements">&larr; All announcements</a></p>` +
      `<h1>${esc(a.title)}</h1>` +
      `<p>${a.category ? esc(a.category) : ''}${a.category && date ? ' &middot; ' : ''}${date ? `<time datetime="${date}">${date}</time>` : ''}</p>` +
      (a.summary ? `<p><strong>${esc(a.summary)}</strong></p>` : '') +
      paragraphs(a.content) +
      `</article>`
  );
}

/** Minimal loading state for app shells (dashboard/admin/unknown routes). */
export function renderShellBody() {
  return `<div id="seo-shell"><main><p role="status">Loading ${esc(SITE.name)}…</p><noscript><p>Please enable JavaScript to use ${esc(SITE.name)}.</p></noscript></main></div>`;
}

/** Replaces everything between two marker comments (markers are kept). */
function replaceBetween(html, startMark, endMark, content) {
  const a = html.indexOf(startMark);
  const b = html.indexOf(endMark, a + startMark.length);
  if (a === -1 || b === -1) throw new Error(`SEO markers not found in template: ${startMark}`);
  return html.slice(0, a + startMark.length) + content + html.slice(b);
}

/**
 * Applies a SEO model to the HTML template (dist/index.html after Vite build).
 * @param {string} template
 * @param {{model:object, body:string}} opts
 */
export function applyTemplate(template, { model, body }) {
  let out = replaceBetween(template, HEAD_START, HEAD_END, `
${renderHead(model)}
    `);
  out = replaceBetween(out, BODY_START, BODY_END, body);
  return out;
}

/** Used by the Vite plugin for the root page (dev + build). */
export function transformIndexHtml(html, model, body, env) {
  let out = applyTemplate(html, { model, body });
  out = out.replace(GLOBAL_LD_MARK, () => renderGlobalJsonLd());
  out = out.replace(VERIFY_MARK, () => renderVerification(env));
  out = out.replace(SHELL_CSS_MARK, () => SHELL_CSS);
  return out;
}
