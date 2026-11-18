// Single source of truth for all SEO data. Plain ESM JavaScript on purpose:
// it is imported both by the browser app (src/seo/dom.ts, via Vite) and by the
// Node post-build script (scripts/seo-postbuild.mjs) that generates the static
// per-page HTML, sitemap.xml and robots.txt. Keep it free of browser/Node APIs.

/**
 * @typedef {Object} PageConfig
 * @property {string} title          Full <title> (target <= 60 chars).
 * @property {string} description    Meta description (target 70-160 chars).
 * @property {string} h1             Heading used in the crawlable fallback markup.
 * @property {string} lead           Intro paragraph used in the fallback markup.
 * @property {string[]} [points]     Key facts rendered as a list in the fallback markup.
 * @property {string} breadcrumb     Short label used in the BreadcrumbList.
 * @property {string} [schemaType]   schema.org page type (default "WebPage").
 * @property {boolean} index         true = indexable and listed in sitemap.xml.
 * @property {string} [changefreq]
 * @property {number} [priority]
 * @property {string} [source]       Source file (relative to apps/web) for sitemap <lastmod>.
 */

export const SITE = {
  url: 'https://www.sicoinx.com',
  name: 'SI Coin',
  alternateNames: ['SICOINX', 'SI Coin Ecosystem'],
  legalName: 'SI Coin Ecosystem Foundation',
  tagline: 'A Clearer Way to Explore Digital Value',
  description:
    'SI Coin (SICOINX) is a transparent digital asset ecosystem with verified tokenomics, audited reference pricing, interactive calculators and strict non-custodial architecture.',
  email: 'info@sicoin.org',
  language: 'en',
  locale: 'en_US',
  themeColor: '#175CFF',
  logo: '/android-chrome-512x512.png',
  logoSize: 512,
  ogImage: '/og-image.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'SI Coin — A Clearer Way to Explore Digital Value',
  // Add official profile URLs here (X/Twitter, LinkedIn, GitHub, Telegram...).
  // They are emitted as schema.org "sameAs" and strengthen the brand entity.
  social: [],
  twitterHandle: '', // e.g. '@sicoinx'
};

export const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
export const ROBOTS_NOINDEX = 'noindex, nofollow';

