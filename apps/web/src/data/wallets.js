// Single source of truth for the public wallet directory (/wallets).
// Plain ESM JavaScript on purpose (like src/seo/core.js): it is imported by the browser app AND by the
// Node build step that pre-renders one static page per wallet, so keep it free of browser/Node APIs.
//
// Editorial rules for this file:
//  - All copy is original and deliberately modest. No user counts, rankings, ratings or "most trusted" claims:
//    they go stale, cannot be verified here, and SI Coin's own standard is "no fabricated metrics".
//  - Listing a wallet is NOT an endorsement or certification. Availability and features are described at a
//    high level from each project's public description; always confirm on the provider's official site.
//  - `website` must be the provider's official domain (checked with a reachability test when added).

/** @typedef {'IOS'|'ANDROID'|'WEB'|'HARDWARE'} Device */
/** @typedef {'user'|'hardware'|'agentic'} Category */
/**
 * @typedef {Object} Wallet
 * @property {string} id               URL slug (/wallets/:id). Lowercase letters, digits and hyphens only.
 * @property {string} name
 * @property {Category} category
 * @property {string} kind             Short human label for the wallet type.
 * @property {string} tagline          One line, <= 70 characters.
 * @property {string} summary          2-3 sentences, original wording.
 * @property {string[]} highlights     3 short, factual bullet points.
 * @property {string} bestFor          Who it tends to suit.
 * @property {Device[]} devices        Where it is available. Empty for infrastructure products.
 * @property {string[]} capabilities   Developer interfaces (agent wallets only), e.g. CLI, MCP, SDK, API.
 * @property {string} website          Official site (https).
 * @property {boolean} [evm]           Works with EVM-compatible networks (SI Coin is planned as an ERC-20).
 * @property {string} [caveat]         Extra caution shown on the detail page.
 */

export const DIRECTORY_UPDATED = '2026-11-19';

/** @type {readonly Device[]} */
export const DEVICES = ['IOS', 'ANDROID', 'WEB', 'HARDWARE'];

/** @type {Record<Device, string>} */
export const DEVICE_LABELS = {
  IOS: 'iOS app',
  ANDROID: 'Android app',
  WEB: 'Browser / web',
  HARDWARE: 'Hardware device',
};

export const CATEGORIES = [
  { id: 'all', label: 'All wallets' },
  { id: 'user', label: 'Software wallets' },
  { id: 'hardware', label: 'Hardware wallets' },
  { id: 'agentic', label: 'Agent wallets' },
];

export const CAPABILITIES = ['CLI', 'MCP', 'SDK', 'API', 'x402'];

export const SORTS = [
  { id: 'featured', label: 'Featured order' },
  { id: 'name', label: 'Name A–Z' },
];

/** What each category means, shown on the cards and detail pages. */
export const CATEGORY_INFO = {
  user: {
    label: 'Software wallet',
    blurb:
      'An app or browser extension on a device you already own. Convenient for everyday use; its security depends on the device it runs on and on how carefully you protect your recovery phrase.',
  },
  hardware: {
    label: 'Hardware wallet',
    blurb:
      'A dedicated device that keeps your private keys offline and asks you to confirm every transaction physically. Usually the choice for larger, long-term holdings; you buy the device once.',
  },
  agentic: {
    label: 'Agent wallet infrastructure',
    blurb:
      'Developer tooling that lets software (including AI agents) sign transactions within limits a human defines. It is infrastructure for builders, not a consumer wallet app.',
  },
};

