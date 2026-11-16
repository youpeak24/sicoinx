/**
 * Live platform data for the chat assistant: coin settings, buy/sell rates and limits, the
 * reference price, tokenomics, roadmap, ecosystem modules, published FAQs and announcements, read
 * from the database. Because it is live, the assistant never quotes stale numbers.
 *
 * Groq's free tier caps every model at 8,000 tokens per minute and counts the whole prompt, so only
 * the sections relevant to the visitor's question are rendered (the coin, rates and price are always
 * included because almost every question touches them).
 */
import { prisma } from './prisma';
import { PricingService } from './pricingService';

const trim = (text: string | null | undefined, max: number): string => {
  const t = (text ?? '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};

const fmtDate = (d: Date | string | null | undefined): string => {
  if (!d) return 'n/a';
  const date = typeof d === 'string' ? new Date(d) : d;
  return Number.isNaN(date.getTime()) ? 'n/a' : date.toISOString().slice(0, 10);
};

const LIVE_TTL_MS = 60_000;

/** Raw rows behind the live snapshot (cached for a minute so a busy chat doesn't hammer the database). */
async function loadLiveRows() {
  const now = new Date();
  const [coin, price, allocations, roadmap, modules, faqs, announcements] = await Promise.all([
    prisma.coinConfiguration.findFirst({ where: { id: 'default-coin' } }),
    PricingService.getCurrentPriceSummary().catch(() => null),
    prisma.tokenAllocation.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.roadmapMilestone.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.ecosystemModule.findMany({ where: { isPublic: true }, orderBy: { displayOrder: 'asc' } }),
    prisma.faqItem.findMany({ where: { isPublished: true }, orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }], take: 10 }),
    prisma.announcement.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      take: 5,
    }),
  ]);
  return { at: now, coin, price, allocations, roadmap, modules, faqs, announcements };
}
type LiveRows = Awaited<ReturnType<typeof loadLiveRows>>;

let rowsCache: { at: number; rows: LiveRows } | null = null;

async function getLiveRows(): Promise<LiveRows | null> {
  if (rowsCache && Date.now() - rowsCache.at < LIVE_TTL_MS) return rowsCache.rows;
  try {
    const rows = await loadLiveRows();
    rowsCache = { at: Date.now(), rows };
    return rows;
  } catch (err) {
    console.error('[chat] could not load live platform data:', err);
    return rowsCache?.rows ?? null; // last good snapshot, if any
  }
}

/** Which optional sections the question (and the page the visitor is on) needs. */
function wantedSections(question: string, page: string) {
  const q = `${question} ${page}`.toLowerCase();
  return {
    tokenomics: /token|allocat|vest|supply|distribut|unlock|reserve|team|advis|circulat|100%/.test(q),
    roadmap: /roadmap|phase|milestone|timeline|plan|launch|mainnet|testnet|audit|future|when will|release/.test(q),
    ecosystem: /ecosystem|module|partner|integrat|youpeak|utility|use case|merchant|e-?commerce|\bapp\b/.test(q),
    announcements: /announc|news|update|latest|banner|notice|recent/.test(q),
  };
}