/** @type {Record<string, PageConfig>} */
export const PAGES = {
  '/': {
    title: 'SI Coin (SICOINX) — A Clearer Way to Explore Digital Value',
    description:
      'SI Coin (SICOINX) is a transparent digital asset ecosystem: verified tokenomics, audited reference pricing, interactive calculators and non-custodial tools.',
    h1: 'A Clearer Way to Explore Digital Value.',
    lead:
      'Discover SI Coin through transparent information, simple tools, and one connected ecosystem. Audited reference pricing, verified tokenomics, and strict non-custodial architecture.',
    points: [
      'Fixed supply of 100,000,000 SI',
      'Reference price published with immutable provenance',
      'Interactive USD to SI calculator and historical price chart',
      'Non-custodial wallet architecture',
      'Sepolia testnet preview',
    ],
    breadcrumb: 'Home',
    index: true,
    changefreq: 'daily',
    priority: 1.0,
    source: 'src/pages/public/HomePage.tsx',
  },
  '/about': {
    title: 'About SI Coin — Verifiable, Non-Custodial Digital Value',
    description:
      'Learn why SI Coin exists: to replace opaque crypto marketing with mathematical accountability, verifiable price provenance and explicit financial boundaries.',
    h1: 'A Clearer Standard for Cryptographic Value',
    lead:
      'SI Coin was founded to eliminate opacity in digital assets by replacing misleading marketing claims with mathematical accountability and verifiable provenance.',
    points: [
      'Absolute provenance for every displayed price observation',
      'Non-custodial design: you keep control of your keys',
      'Explicit financial boundaries: no guaranteed returns or staking yields',
    ],
    breadcrumb: 'About',
    schemaType: 'AboutPage',
    index: true,
    changefreq: 'monthly',
    priority: 0.8,
    source: 'src/pages/public/AboutPage.tsx',
  },
  '/ecosystem': {
    title: 'SI Coin Ecosystem — Identity, Telemetry & Governance Modules',
    description:
      'Explore every live, in-development and planned SI Coin ecosystem module across identity, telemetry, developer tooling and decentralized governance.',
    h1: 'SI Coin Connected Ecosystem',
    lead:
      'Explore all live, in-development, and planned infrastructure modules across identity, telemetry, developer tooling, and decentralized governance.',
    points: ['Available, in-development and planned modules', 'Filter the directory by delivery status'],
    breadcrumb: 'Ecosystem',
    index: true,
    changefreq: 'weekly',
    priority: 0.7,
    source: 'src/pages/public/EcosystemPage.tsx',
  },
  '/tokenomics': {
    title: 'SI Coin Tokenomics — 100M Fixed Supply & Linear Vesting',
    description:
      'Review the SI Coin token distribution: a fixed 100,000,000 SI supply, verified allocations that reconcile to exactly 100%, and transparent linear vesting schedules.',
    h1: 'Verifiable Tokenomics & Linear Vesting',
    lead:
      'SI Coin enforces a strict, mathematical distribution model. Total allocations must reconcile to exactly 100% of the fixed 100,000,000 SI supply before publication.',
    points: ['Fixed supply: 100,000,000 SI', 'Allocations reconcile to exactly 100%', 'Linear vesting schedules'],
    breadcrumb: 'Tokenomics',
    index: true,
    changefreq: 'weekly',
    priority: 0.8,
    source: 'src/pages/public/TokenomicsPage.tsx',
  },
  '/roadmap': {
    title: 'SI Coin Roadmap — Sepolia Testnet to Decentralized Governance',
    description:
      'Follow the SI Coin development roadmap: architectural foundations, Sepolia testnet verification, developer tooling and the transition to decentralized governance.',
    h1: 'SI Coin Development Roadmap',
    lead:
      'Our engineering roadmap tracks progress across architectural foundations, Sepolia testnet verification, developer tooling, and eventual decentralized governance transition.',
    points: ['Target dates are projected horizons, not financial guarantees'],
    breadcrumb: 'Roadmap',
    index: true,
    changefreq: 'weekly',
    priority: 0.7,
    source: 'src/pages/public/RoadmapPage.tsx',
  },
  '/market': {
    title: 'SI Coin Price — Reference Valuation & Historical Chart',
    description:
      'Track the SI Coin reference price with audited historical charts, a USD to SI calculator and an interactive 3D market view. Informational, not an exchange quote.',
    h1: 'SI Coin Valuation & Historical Feed',
    lead:
      'Examine transparent reference valuations, inspect audited historical time-series charts, and observe live 3D market liquidity waves, order-depth towers, and price trajectory.',
    points: ['Immutable price snapshots with explicit provenance', 'USD to SI calculator', 'Reference price is informational and not an executable quote'],
    breadcrumb: 'Market',
    index: true,
    changefreq: 'daily',
    priority: 0.9,
    source: 'src/pages/public/MarketPage.tsx',
  },
  '/whitepaper': {
    title: 'SI Coin Whitepaper — Architecture for Financial Transparency',
    description:
      'Read the SI Coin technical whitepaper: the architecture for verifiable financial transparency, supply model, price provenance and non-custodial design.',
    h1: 'SI Coin: Architecture for Verifiable Financial Transparency',
    lead: 'The official SI Coin technical paper, written by the SI Protocol Research & Engineering Group.',
    points: ['Abstract, architecture and supply model', 'Versioned and revision-dated', 'Printable / downloadable as PDF'],
    breadcrumb: 'Whitepaper',
    index: true,
    changefreq: 'monthly',
    priority: 0.8,
    source: 'src/pages/public/WhitepaperPage.tsx',
  },
  '/announcements': {
    title: 'SI Coin Announcements — Official News & Disclosures',
    description:
      'Official SI Coin announcements: protocol milestones, testnet verification reports, security audits and allocation disclosures, published as they happen.',
    h1: 'Official Announcements & Disclosures',
    lead:
      'Stay informed on protocol milestones, testnet verification reports, security audits, and allocation disclosures.',
    breadcrumb: 'Announcements',
    schemaType: 'CollectionPage',
    index: true,
    changefreq: 'daily',
    priority: 0.8,
    source: 'src/pages/public/AnnouncementsPage.tsx',
  },
  '/faq': {
    title: 'SI Coin FAQ — Pricing, Wallets, KYC & Support Answers',
    description:
      'Find clear answers about SI Coin architecture, reference pricing, non-custodial wallets, account verification and how to reach support.',
    h1: 'Frequently Asked Questions',
    lead:
      'Clear, documented answers regarding SI Coin architecture, reference pricing, non-custodial wallets, and support channels.',
    breadcrumb: 'FAQ',
    schemaType: 'FAQPage',
    index: true,
    changefreq: 'weekly',
    priority: 0.7,
    source: 'src/pages/public/FaqPage.tsx',
  },
  '/contact': {
    title: 'Contact SI Coin — Support, Partnerships & Bug Reports',
    description:
      'Contact the SI Coin team: submit technical questions, bug bounty findings or ecosystem partnership inquiries and get a response from our engineers.',
    h1: 'Connect with SI Coin Engineering',
    lead:
      'Submit technical questions, bug bounty findings, or ecosystem partnership inquiries directly to our team.',
    breadcrumb: 'Contact',
    schemaType: 'ContactPage',
    index: true,
    changefreq: 'yearly',
    priority: 0.6,
    source: 'src/pages/public/ContactPage.tsx',
  },
  '/terms': {
    title: 'Terms of Service | SI Coin',
    description:
      'Read the SI Coin Terms of Service: informational reference only, non-custodial interactions, account conduct and limitation of liability.',
    h1: 'Terms of Service',
    lead: 'The terms governing your use of the SI Coin platform and website.',
    breadcrumb: 'Terms of Service',
    index: true,
    changefreq: 'yearly',
    priority: 0.3,
    source: 'src/pages/public/TermsPage.tsx',
  },
  '/privacy': {
    title: 'Privacy Policy | SI Coin',
    description:
      'How SI Coin handles your data: what we collect, what we never collect, session and security cookies, and audit and access logs.',
    h1: 'Privacy Policy',
    lead: 'How SI Coin collects, uses and protects information.',
    breadcrumb: 'Privacy Policy',
    index: true,
    changefreq: 'yearly',
    priority: 0.3,
    source: 'src/pages/public/PrivacyPage.tsx',
  },
  '/risk-disclosure': {
    title: 'Risk Disclosure Statement | SI Coin',
    description:
      'Understand the risks of digital assets before you participate: market volatility, technical risk, no yield promises and regulatory uncertainty.',
    h1: 'Risk Disclosure Statement',
    lead: 'Digital assets are subject to market volatility and technical development uncertainty. Review these risks before participating.',
    breadcrumb: 'Risk Disclosure',
    index: true,
    changefreq: 'yearly',
    priority: 0.3,
    source: 'src/pages/public/RiskDisclosurePage.tsx',
  },
  '/register': {
    title: 'Create Your SI Coin Account — Free Registration',
    description:
      'Create your free SI Coin account to explore reference pricing, use the calculator, manage a non-custodial wallet and complete verification.',
    h1: 'Create your account',
    lead: 'Register for SI Coin to explore reference pricing, tools and your wallet dashboard.',
    breadcrumb: 'Create Account',
    index: true,
    changefreq: 'yearly',
    priority: 0.6,
    source: 'src/pages/auth/RegisterPage.tsx',
  },
  '/login': {
    title: 'Sign In to SI Coin — Account Login',
    description: 'Sign in to your SI Coin account to access your dashboard, wallet, transactions and account security settings.',
    h1: 'Sign in to your account',
    lead: 'Access your SI Coin dashboard, wallet and account security settings.',
    breadcrumb: 'Sign In',
    index: true,
    changefreq: 'yearly',
    priority: 0.4,
    source: 'src/pages/auth/LoginPage.tsx',
  },
  '/forgot-password': {
    title: 'Reset Your Password | SI Coin',
    description: 'Request a secure password reset link for your SI Coin account.',
    h1: 'Reset your password',
    lead: 'Enter your account email and we will send you a secure reset link.',
    breadcrumb: 'Forgot Password',
    index: false,
  },
  '/reset-password': {
    title: 'Set a New Password | SI Coin',
    description: 'Choose a new password to regain secure access to your SI Coin account.',
    h1: 'Set New Password',
    lead: 'Choose a new password for your SI Coin account.',
    breadcrumb: 'Reset Password',
    index: false,
  },
  '/verify-email': {
    title: 'Verify Your Email | SI Coin',
    description: 'Confirm your email address to activate your SI Coin account.',
    h1: 'Email Verification',
    lead: 'Confirming your email address to activate your SI Coin account.',
    breadcrumb: 'Verify Email',
    index: false,
  },
};