/** @type {Wallet[]} */
export const WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    category: 'user',
    kind: 'Browser extension & mobile wallet',
    tagline: 'Browser extension and mobile wallet for EVM networks',
    summary:
      'MetaMask is a widely used wallet for Ethereum and other EVM-compatible networks, available as a browser extension and a mobile app. It can also serve as the signing layer for hardware wallets such as Ledger and Trezor.',
    highlights: ['Browser extension plus iOS and Android apps', 'Works with EVM-compatible networks', 'Can connect a hardware wallet for signing'],
    bestFor: 'People who mostly use decentralized apps from a desktop browser',
    devices: ['IOS', 'ANDROID', 'WEB'],
    capabilities: [],
    website: 'https://metamask.io/',
    evm: true,
  },
  {
    id: 'trust-wallet',
    name: 'Trust Wallet',
    category: 'user',
    kind: 'Mobile wallet & browser extension',
    tagline: 'Multi-chain self-custody wallet for mobile and browser',
    summary:
      'Trust Wallet is a multi-chain, self-custody wallet with mobile apps and a browser extension. It lets you hold assets from many networks in one place and connect to decentralized apps.',
    highlights: ['iOS, Android and browser extension', 'Holds assets from many networks', 'You control the recovery phrase'],
    bestFor: 'Mobile-first users who want one wallet across several networks',
    devices: ['IOS', 'ANDROID', 'WEB'],
    capabilities: [],
    website: 'https://trustwallet.com/',
    evm: true,
  },
  {
    id: 'binance-wallet',
    name: 'Binance Wallet',
    category: 'user',
    kind: 'Wallet inside the Binance app',
    tagline: 'A Web3 wallet built into the Binance mobile app',
    summary:
      'Binance Wallet is the Web3 wallet that lives inside the Binance mobile app, so people who already use Binance can reach on-chain applications without installing a separate wallet.',
    highlights: ['Available inside the Binance app', 'Mobile only (iOS and Android)', 'No extra app to install for Binance users'],
    bestFor: 'Existing Binance app users who want on-chain access from the same app',
    devices: ['IOS', 'ANDROID'],
    capabilities: [],
    website: 'https://www.binance.com/en/web3wallet',
    evm: true,
    caveat: 'It is part of the Binance app, so it follows that app’s availability, terms and regional restrictions.',
  },
  {
    id: 'rabby',
    name: 'Rabby Wallet',
    category: 'user',
    kind: 'Browser extension',
    tagline: 'Browser wallet that previews transactions before you sign',
    summary:
      'Rabby is a browser-extension wallet for EVM networks. It shows what a transaction is expected to do before you sign it and helps you review and revoke token approvals.',
    highlights: ['Transaction preview before signing', 'Token approval review', 'Switches networks automatically per app'],
    bestFor: 'Desktop users who want extra visibility into what they are signing',
    devices: ['WEB'],
    capabilities: [],
    website: 'https://rabby.io/',
    evm: true,
  },
  {
    id: 'safe',
    name: 'Safe',
    category: 'user',
    kind: 'Multi-signature smart-contract wallet',
    tagline: 'Smart-contract wallet that needs several approvals to move funds',
    summary:
      'Safe is a smart-contract wallet where a transaction only goes through after a set number of owners approve it. Teams and treasuries commonly use it so that no single person can move funds alone.',
    highlights: ['Several signers must approve each transaction', 'Web app with iOS and Android apps', 'Owners can be hardware or software wallets'],
    bestFor: 'Teams, organizations and anyone who wants shared control over funds',
    devices: ['WEB', 'IOS', 'ANDROID'],
    capabilities: [],
    website: 'https://safe.global/',
    evm: true,
    caveat: 'A Safe lives on a specific network. Check that it is deployed on the network you intend to use before sending funds to it.',
  },
  {
    id: 'coin98',
    name: 'Coin98 Wallet',
    category: 'user',
    kind: 'Mobile wallet & browser extension',
    tagline: 'Multi-chain wallet with built-in swap and DeFi tools',
    summary:
      'Coin98 Wallet is a multi-chain wallet available on mobile and as a browser extension, with swap and decentralized-finance features built into the app.',
    highlights: ['iOS, Android and browser extension', 'Built-in swap and DeFi features', 'Multi-chain support'],
    bestFor: 'Users who want swaps and DeFi tools inside the wallet app',
    devices: ['IOS', 'ANDROID', 'WEB'],
    capabilities: [],
    website: 'https://coin98.com/',
    evm: true,
  },
  {
    id: 'bitget-wallet',
    name: 'Bitget Wallet',
    category: 'user',
    kind: 'Mobile wallet & browser extension',
    tagline: 'Multi-chain wallet from Bitget (formerly BitKeep)',
    summary:
      'Bitget Wallet, previously known as BitKeep, is a multi-chain wallet with mobile apps and a browser extension that also includes swap and discovery features for decentralized apps.',
    highlights: ['iOS, Android and browser extension', 'Multi-chain support', 'Swap and app discovery built in'],
    bestFor: 'Users who want a multi-chain wallet with built-in swaps',
    devices: ['IOS', 'ANDROID', 'WEB'],
    capabilities: [],
    website: 'https://web3.bitget.com/',
    evm: true,
  },
  {
    id: 'tokenpocket',
    name: 'TokenPocket',
    category: 'user',
    kind: 'Mobile wallet & browser extension',
    tagline: 'Multi-chain wallet with a built-in decentralized app browser',
    summary:
      'TokenPocket is a multi-chain wallet for managing digital assets and opening decentralized apps, offered on mobile and as a browser extension.',
    highlights: ['iOS, Android and browser extension', 'Multi-chain asset management', 'Opens decentralized apps from inside the wallet'],
    bestFor: 'People who use many networks and prefer opening apps from within the wallet',
    devices: ['IOS', 'ANDROID', 'WEB'],
    capabilities: [],
    website: 'https://www.tokenpocket.pro/',
    evm: true,
  },
  {
    id: 'math-wallet',
    name: 'MathWallet',
    category: 'user',
    kind: 'Multi-platform wallet',
    tagline: 'Multi-platform wallet covering a large number of blockchains',
    summary:
      'MathWallet offers mobile, browser and web access to a large number of blockchains from a single wallet, aimed at people who work across many networks.',
    highlights: ['iOS, Android and browser access', 'Very broad blockchain coverage', 'Aimed at multi-network users'],
    bestFor: 'Users who need one wallet to cover many different blockchains',
    devices: ['IOS', 'ANDROID', 'WEB'],
    capabilities: [],
    website: 'https://mathwallet.org/',
    evm: true,
  },
  {
    id: 'safepal',
    name: 'SafePal',
    category: 'user',
    kind: 'Software wallet with hardware devices',
    tagline: 'Software wallet with optional offline hardware devices',
    summary:
      'SafePal pairs a mobile and browser wallet with its own hardware devices that keep keys offline, so you can start with software and add a hardware device later.',
    highlights: ['Mobile and browser wallet', 'Optional hardware devices', 'Software and hardware work together'],
    bestFor: 'Users who want the option to move to offline key storage later',
    devices: ['IOS', 'ANDROID', 'WEB', 'HARDWARE'],
    capabilities: [],
    website: 'https://www.safepal.com/',
    evm: true,
  },
  {
    id: 'imtoken',
    name: 'imToken',
    category: 'user',
    kind: 'Mobile wallet',
    tagline: 'Mobile wallet for managing digital assets',
    summary: 'imToken is a mobile wallet for managing digital assets across supported networks, available on iOS and Android.',
    highlights: ['iOS and Android apps', 'Multi-asset management', 'Mobile-first design'],
    bestFor: 'People who only need a straightforward mobile wallet',
    devices: ['IOS', 'ANDROID'],
    capabilities: [],
    website: 'https://token.im/',
    evm: true,
  },
  {
    id: 'onto-wallet',
    name: 'ONTO Wallet',
    category: 'user',
    kind: 'Mobile wallet & browser extension',
    tagline: 'Multi-chain wallet from the Ontology ecosystem',
    summary:
      'ONTO is a multi-chain wallet from the Ontology ecosystem, available on mobile and as a browser extension, with a focus on managing digital assets and decentralized identity features.',
    highlights: ['iOS, Android and browser extension', 'Multi-chain asset management', 'Ties into the Ontology identity ecosystem'],
    bestFor: 'Users interested in the Ontology ecosystem and its identity tools',
    devices: ['IOS', 'ANDROID', 'WEB'],
    capabilities: [],
    website: 'https://onto.app/',
    evm: true,
  },
  {
    id: 'mew',
    name: 'MyEtherWallet',
    category: 'user',
    kind: 'Open-source wallet interface',
    tagline: 'Free, open-source interface for Ethereum wallets',
    summary:
      'MyEtherWallet (MEW) is a free, open-source interface for creating and using Ethereum wallets. It is offered as a web app and on mobile.',
    highlights: ['Open-source code', 'Web app plus iOS and Android apps', 'Focused on Ethereum and EVM networks'],
    bestFor: 'Users who prefer open-source software focused on Ethereum',
    devices: ['WEB', 'IOS', 'ANDROID'],
    capabilities: [],
    website: 'https://www.myetherwallet.com/',
    evm: true,
    caveat: 'Always type the address yourself or use a bookmark. Look-alike MEW sites exist; a wrong site can steal a recovery phrase.',
  },
  {
    id: 'torus',
    name: 'Torus',
    category: 'user',
    kind: 'Social-login wallet',
    tagline: 'Access a wallet with a familiar social or email login',
    summary:
      'Torus lets people open a wallet with a social or email login instead of writing down a seed phrase, using distributed key management so that no single party holds the whole key.',
    highlights: ['Login with an existing account', 'No seed phrase to write down at sign-up', 'Distributed key management'],
    bestFor: 'Newcomers who find seed phrases intimidating',
    devices: ['WEB'],
    capabilities: [],
    website: 'https://tor.us/',
    evm: true,
    caveat: 'Your access depends on your login account. Protect that account with strong, unique credentials and two-factor authentication.',
  },
  {
    id: 'ledger',
    name: 'Ledger',
    category: 'hardware',
    kind: 'Hardware wallet',
    tagline: 'Hardware wallet that keeps private keys offline',
    summary:
      'Ledger devices store your private keys in a dedicated secure chip and require you to confirm each transaction on the device itself. They are used together with the Ledger app or a compatible software wallet.',
    highlights: ['Keys stay on the device', 'Physical confirmation for every transaction', 'Works with its own apps and compatible wallets'],
    bestFor: 'Holders who want offline key storage for larger or long-term balances',
    devices: ['HARDWARE', 'IOS', 'ANDROID', 'WEB'],
    capabilities: [],
    website: 'https://www.ledger.com/',
    evm: true,
    caveat: 'Fake apps and counterfeit devices target Ledger users. Use only the official Ledger app and the manufacturer’s own setup instructions.',
  },
  {
    id: 'trezor',
    name: 'Trezor',
    category: 'hardware',
    kind: 'Hardware wallet',
    tagline: 'Open-source hardware wallet confirmed on the device',
    summary:
      'Trezor makes hardware wallets with open-source firmware. Transactions are confirmed on the device, and it is used with Trezor Suite or compatible wallets.',
    highlights: ['Open-source firmware', 'Transactions confirmed on the device', 'Works with Trezor Suite and compatible wallets'],
    bestFor: 'Holders who value open-source code and offline key storage',
    devices: ['HARDWARE', 'WEB', 'ANDROID'],
    capabilities: [],
    website: 'https://trezor.io/',
    evm: true,
    caveat: 'Counterfeit devices and look-alike apps exist. Use only Trezor’s official software and the manufacturer’s own setup instructions.',
  },
  {
    id: 'trust-wallet-agentkit',
    name: 'Trust Wallet AgentKit (TWAK)',
    category: 'agentic',
    kind: 'Agent wallet infrastructure',
    tagline: 'Self-custody wallet tooling for autonomous agents',
    summary:
      'TWAK is wallet infrastructure from the Trust Wallet team that lets autonomous agents transact within spending caps and asset allowlists that you define. The provider describes support for the x402 payment standard.',
    highlights: ['Spending caps and asset allowlists', 'Command line, MCP and SDK access', 'x402 payment standard support (per the provider)'],
    bestFor: 'Developers building agents that need to pay or transact on-chain within limits',
    devices: [],
    capabilities: ['CLI', 'MCP', 'SDK', 'x402'],
    website: 'https://portal.trustwallet.com/',
    caveat: 'Third-party developer product. Capabilities are as described by the provider; read its documentation before relying on them.',
  },
  {
    id: 'altana',
    name: 'Altana',
    category: 'agentic',
    kind: 'Agent wallet infrastructure',
    tagline: 'Non-custodial agent wallet with on-chain spending limits',
    summary:
      'Altana provides a non-custodial wallet for agents with on-chain spending limits, session keys that expire after a set time, and passkey-based recovery.',
    highlights: ['On-chain spending limits', 'Time-bounded session keys', 'Passkey recovery'],
    bestFor: 'Developers who want enforceable limits on what an agent can spend',
    devices: [],
    capabilities: ['MCP', 'SDK', 'API'],
    website: 'https://www.altana.network/',
    caveat: 'Third-party developer product. Capabilities are as described by the provider; read its documentation before relying on them.',
  },
  {
    id: 'turnkey',
    name: 'Turnkey',
    category: 'agentic',
    kind: 'Agent wallet infrastructure',
    tagline: 'Enclave-secured wallet infrastructure with policy controls',
    summary:
      'Turnkey provides wallet infrastructure that signs inside secure enclaves, with policy-based spending controls and scoped sessions so that an agent only has the access you grant it.',
    highlights: ['Signing inside secure enclaves', 'Policy-based spending controls', 'Scoped sessions for agents'],
    bestFor: 'Developers who need programmatic signing with policy guardrails',
    devices: [],
    capabilities: ['MCP', 'SDK', 'API'],
    website: 'https://www.turnkey.com/',
    caveat: 'Third-party developer product. Capabilities are as described by the provider; read its documentation before relying on them.',
  },
];

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

