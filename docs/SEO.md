# SEO — sicoinx.com

How search visibility is implemented, how to change it, and what to do after each deploy.

## How it works

The web app is a client-rendered React SPA, so crawlers that don't run JavaScript (and the first wave of
Google's two-pass indexing) would otherwise see an empty page with the homepage's tags on every URL.
The build therefore pre-renders the SEO layer:

| Piece | File | What it does |
| --- | --- | --- |
| Single source of truth | `apps/web/src/seo/core.js` | Site identity, per-page title/description/priority, JSON-LD builders, route → metadata resolver |
| Runtime sync | `apps/web/src/seo/dom.ts` | `<RouteSeo />` updates `<title>`, description, canonical, robots, Open Graph, Twitter and JSON-LD on every client navigation; `useSeo` / `useExtraJsonLd` for data-driven pages (announcements, FAQ) |
| Homepage + template | `apps/web/index.html`, Vite plugin in `vite.config.ts` | Renders the homepage tags + site-wide Organization/WebSite JSON-LD |
| Static pages | `apps/web/scripts/seo-postbuild.mjs` | Writes `dist/<route>.html` for every public route, `404.html`, app shells, announcement pages, `sitemap.xml` |
| Hosting rules | `vercel.json`, `apps/web/vercel.json` | `cleanUrls`, no trailing slash, `www` → apex 301, real 404s (no catch-all rewrite), `X-Robots-Tag: noindex` on private areas |
| Discovery files | `apps/web/public/robots.txt`, `llms.txt`, `site.webmanifest`, `og-image.png`, `sitemap.xml` | Crawl rules, AI-engine summary, PWA manifest, 1200×630 share image, baseline sitemap |
| Audit | `apps/web/scripts/seo-verify.mjs` | ~800 automated checks against `dist/` |

Private areas (`/dashboard/*`, `/admin/*`, `/forgot-password`, `/reset-password`, `/verify-email`) and unknown URLs
are `noindex`, have no canonical, and are excluded from the sitemap.

## Everyday tasks

**Change a page's title/description/priority** → edit `PAGES` in `apps/web/src/seo/core.js`, then `npm run build`.
Keep titles ≤ 60 chars and descriptions 70–160 chars; `npm run seo:check -w @sicoin/web` enforces this.

**Add a new public page**
1. Add the route in `apps/web/src/App.tsx`.
2. Add an entry to `PAGES` in `core.js` (set `index: false` for private/transactional pages).
3. Add it to `NAV_LINKS` if it belongs in the crawlable navigation.
4. Build and run `npm run seo:check -w @sicoin/web`.

**Add social profiles** (X, LinkedIn, GitHub, Telegram…) → fill `SITE.social` in `core.js`; they are emitted as
schema.org `sameAs`, which helps Google connect the brand entity.

## Environment variables (set in Vercel → Project → Settings → Environment Variables)

| Variable | Purpose |
| --- | --- |
| `SEO_API_URL` | e.g. `https://api.sicoinx.com`. Lets the build pre-render each published announcement and list it in the sitemap. Announcements published after a deploy still work (client rendered) and are picked up on the next deploy — add a Vercel Deploy Hook on a schedule/CMS publish if you want this automatic. |
| `SEO_GOOGLE_VERIFICATION`, `SEO_BING_VERIFICATION`, `SEO_YANDEX_VERIFICATION` | Ownership tokens rendered as `<meta>` tags on every page. |

## After the first deploy (one-time, ~15 min)

1. **Google Search Console** → add `https://sicoinx.com` as a *Domain* property (DNS TXT) → Sitemaps → submit `sitemap.xml`.
2. **Bing Webmaster Tools** → import from Search Console (also feeds DuckDuckGo/Yahoo/Ecosia and ChatGPT search).
3. Search Console → URL Inspection → *Request indexing* for `/`, `/tokenomics`, `/market`, `/about`, `/whitepaper`.
4. In Vercel → Domains, make `sicoinx.com` the primary domain; `www.sicoinx.com` is redirected to it by `vercel.json`.
5. Validate: [Rich Results Test](https://search.google.com/test/rich-results), [Schema validator](https://validator.schema.org),
   [PageSpeed Insights](https://pagespeed.web.dev), and share a link in Slack/X/LinkedIn to confirm the preview image.

## Checks

```bash
npm run build -w @sicoin/web        # build + pre-render + sitemap
npm run seo:check -w @sicoin/web    # audit dist/ (exits non-zero on any failure)
npm run seo:sitemap -w @sicoin/web  # regenerate public/sitemap.xml (static pages only)
```