/** Generic metadata for sections that must never be indexed. */
export const PRIVATE_SECTIONS = {
  '/dashboard': {
    title: 'Dashboard | SI Coin',
    description: 'Your private SI Coin account dashboard.',
  },
  '/admin': {
    title: 'Administration | SI Coin',
    description: 'SI Coin administration console.',
  },
};

export const NOT_FOUND = {
  title: 'Page Not Found | SI Coin',
  description: 'The page you are looking for does not exist on SI Coin.',
};

/** Pages linked from the crawlable fallback markup (header + footer navigation). */
export const NAV_LINKS = [
  ['/about', 'About'],
  ['/ecosystem', 'Ecosystem'],
  ['/tokenomics', 'Tokenomics'],
  ['/market', 'Market'],
  ['/roadmap', 'Roadmap'],
  ['/whitepaper', 'Whitepaper'],
  ['/announcements', 'Announcements'],
  ['/faq', 'FAQ'],
  ['/contact', 'Contact'],
  ['/terms', 'Terms of Service'],
  ['/privacy', 'Privacy Policy'],
  ['/risk-disclosure', 'Risk Disclosure'],
  ['/register', 'Create Account'],
  ['/login', 'Sign In'],
];

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

export function absoluteUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return p === '/' ? `${SITE.url}/` : `${SITE.url}${p}`;
}