/** @param {string} id @returns {Wallet|undefined} */
export function getWallet(id) {
  return WALLETS.find((w) => w.id === String(id || '').toLowerCase());
}

/**
 * Wallets related to `id`: same category first, then shared platforms. Never includes the wallet itself.
 * @param {string} id @param {number} [limit]
 */
export function relatedWallets(id, limit = 3) {
  const base = getWallet(id);
  if (!base) return [];
  const score = (w) =>
    (w.category === base.category ? 10 : 0) + w.devices.filter((d) => base.devices.includes(d)).length;
  return WALLETS.filter((w) => w.id !== base.id)
    .map((w, i) => ({ w, s: score(w), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.w);
}

/** Resolves a comma separated id list to wallets (unknown/duplicate ids dropped, max `limit`). */
export function resolveCompare(idsParam, limit = 3) {
  const seen = new Set();
  const out = [];
  for (const raw of String(idsParam || '').split(',')) {
    const w = getWallet(raw.trim());
    if (w && !seen.has(w.id)) {
      seen.add(w.id);
      out.push(w);
      if (out.length >= limit) break;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Filtering, sorting and URL state
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} WalletFilters
 * @property {string} q
 * @property {'all'|Category} category
 * @property {'ALL'|Device} device
 * @property {'ALL'|string} capability
 * @property {'featured'|'name'} sort
 */

/** @type {WalletFilters} */
export const DEFAULT_FILTERS = { q: '', category: 'all', device: 'ALL', capability: 'ALL', sort: 'featured' };

const haystack = (w) =>
  [w.name, w.kind, w.tagline, w.summary, w.bestFor, ...w.highlights, ...w.capabilities, ...w.devices.map((d) => DEVICE_LABELS[d])]
    .join(' ')
    .toLowerCase();

/**
 * @param {Wallet[]} list @param {Partial<WalletFilters>} [filters]
 * @returns {Wallet[]}
 */
export function filterWallets(list, filters = {}) {
  const f = { ...DEFAULT_FILTERS, ...filters };
  const tokens = f.q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const out = list.filter((w) => {
    if (f.category !== 'all' && w.category !== f.category) return false;
    if (f.device !== 'ALL' && !w.devices.includes(f.device)) return false;
    if (f.capability !== 'ALL' && !w.capabilities.includes(f.capability)) return false;
    if (tokens.length) {
      const h = haystack(w);
      if (!tokens.every((t) => h.includes(t))) return false;
    }
    return true;
  });
  if (f.sort === 'name') return [...out].sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

/** Parses ?q=&cat=&device=&cap=&sort= into validated filters. Unknown values fall back to defaults. */
export function parseFilters(search) {
  const p = new URLSearchParams(search || '');
  const cat = p.get('cat');
  const device = (p.get('device') || '').toUpperCase();
  const cap = p.get('cap');
  const sort = p.get('sort');
  return {
    q: (p.get('q') || '').slice(0, 80),
    category: CATEGORIES.some((c) => c.id === cat) ? cat : 'all',
    device: DEVICES.includes(device) ? device : 'ALL',
    capability: CAPABILITIES.includes(cap || '') ? cap : 'ALL',
    sort: SORTS.some((s) => s.id === sort) ? sort : 'featured',
  };
}

/** Serialises filters, omitting defaults so the default view has a clean URL. */
export function serializeFilters(filters) {
  const f = { ...DEFAULT_FILTERS, ...filters };
  const p = new URLSearchParams();
  if (f.q.trim()) p.set('q', f.q.trim());
  if (f.category !== 'all') p.set('cat', f.category);
  if (f.device !== 'ALL') p.set('device', f.device.toLowerCase());
  if (f.capability !== 'ALL') p.set('cap', f.capability);
  if (f.sort !== 'featured') p.set('sort', f.sort);
  return p.toString();
}

/** Directory totals used by the hero and filter chips. */
export function directoryStats(list = WALLETS) {
  const count = (fn) => list.filter(fn).length;
  return {
    total: list.length,
    user: count((w) => w.category === 'user'),
    hardware: count((w) => w.category === 'hardware'),
    agentic: count((w) => w.category === 'agentic'),
    byDevice: Object.fromEntries(DEVICES.map((d) => [d, count((w) => w.devices.includes(d))])),
  };
}

// ---------------------------------------------------------------------------
// SEO helpers (used by src/seo/core.js)
// ---------------------------------------------------------------------------

const clamp = (text, max) => {
  const t = String(text).replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:.\-–—]+$/, '')}…`;
};

/** @param {Wallet} w */
export function walletSeo(w) {
  const platforms = w.devices.length ? w.devices.map((d) => DEVICE_LABELS[d]).join(', ') : w.capabilities.join(', ');
  return {
    title: clamp(`${w.name}: Platforms, Features & Safety | SI Coin`, 60),
    description: clamp(`${w.tagline}. Available: ${platforms}. Who it suits, how it compares and how to stay safe before using it with SI Coin.`, 158),
    h1: `${w.name} — ${CATEGORY_INFO[w.category].label}`,
    lead: w.summary,
    points: w.highlights,
    breadcrumb: w.name,
  };
}