function renderLive(rows: LiveRows, question: string, page: string): string {
  const { coin, price, allocations, roadmap, modules, faqs, announcements } = rows;
  const want = wantedSections(question, page);
  const lines: string[] = [];
  lines.push(
    `(Snapshot taken ${rows.at.toISOString()}. Authoritative current data: quote it exactly; never round, extend or extrapolate it. Sections not shown here were not needed for this question; if the visitor asks about them, point to the matching page.)`,
  );

  if (coin) {
    lines.push(
      '',
      '## Coin & trading settings',
      `- ${coin.tokenName} (${coin.ticker}); ${coin.decimals} decimals; status ${coin.projectStatus}. Network: ${coin.blockchainNetwork}. Contract address: ${coin.contractAddress || 'not published yet'}.`,
      `- Supply: total ${coin.totalSupply}; circulating ${coin.circulatingSupply}; max ${coin.maxSupply ?? 'n/a'}; reserve ${coin.reserveSupply}. Official e-mail: ${coin.officialEmail}.`,
      `- Reference BUY rate ₹${coin.buyPriceInr}/SI; reference SELL rate ₹${coin.sellPriceInr}/SI; ₹${coin.inrPerUsd} per USD. Buying ${coin.enableBuying ? 'ENABLED' : 'DISABLED'}, selling ${coin.enableSelling ? 'ENABLED' : 'DISABLED'}, transfers ${coin.enableTransfers ? 'ENABLED' : 'DISABLED'}.`,
      `- Limits per order: buy ${coin.minBuyCoins}–${coin.maxBuyCoins} SI; sell ${coin.minSellCoins}–${coin.maxSellCoins} SI.`,
    );
  }

  if (price) {
    const change = price.change24h
      ? `${price.change24h.direction === 'down' ? '-' : price.change24h.direction === 'up' ? '+' : ''}${price.change24h.percentage.toFixed(2)}% vs ~24h earlier`
      : 'no 24h comparison';
    lines.push(
      '',
      '## Reference price (informational, NOT an exchange quote)',
      `- ${price.priceUsd} ${price.quoteCurrency} per SI. Source: ${price.sourceLabel} (${price.source}); effective ${price.effectiveTimestamp}. ${price.isStale ? 'WARNING: this price is STALE.' : 'Price is fresh.'}${price.isDemoData ? ' DEMO data.' : ''} 24h change: ${change}. Reference market cap: ${price.marketCapUsd ? `$${price.marketCapUsd}` : 'n/a'} (reference price × circulating supply; not a traded market cap).`,
    );
  }

  if (want.tokenomics && allocations.length) {
    const total = allocations.reduce((sum, a) => sum + a.percentage, 0);
    lines.push('', `## Tokenomics (allocations total ${total}%)`);
    for (const a of allocations) {
      lines.push(`- ${a.category}: ${a.percentage}% (${a.tokenAmount} SI). Vesting: ${trim(a.vestingDescription, 130)} Unlock: ${trim(a.unlockSchedule, 110)}`);
    }
  }

  if (want.roadmap && roadmap.length) {
    lines.push('', '## Roadmap');
    for (const m of roadmap) {
      let items: string[] = [];
      try {
        const parsed: unknown = JSON.parse(m.milestonesJson || '[]');
        if (Array.isArray(parsed)) {
          items = parsed.map((x) => (typeof x === 'string' ? x : trim(JSON.stringify(x), 80))).slice(0, 5);
        }
      } catch {
        /* ignore malformed milestone JSON */
      }
      lines.push(
        `- Phase ${m.phaseNumber}: ${m.phaseTitle} (${m.targetPeriod}${m.isTargetEstimate ? ', target estimate' : ''}), ${m.status}. ${trim(m.details, 140)}${items.length ? ` Milestones: ${items.join('; ')}.` : ''}`,
      );
    }
  }

  if (want.ecosystem && modules.length) {
    lines.push('', '## Ecosystem modules');
    for (const m of modules) lines.push(`- ${m.title} [${m.category}, ${m.status}]: ${trim(m.description, 140)}`);
  }

  if (faqs.length) {
    lines.push('', '## Published FAQ (abridged)');
    const count = want.tokenomics || want.roadmap || want.ecosystem ? 4 : 8;
    for (const f of faqs.slice(0, count)) lines.push(`Q: ${f.question}\nA: ${trim(f.answer, 260)}`);
  }

  if (announcements.length) {
    const shown = want.announcements ? announcements : announcements.slice(0, 2);
    lines.push('', '## Latest announcements');
    for (const a of shown) {
      lines.push(
        `- ${fmtDate(a.publishedAt)} · ${a.category} · ${a.title}${want.announcements ? `: ${trim(a.summary, 180)}` : ''} (/announcements/${a.slug})`,
      );
    }
  }

  return lines.join('\n');
}

export async function getLiveData(question: string, page: string): Promise<string> {
  const rows = await getLiveRows();
  if (!rows) {
    return 'Live platform data is temporarily unavailable. Do NOT quote any price, rate, limit, supply or date; say the live figures are unavailable right now and point to the Market, Tokenomics or Roadmap pages.';
  }
  return renderLive(rows, question, page);
}
