import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Bot, Coins, Globe, HardDrive, KeyRound, Layers, Link2, PackageSearch, ShieldCheck, Smartphone, Wallet as WalletIcon } from 'lucide-react';
import {
  CATEGORY_INFO,
  DEFAULT_FILTERS,
  DIRECTORY_UPDATED,
  WALLETS,
  directoryStats,
  filterWallets,
  parseFilters,
  serializeFilters,
  type WalletFilters as Filters,
} from '../../data/wallets.js';
import { faqJsonLd, resolveSeo } from '../../seo/core.js';
import { useExtraJsonLd } from '../../seo/dom';
import { Accordion } from '../../components/wallets/Accordion';
import { AddTokenModal } from '../../components/wallets/AddTokenModal';
import { CompareTray } from '../../components/wallets/CompareTray';
import { WalletCard } from '../../components/wallets/WalletCard';
import { WalletFilters } from '../../components/wallets/WalletFilters';
import { useCompareSelection } from '../../components/wallets/useCompareSelection';

const FAQS = [
  {
    q: 'Does SI Coin hold my keys or my funds?',
    a: 'No. SI Coin is non-custodial: your wallet and its recovery phrase stay with you. SI Coin will never ask for your seed phrase or private key, and nobody at SI Coin can move funds from your wallet.',
  },
  {
    q: 'Is a wallet on this list certified or endorsed by SI Coin?',
    a: 'No. The directory is informational. We list well-known wallets and describe them at a high level from each project’s public information, but we have not audited or certified them. Check the provider’s own site and documentation before you rely on a wallet.',
  },
  {
    q: 'Which wallet should I choose?',
    a: 'There is no single best wallet. Software wallets are convenient for everyday use, hardware wallets keep keys offline and suit larger long-term balances, and agent wallet infrastructure is for developers. The safety guide walks through the trade-offs.',
  },
  {
    q: 'How do I add SI Coin to my wallet?',
    a: 'Use the “Add SI to wallet” button on this page. It reads the official token details and only offers an import once a contract address has been published. If none is published yet, the dialog says so; never import an address from any other source.',
  },
  {
    q: 'Can I use a hardware wallet?',
    a: 'Hardware wallets such as Ledger and Trezor can sign for EVM-compatible networks, usually through a compatible software wallet such as MetaMask. Confirm the exact setup in the hardware provider’s documentation.',
  },
  {
    q: 'What are agent wallets?',
    a: 'They are developer tools that let software, including AI agents, sign transactions within limits a human sets, such as spending caps. SI Coin does not currently offer its own agent integration; the providers listed are third-party options for reference.',
  },
];

const STEPS = [
  { icon: Globe, title: 'Install from the official source', body: 'Open the provider’s official site from this directory or a bookmark you trust. Fake wallet sites and extensions are common.' },
  { icon: KeyRound, title: 'Back up your recovery phrase offline', body: 'Write it on paper and store it somewhere private. Anyone with the phrase controls the wallet. Never photograph it or type it into a website.' },
  { icon: Coins, title: 'Add the SI token', body: 'Use the official token details to track SI in your wallet. If no contract is published yet, wait for the announcement.' },
  { icon: Link2, title: 'Link your address to your account', body: 'In your dashboard open Wallets and add your public address. This only stores the address; it never gives SI Coin access to your funds.' },
];