/** Strips query/hash and trailing slashes; "/About/" -> "/about". */
export function normalizePath(input) {
  let p = String(input || '/').split('#')[0].split('?')[0];
  if (!p.startsWith('/')) p = `/${p}`;
  p = p.replace(/\/{2,}/g, '/');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

// ---------------------------------------------------------------------------
// JSON-LD builders (schema.org)
// ---------------------------------------------------------------------------

const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    alternateName: SITE.alternateNames,
    url: `${SITE.url}/`,
    description: SITE.description,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE.url}/#logo`,
      url: `${SITE.url}${SITE.logo}`,
      contentUrl: `${SITE.url}${SITE.logo}`,
      width: SITE.logoSize,
      height: SITE.logoSize,
      caption: SITE.name,
    },
    image: { '@id': `${SITE.url}/#logo` },
    email: SITE.email,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: SITE.email,
        url: absoluteUrl('/contact'),
        availableLanguage: ['English'],
      },
    ],
    ...(SITE.social.length ? { sameAs: SITE.social } : {}),
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE.url}/`,
    name: SITE.name,
    alternateName: SITE.alternateNames,
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: { '@id': ORG_ID },
  };
}

function breadcrumbList(path, label, canonical) {
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }];
  if (path !== '/') {
    items.push({ '@type': 'ListItem', position: 2, name: label, item: canonical });
  }
  return { '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: items };
}

/** WebPage-family node + breadcrumb for a configured static page. */
export function pageJsonLd(path, cfg) {
  const canonical = absoluteUrl(path);
  const graph = [
    {
      '@type': cfg.schemaType === 'FAQPage' ? 'WebPage' : cfg.schemaType || 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: cfg.title,
      description: cfg.description,
      inLanguage: SITE.language,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': ORG_ID },
      primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE.url}${SITE.ogImage}`, width: SITE.ogImageWidth, height: SITE.ogImageHeight },
      breadcrumb: { '@id': `${canonical}#breadcrumb` },
    },
    breadcrumbList(path, cfg.breadcrumb, canonical),
  ];
  if (path === '/') {
    graph[0]['@type'] = 'WebPage';
    delete graph[0].breadcrumb;
    graph.pop();
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** FAQPage node. `faqs` = [{ question, answer }]. Returns null when empty. */
export function faqJsonLd(path, faqs) {
  const items = (faqs || [])
    .filter((f) => f && f.question && f.answer)
    .map((f) => ({
      '@type': 'Question',
      name: String(f.question),
      acceptedAnswer: { '@type': 'Answer', text: String(f.answer) },
    }));
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(path)}#faq`,
    url: absoluteUrl(path),
    inLanguage: SITE.language,
    mainEntity: items,
  };
}

