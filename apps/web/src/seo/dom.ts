import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE, resolveSeo, absoluteUrl } from './core.js';
import type { SeoModel } from './types';

const JSONLD_ID = 'seo-jsonld';

function head(): HTMLHeadElement | null {
  return typeof document === 'undefined' ? null : document.head;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string | undefined) {
  const h = head();
  if (!h) return;
  let el = h.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (content === undefined || content === '') {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    h.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string | null, extra?: Record<string, string>) {
  const h = head();
  if (!h) return;
  const sel = extra?.hreflang ? `link[rel="${rel}"][hreflang="${extra.hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let el = h.querySelector<HTMLLinkElement>(sel);
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (extra) for (const [k, v] of Object.entries(extra)) el.setAttribute(k, v);
    h.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(data: object | null) {
  const h = head();
  if (!h) return;
  let el = document.getElementById(JSONLD_ID) as HTMLScriptElement | null;
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.id = JSONLD_ID;
    el.type = 'application/ld+json';
    h.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/** Writes a SEO model into <head>. Mirrors what scripts/seo-postbuild.mjs renders statically. */
export function applySeo(m: SeoModel) {
  if (typeof document === 'undefined') return;
  document.title = m.title;
  upsertMeta('name', 'description', m.description);
  upsertMeta('name', 'robots', m.robots);
  upsertLink('canonical', m.canonical);
  upsertLink('alternate', m.canonical, { hreflang: 'en' });
  upsertLink('alternate', m.canonical, { hreflang: 'x-default' });

  upsertMeta('property', 'og:type', m.ogType);
  upsertMeta('property', 'og:title', m.title);
  upsertMeta('property', 'og:description', m.description);
  upsertMeta('property', 'og:url', m.canonical ?? absoluteUrl(m.path));
  upsertMeta('property', 'og:image', m.image);
  upsertMeta('property', 'og:image:alt', m.imageAlt);
  upsertMeta('property', 'article:published_time', m.publishedTime);
  upsertMeta('property', 'article:modified_time', m.modifiedTime);

  upsertMeta('name', 'twitter:title', m.title);
  upsertMeta('name', 'twitter:description', m.description);
  upsertMeta('name', 'twitter:image', m.image);
  upsertMeta('name', 'twitter:image:alt', m.imageAlt);

  setJsonLd(m.jsonLd);
}

/**
 * Page-level override (e.g. an article or FAQ page whose metadata depends on
 * data loaded at runtime). Pass `null` while the data is loading.
 */
export function useSeo(model: SeoModel | null) {
  // Serialise so inline-built models don't retrigger the effect on every render.
  const key = model ? JSON.stringify(model) : '';
  useEffect(() => {
    if (model) applySeo(model);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/**
 * Adds structured data to whatever the current route already set (FAQ items,
 * etc.) without touching the rest of the head.
 */
export function useExtraJsonLd(base: SeoModel | null, extra: object | null) {
  const key = JSON.stringify([base?.path, extra]);
  useEffect(() => {
    if (!base || !extra) return;
    const graph = base.jsonLd ? [base.jsonLd, extra] : [extra];
    setJsonLd(graph.length === 1 ? graph[0] : { '@context': 'https://schema.org', '@graph': graph.flatMap(flatten) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

function flatten(node: any): any[] {
  if (node && Array.isArray(node['@graph'])) return node['@graph'];
  if (node && node['@context']) {
    const { ['@context']: _ctx, ...rest } = node;
    return [rest];
  }
  return [node];
}

/** Applies route-based metadata on every navigation. Render once, inside <BrowserRouter>. */
export const RouteSeo = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    applySeo(resolveSeo(pathname));
  }, [pathname]);
  return null;
};

export { SITE };