const HeroArt: React.FC = () => (
  <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-sm">
    <div className="absolute inset-0 rounded-full border border-dashed border-[#175CFF]/25" />
    <div className="absolute inset-8 rounded-full border border-[#175CFF]/15" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex h-36 w-36 items-center justify-center rounded-[2rem] bg-white shadow-elevated ring-1 ring-[#DFE8F5]">
        <img src="/logo.png" alt="" width={88} height={88} className="h-[88px] w-[88px] object-contain" />
      </div>
    </div>
    {[
      { Icon: Smartphone, cls: 'left-2 top-10 bg-slate-100 text-slate-700', label: 'Mobile' },
      { Icon: Globe, cls: 'right-0 top-24 bg-[#EDF4FF] text-[#175CFF]', label: 'Browser' },
      { Icon: HardDrive, cls: 'bottom-12 left-6 bg-amber-50 text-amber-800', label: 'Hardware' },
      { Icon: Bot, cls: 'bottom-8 right-10 bg-violet-50 text-violet-700', label: 'Agents' },
    ].map(({ Icon, cls, label }) => (
      <span key={label} className={`absolute inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold shadow-card ring-1 ring-white ${cls}`}>
        <Icon className="h-4 w-4" />
        {label}
      </span>
    ))}
  </div>
);

export const WalletsDirectoryPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params.toString()), [params]);
  const [tokenOpen, setTokenOpen] = useState(false);
  const compare = useCompareSelection(WALLETS.map((w) => w.id));
  const stats = useMemo(() => directoryStats(), []);

  useExtraJsonLd(resolveSeo('/wallets'), faqJsonLd('/wallets', FAQS.map((f) => ({ question: f.q, answer: f.a }))));

  const results = useMemo(() => filterWallets(WALLETS, filters), [filters]);
  const counts = useMemo(
    () => ({ all: stats.total, user: stats.user, hardware: stats.hardware, agentic: stats.agentic, ...stats.byDevice }),
    [stats],
  );
  const selectedWallets = compare.ids.map((id) => WALLETS.find((w) => w.id === id)!).filter(Boolean);

  const update = (patch: Partial<Filters>) => {
    const next = serializeFilters({ ...filters, ...patch });
    setParams(next ? new URLSearchParams(next) : new URLSearchParams(), { replace: true });
  };
  const reset = () => setParams(new URLSearchParams(), { replace: true });
  const jumpTo = (category: Filters['category']) => {
    update({ ...DEFAULT_FILTERS, category });
    requestAnimationFrame(() => document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] pb-28 text-[#10213A]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#DFE8F5] bg-gradient-to-b from-[#EDF4FF] via-[#F7FAFF] to-[#F7FAFF]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-[#175CFF]/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12 lg:px-8">
          <div className="space-y-6 lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#DFE8F5] bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-[#123B9A] shadow-xs">
              <WalletIcon className="h-3.5 w-3.5 text-[#175CFF]" /> SI Coin wallets
            </span>
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl">
              Find the right wallet for{' '}
              <span className="bg-gradient-to-r from-[#175CFF] to-cyan-500 bg-clip-text text-transparent">your SI Coin.</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-[#475569] sm:text-lg">
              Compare software wallets, hardware devices and developer wallet tools side by side. SI Coin is non-custodial: <strong className="text-[#10213A]">you hold your own keys</strong>, so the wallet you choose is your access.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a href="#directory" className="inline-flex items-center gap-2 rounded-2xl bg-[#175CFF] px-6 py-3.5 text-sm font-bold text-white shadow-elevated transition-colors hover:bg-[#123B9A]">
                <Layers className="h-4 w-4" /> Browse {stats.total} wallets
              </a>
              <button type="button" onClick={() => setTokenOpen(true)} className="inline-flex items-center gap-2 rounded-2xl border border-[#DFE8F5] bg-white px-6 py-3.5 text-sm font-bold text-[#10213A] transition-colors hover:bg-[#F7FAFF]">
                <Coins className="h-4 w-4 text-[#175CFF]" /> Add SI to wallet
              </button>
              <Link to="/wallets/guide" className="inline-flex items-center gap-2 px-3 py-3.5 text-sm font-bold text-[#175CFF] hover:underline">
                <BookOpen className="h-4 w-4" /> Safety guide
              </Link>
            </div>
            <dl className="grid max-w-xl grid-cols-3 gap-4 border-t border-[#DFE8F5] pt-5">
              {[
                { v: stats.user, l: 'Software wallets' },
                { v: stats.hardware, l: 'Hardware wallets' },
                { v: stats.agentic, l: 'Developer tools' },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="text-xs font-medium text-[#64748B]">{s.l}</dt>
                  <dd className="text-2xl font-black text-[#10213A]">{s.v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-[#64748B]">Directory last updated {new Date(DIRECTORY_UPDATED).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. Listings are informational, not endorsements.</p>
          </div>
          <div className="lg:col-span-5">
            <HeroArt />
          </div>
        </div>
      </section>

      {/* Choosing a type */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8" aria-labelledby="types-title">
        <div className="mb-8 max-w-2xl">
          <h2 id="types-title" className="text-2xl font-black tracking-tight sm:text-3xl">Three kinds of wallet</h2>
          <p className="mt-2 text-sm text-[#64748B] sm:text-base">Pick the type first, then compare options inside it.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {([
            { id: 'user', icon: Smartphone },
            { id: 'hardware', icon: HardDrive },
            { id: 'agentic', icon: Bot },
          ] as const).map(({ id, icon: Icon }) => (
            <div key={id} className="flex flex-col rounded-3xl border border-[#DFE8F5] bg-white p-6 shadow-card">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#175CFF]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-extrabold">{CATEGORY_INFO[id].label}s</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#64748B]">{CATEGORY_INFO[id].blurb}</p>
              <button type="button" onClick={() => jumpTo(id)} className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-bold text-[#175CFF] hover:text-[#123B9A]">
                See {counts[id]} {counts[id] === 1 ? 'option' : 'options'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Directory */}
      <section id="directory" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-16 sm:px-6 lg:px-8" aria-labelledby="directory-title">
        <div className="mb-6 max-w-2xl">
          <h2 id="directory-title" className="text-2xl font-black tracking-tight sm:text-3xl">Wallet directory</h2>
          <p className="mt-2 text-sm text-[#64748B] sm:text-base">Filter by type and platform, then tick “Compare” on up to three wallets to see them side by side.</p>
        </div>

        <WalletFilters filters={filters} counts={counts} resultCount={results.length} onChange={update} onReset={reset} />

        {filters.category === 'agentic' && (
          <p className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900">
            These are <strong>third-party developer tools</strong> for building agents that transact on-chain. SI Coin does not currently offer its own agent integration, and listing here is not an endorsement.
          </p>
        )}

        {results.length > 0 ? (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Wallets">
            {results.map((w) => (
              <li key={w.id}>
                <WalletCard wallet={w} selected={compare.ids.includes(w.id)} compareDisabled={compare.isFull} onToggleCompare={compare.toggle} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-[#DFE8F5] bg-white px-6 py-14 text-center">
            <PackageSearch className="h-10 w-10 text-[#94A3B8]" />
            <h3 className="mt-3 text-lg font-extrabold">No wallets match these filters</h3>
            <p className="mt-1 max-w-md text-sm text-[#64748B]">Try a different platform or a shorter search, or clear the filters to see everything.</p>
            <button type="button" onClick={reset} className="mt-5 rounded-xl bg-[#175CFF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#123B9A]">
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Using a wallet */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8" aria-labelledby="steps-title">
        <div className="mb-8 max-w-2xl">
          <h2 id="steps-title" className="text-2xl font-black tracking-tight sm:text-3xl">Using a wallet with SI Coin</h2>
          <p className="mt-2 text-sm text-[#64748B] sm:text-base">Four steps, in this order.</p>
        </div>
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-3xl border border-[#DFE8F5] bg-white p-6 shadow-card">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#175CFF] text-sm font-black text-white">{i + 1}</span>
                <s.icon className="h-5 w-5 text-[#175CFF]" />
              </div>
              <h3 className="text-base font-extrabold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 flex items-start gap-2 rounded-2xl border border-[#DFE8F5] bg-white p-4 text-sm text-[#475569]">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#15803D]" />
          <span>
            SI Coin will never ask for your seed phrase, private key or a screenshot of either. Support staff will never ask for them either. Read the full{' '}
            <Link to="/wallets/guide" className="font-bold text-[#175CFF] hover:underline">wallet safety guide</Link>.
          </span>
        </p>
      </section>

      {/* Explore */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8" aria-labelledby="explore-title">
        <h2 id="explore-title" className="mb-8 text-2xl font-black tracking-tight sm:text-3xl">
          Explore <span className="text-[#175CFF]">SI Coin</span>
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { to: '/dashboard/buy', title: 'Get SI', body: 'Buy SI Coin from your dashboard at the published reference rate.', cta: 'Open the buy page' },
            { to: '/ecosystem', title: 'See the ecosystem', body: 'Browse live, in-development and planned SI Coin modules.', cta: 'Explore the ecosystem' },
            { to: '/tokenomics', title: 'Check the tokenomics', body: 'Fixed supply, allocations and vesting, all published in full.', cta: 'Read the tokenomics' },
          ].map((c) => (
            <Link key={c.to} to={c.to} className="group flex flex-col rounded-3xl border border-[#DFE8F5] bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated">
              <h3 className="text-lg font-extrabold">{c.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#64748B]">{c.body}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#175CFF]">
                {c.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pt-20 sm:px-6" aria-labelledby="faq-title">
        <h2 id="faq-title" className="mb-8 text-center text-2xl font-black tracking-tight sm:text-3xl">Wallet questions</h2>
        <Accordion items={FAQS.map((f) => ({ q: f.q, a: f.a }))} />
        <p className="mt-6 text-center text-xs leading-relaxed text-[#64748B]">
          This directory is for general information only. It is not financial, legal or tax advice, and a listing is not a recommendation to use a wallet or to buy any digital asset. Digital assets involve risk, including total loss. See the{' '}
          <Link to="/risk-disclosure" className="font-semibold text-[#175CFF] hover:underline">Risk Disclosure</Link>.
        </p>
      </section>

      <CompareTray selected={selectedWallets} onRemove={compare.remove} onClear={compare.clear} />
      <AddTokenModal isOpen={tokenOpen} onClose={() => setTokenOpen(false)} />
    </div>
  );
};

export default WalletsDirectoryPage;
