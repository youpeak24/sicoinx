// Run with: node --test scripts/wallets.test.mjs   (also part of `npm test` in apps/web)
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WALLETS,
  DEVICES,
  CATEGORIES,
  CAPABILITIES,
  DEFAULT_FILTERS,
  getWallet,
  relatedWallets,
  resolveCompare,
  filterWallets,
  parseFilters,
  serializeFilters,
  directoryStats,
  walletSeo,
} from '../src/data/wallets.js';

test('dataset: ids are unique, lowercase URL slugs', () => {
  const ids = WALLETS.map((w) => w.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, id);
});

test('dataset: required fields and length limits', () => {
  for (const w of WALLETS) {
    assert.ok(w.name.trim(), `${w.id} name`);
    assert.ok(w.tagline.length > 10 && w.tagline.length <= 70, `${w.id} tagline length ${w.tagline.length}`);
    assert.ok(w.summary.length >= 80 && w.summary.length <= 360, `${w.id} summary length ${w.summary.length}`);
    assert.equal(w.highlights.length, 3, `${w.id} highlights`);
    assert.ok(w.bestFor.trim(), `${w.id} bestFor`);
    assert.ok(['user', 'hardware', 'agentic'].includes(w.category), `${w.id} category`);
  }
});

test('dataset: official websites are https URLs without tracking parameters', () => {
  for (const w of WALLETS) {
    const u = new URL(w.website);
    assert.equal(u.protocol, 'https:', w.id);
    assert.equal(u.search, '', `${w.id} should not carry utm/query params`);
  }
});

test('dataset: devices and capabilities use the known vocabulary', () => {
  for (const w of WALLETS) {
    for (const d of w.devices) assert.ok(DEVICES.includes(d), `${w.id} device ${d}`);
    for (const c of w.capabilities) assert.ok(CAPABILITIES.includes(c), `${w.id} capability ${c}`);
    if (w.category === 'agentic') {
      assert.equal(w.devices.length, 0, `${w.id}: infrastructure has no consumer devices`);
      assert.ok(w.capabilities.length > 0, `${w.id}: needs developer interfaces`);
    } else {
      assert.ok(w.devices.length > 0, `${w.id}: needs at least one platform`);
      assert.equal(w.capabilities.length, 0, `${w.id}`);
    }
    if (w.category === 'hardware') assert.ok(w.devices.includes('HARDWARE'), `${w.id}`);
  }
});

test('dataset: no unverifiable marketing claims slipped into the copy', () => {
  const banned = /\b(\d+\s?(million|m\+|k\+)|most (trusted|popular)|#1|number one|best wallet|gold standard|guaranteed|100% secure|audited by)\b/i;
  for (const w of WALLETS) {
    const text = [w.tagline, w.summary, w.bestFor, w.caveat || '', ...w.highlights].join(' ');
    assert.doesNotMatch(text, banned, `${w.id}: ${text.match(banned)?.[0]}`);
  }
});

test('getWallet is case-insensitive and returns undefined for unknown ids', () => {
  assert.equal(getWallet('MetaMask')?.id, 'metamask');
  assert.equal(getWallet('nope'), undefined);
  assert.equal(getWallet(undefined), undefined);
});

test('filterWallets: category, device, capability', () => {
  assert.ok(filterWallets(WALLETS, { category: 'hardware' }).every((w) => w.category === 'hardware'));
  assert.deepEqual(
    filterWallets(WALLETS, { category: 'hardware' }).map((w) => w.id).sort(),
    ['ledger', 'trezor'],
  );
  assert.ok(filterWallets(WALLETS, { device: 'IOS' }).every((w) => w.devices.includes('IOS')));
  assert.ok(filterWallets(WALLETS, { device: 'HARDWARE' }).some((w) => w.id === 'safepal'));
  const mcp = filterWallets(WALLETS, { capability: 'MCP' });
  assert.ok(mcp.length >= 2 && mcp.every((w) => w.category === 'agentic'));
});

test('filterWallets: search requires every word and ignores case', () => {
  assert.deepEqual(filterWallets(WALLETS, { q: 'METAMASK' }).map((w) => w.id), ['metamask']);
  const both = filterWallets(WALLETS, { q: 'open source' });
  assert.ok(both.length >= 1);
  assert.equal(filterWallets(WALLETS, { q: 'metamask zzzzqqq' }).length, 0);
  assert.equal(filterWallets(WALLETS, { q: '   ' }).length, WALLETS.length);
});

test('filterWallets: name sort is alphabetical and does not mutate the input', () => {
  const before = WALLETS.map((w) => w.id).join();
  const sorted = filterWallets(WALLETS, { sort: 'name' }).map((w) => w.name);
  assert.deepEqual(sorted, [...sorted].sort((a, b) => a.localeCompare(b)));
  assert.equal(WALLETS.map((w) => w.id).join(), before);
});

test('URL state: round-trips and omits defaults', () => {
  assert.equal(serializeFilters(DEFAULT_FILTERS), '');
  const f = { q: 'ledger', category: 'hardware', device: 'WEB', capability: 'ALL', sort: 'name' };
  const qs = serializeFilters(f);
  assert.deepEqual(parseFilters(`?${qs}`), { ...DEFAULT_FILTERS, ...f });
});

test('URL state: invalid or hostile values fall back to defaults', () => {
  const f = parseFilters('?cat=<script>&device=pizza&cap=nope&sort=random&q=' + 'x'.repeat(500));
  assert.equal(f.category, 'all');
  assert.equal(f.device, 'ALL');
  assert.equal(f.capability, 'ALL');
  assert.equal(f.sort, 'featured');
  assert.equal(f.q.length, 80);
  assert.deepEqual(parseFilters(''), DEFAULT_FILTERS);
});

test('every category tab has at least one wallet', () => {
  for (const c of CATEGORIES.filter((c) => c.id !== 'all')) {
    assert.ok(filterWallets(WALLETS, { category: c.id }).length > 0, c.id);
  }
});

test('resolveCompare: drops unknown and duplicate ids, caps the list', () => {
  assert.deepEqual(resolveCompare('metamask,metamask,ghost,ledger,trezor,rabby').map((w) => w.id), ['metamask', 'ledger', 'trezor']);
  assert.deepEqual(resolveCompare('').map((w) => w.id), []);
  assert.deepEqual(resolveCompare(null), []);
});

test('relatedWallets: excludes itself and prefers the same category', () => {
  const rel = relatedWallets('ledger', 3);
  assert.equal(rel.length, 3);
  assert.ok(!rel.some((w) => w.id === 'ledger'));
  assert.equal(rel[0].id, 'trezor');
  assert.deepEqual(relatedWallets('unknown'), []);
});

test('directoryStats adds up', () => {
  const s = directoryStats();
  assert.equal(s.total, WALLETS.length);
  assert.equal(s.user + s.hardware + s.agentic, s.total);
});

test('walletSeo: unique, correctly sized titles and descriptions', () => {
  const titles = new Set();
  for (const w of WALLETS) {
    const seo = walletSeo(w);
    assert.ok(seo.title.length <= 60, `${w.id} title ${seo.title.length}`);
    assert.ok(seo.description.length >= 70 && seo.description.length <= 160, `${w.id} description ${seo.description.length}`);
    assert.ok(!titles.has(seo.title), `${w.id} duplicate title`);
    titles.add(seo.title);
  }
});