function clip(text, max) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.&\-–—]+$/, '')}…`;
}

/**
 * Metadata for one announcement (/announcements/:slug).
 * @param {{slug:string,title:string,summary?:string,content?:string,category?:string,publishedAt?:string,createdAt?:string,updatedAt?:string}} a
 */
export function announcementSeo(a) {
  const path = `/announcements/${a.slug}`;
  const canonical = absoluteUrl(path);
  const title = clip(a.title, 52);
  const description = clip(a.summary || a.content || SITE.description, 158);
  const published = a.publishedAt || a.createdAt;
  const modified = a.updatedAt || published;
  const iso = (d) => {
    const t = d ? new Date(d) : null;
    return t && !Number.isNaN(t.getTime()) ? t.toISOString() : undefined;
  };
  const article = {
    '@type': 'Article',
    '@id': `${canonical}#article`,
    headline: clip(a.title, 110),
    description,
    url: canonical,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    ...(a.category ? { articleSection: a.category } : {}),
    ...(iso(published) ? { datePublished: iso(published) } : {}),
    ...(iso(modified) ? { dateModified: iso(modified) } : {}),
    inLanguage: SITE.language,
    image: [`${SITE.url}${SITE.ogImage}`],
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
  };
  const crumbs = {
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Announcements', item: absoluteUrl('/announcements') },
      { '@type': 'ListItem', position: 3, name: clip(a.title, 80), item: canonical },
    ],
  };
  return {
    path,
    title: `${title} | ${SITE.name}`,
    description,
    canonical,
    robots: ROBOTS_INDEX,
    ogType: 'article',
    image: `${SITE.url}${SITE.ogImage}`,
    imageAlt: SITE.ogImageAlt,
    publishedTime: iso(published),
    modifiedTime: iso(modified),
    jsonLd: { '@context': 'https://schema.org', '@graph': [article, crumbs] },
  };
}

// ---------------------------------------------------------------------------
// Route -> metadata model
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} SeoModel
 * @property {string} path
 * @property {string} title
 * @property {string} description
 * @property {string|null} canonical   Absolute URL, or null for noindex pages.
 * @property {string} robots
 * @property {string} ogType
 * @property {string} image
 * @property {string} imageAlt
 * @property {string} [publishedTime]
 * @property {string} [modifiedTime]
 * @property {object|null} jsonLd
 */

const defaultImage = () => `${SITE.url}${SITE.ogImage}`;

/** @returns {SeoModel} */
function noindexModel(path, meta) {
  return {
    path,
    title: meta.title,
    description: meta.description,
    canonical: null,
    robots: ROBOTS_NOINDEX,
    ogType: 'website',
    image: defaultImage(),
    imageAlt: SITE.ogImageAlt,
    jsonLd: null,
  };
}

/**
 * Resolves the SEO model for a URL path. Used by the router at runtime and by
 * the build step for every prerendered page.
 * @returns {SeoModel}
 */
export function resolveSeo(pathname) {
  const path = normalizePath(pathname);
  const key = path.toLowerCase();

  const cfg = PAGES[key];
  if (cfg) {
    if (!cfg.index) return noindexModel(key, cfg);
    return {
      path: key,
      title: cfg.title,
      description: cfg.description,
      canonical: absoluteUrl(key),
      robots: ROBOTS_INDEX,
      ogType: 'website',
      image: defaultImage(),
      imageAlt: SITE.ogImageAlt,
      jsonLd: pageJsonLd(key, cfg),
    };
  }

  for (const prefix of Object.keys(PRIVATE_SECTIONS)) {
    if (key === prefix || key.startsWith(`${prefix}/`)) return noindexModel(path, PRIVATE_SECTIONS[prefix]);
  }

  const m = /^\/announcements\/([^/]+)$/.exec(path);
  if (m) {
    // Placeholder until the announcement itself loads (AnnouncementDetailPage
    // then replaces it with article-specific metadata).
    return {
      path,
      title: `Announcement | ${SITE.name}`,
      description: PAGES['/announcements'].description,
      canonical: absoluteUrl(path),
      robots: ROBOTS_INDEX,
      ogType: 'article',
      image: defaultImage(),
      imageAlt: SITE.ogImageAlt,
      jsonLd: null,
    };
  }

  return noindexModel(path, NOT_FOUND);
}

/** Pages that are indexable and belong in sitemap.xml. */
export function indexablePaths() {
  return Object.keys(PAGES).filter((p) => PAGES[p].index);
}
