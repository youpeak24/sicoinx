import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronRight, Coins, ExternalLink, GitCompare, ShieldCheck, Users } from 'lucide-react';
import { CATEGORY_INFO, DEVICE_LABELS, DEVICES, DIRECTORY_UPDATED, getWallet, relatedWallets, type Wallet } from '../../data/wallets.js';
import { AddTokenModal } from '../../components/wallets/AddTokenModal';
import { CapabilityTag, DeviceBadge } from '../../components/wallets/DeviceBadge';
import { OfficialLink } from '../../components/wallets/WalletCard';
import { WalletAvatar } from '../../components/wallets/WalletAvatar';
import { NotFoundPage } from './NotFoundPage';

const GENERIC_CAUTIONS: Record<Wallet['category'], string[]> = {
  user: [
    'Write your recovery phrase on paper and keep it offline. Anyone who has it controls the wallet.',
    'Install only from the provider’s official site or your device’s official app store, and check the publisher name.',
    'Send a small test amount first, and check the address character by character before larger transfers.',
  ],
  hardware: [
    'Buy only from the manufacturer or an authorized reseller. Never use a device that comes with a recovery phrase already written down.',
    'Check every address and amount on the device’s own screen, not just on your computer.',
    'Store the recovery phrase separately from the device. Losing both means losing access.',
  ],
  agentic: [
    'Give an agent the smallest spending limit and the shortest session you can, and use an allowlist where the tool supports one.',
    'Keep agent keys separate from the wallet that holds your main balance.',
    'Test on a test network first and read the provider’s documentation, because capabilities change.',
  ],
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 border-b border-[#EDF4FF] py-3 text-sm last:border-0">
    <dt className="shrink-0 font-semibold text-[#64748B]">{label}</dt>
    <dd className="text-right font-semibold text-[#10213A]">{children}</dd>
  </div>
);

export const WalletDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const wallet = getWallet(id);
  const [tokenOpen, setTokenOpen] = useState(false);

  if (!wallet) return <NotFoundPage />;

  const info = CATEGORY_INFO[wallet.category];
  const related = relatedWallets(wallet.id, 3);
  const host = new URL(wallet.website).hostname.replace(/^www\./, '');
  const isAgent = wallet.category === 'agentic';

  return (
    <div className="min-h-screen bg-[#F7FAFF] pb-24 text-[#10213A]">
      <div className="border-b border-[#DFE8F5] bg-gradient-to-b from-[#EDF4FF] to-[#F7FAFF]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-medium text-[#64748B]">
            <Link to="/" className="hover:text-[#175CFF]">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/wallets" className="hover:text-[#175CFF]">Wallets</Link>
            <ChevronRight className="h-3 w-3" />
            <span aria-current="page" className="font-bold text-[#10213A]">{wallet.name}</span>
          </nav>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <WalletAvatar id={wallet.id} name={wallet.name} size="lg" />
            <div className="min-w-0 flex-1 space-y-3">
              <span className="inline-flex rounded-full border border-[#DFE8F5] bg-white px-3 py-1 text-xs font-bold text-[#123B9A]">{info.label}</span>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{wallet.name}</h1>
              <p className="max-w-2xl text-base text-[#475569] sm:text-lg">{wallet.tagline}</p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <OfficialLink wallet={wallet} className="inline-flex items-center gap-2 rounded-2xl bg-[#175CFF] px-6 py-3.5 text-sm font-bold text-white shadow-elevated transition-colors hover:bg-[#123B9A]">
              <span>Visit official site</span>
              <ExternalLink className="h-4 w-4" />
            </OfficialLink>
            {!isAgent && (
              <button type="button" onClick={() => setTokenOpen(true)} className="inline-flex items-center gap-2 rounded-2xl border border-[#DFE8F5] bg-white px-5 py-3.5 text-sm font-bold text-[#10213A] hover:bg-[#F7FAFF]">
                <Coins className="h-4 w-4 text-[#175CFF]" /> Add SI to wallet
              </button>
            )}
            <Link to={`/wallets/compare?ids=${wallet.id}`} className="inline-flex items-center gap-2 px-3 py-3.5 text-sm font-bold text-[#175CFF] hover:underline">
              <GitCompare className="h-4 w-4" /> Compare with others
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-8 lg:col-span-2">
          <section aria-labelledby="about-title" className="rounded-3xl border border-[#DFE8F5] bg-white p-6 shadow-card sm:p-8">
            <h2 id="about-title" className="text-xl font-black">About {wallet.name}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#475569]">{wallet.summary}</p>
            <ul className="mt-5 space-y-2.5">
              {wallet.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-sm text-[#334155]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#15803D]" />
                  {h}
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-start gap-2.5 rounded-2xl bg-[#F7FAFF] p-4 text-sm text-[#334155]">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#175CFF]" />
              <span>
                <strong className="text-[#10213A]">Tends to suit:</strong> {wallet.bestFor}.
              </span>
            </p>
          </section>

          <section aria-labelledby="type-title" className="rounded-3xl border border-[#DFE8F5] bg-white p-6 shadow-card sm:p-8">
            <h2 id="type-title" className="text-xl font-black">What a {info.label.toLowerCase()} means for you</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#475569]">{info.blurb}</p>
          </section>

          <section aria-labelledby="safe-title" className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 sm:p-8">
            <h2 id="safe-title" className="flex items-center gap-2 text-xl font-black text-amber-950">
              <AlertTriangle className="h-5 w-5" /> Before you use it
            </h2>
            {wallet.caveat && <p className="mt-3 rounded-2xl bg-white/70 p-4 text-sm font-semibold text-amber-950">{wallet.caveat}</p>}
            <ul className="mt-4 space-y-2.5 text-sm text-amber-950">
              {GENERIC_CAUTIONS[wallet.category].map((c) => (
                <li key={c} className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  {c}
                </li>
              ))}
            </ul>
            <Link to="/wallets/guide" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#175CFF] hover:underline">
              <BookOpen className="h-4 w-4" /> Read the full wallet safety guide
            </Link>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="At a glance">
          <div className="rounded-3xl border border-[#DFE8F5] bg-white p-6 shadow-card">
            <h2 className="mb-1 text-base font-black">At a glance</h2>
            <dl>
              <Row label="Type">{wallet.kind}</Row>
              {isAgent ? (
                <Row label="Interfaces">
                  <span className="flex flex-wrap justify-end gap-1.5">{wallet.capabilities.map((c) => <CapabilityTag key={c} label={c} />)}</span>
                </Row>
              ) : (
                <Row label="Platforms">
                  <span className="flex flex-wrap justify-end gap-1.5">{wallet.devices.map((d) => <DeviceBadge key={d} device={d} />)}</span>
                </Row>
              )}
              {wallet.evm && <Row label="Networks">EVM-compatible</Row>}
              <Row label="Website">{host}</Row>
            </dl>
            {!isAgent && (
              <ul className="mt-3 space-y-1 border-t border-[#EDF4FF] pt-3 text-xs text-[#64748B]">
                {DEVICES.map((d) => (
                  <li key={d} className={wallet.devices.includes(d) ? 'font-semibold text-[#10213A]' : 'text-slate-400 line-through'}>
                    {wallet.devices.includes(d) ? '✓' : '–'} {DEVICE_LABELS[d]}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-3xl border border-[#DFE8F5] bg-white p-6 text-sm leading-relaxed text-[#475569] shadow-card">
            <h2 className="mb-2 text-base font-black text-[#10213A]">Use it with SI Coin</h2>
            {isAgent ? (
              <p>SI Coin does not currently offer an agent integration. This tool is listed for developers exploring autonomous payments and is not endorsed by SI Coin.</p>
            ) : (
              <p>
                SI Coin is non-custodial, so you keep this wallet’s keys. Once you have a wallet, add your public address under{' '}
                <Link to="/dashboard/wallets" className="font-bold text-[#175CFF] hover:underline">Dashboard → Wallets</Link>. SI Coin never needs your recovery phrase.
              </p>
            )}
          </div>

          <p className="px-1 text-[11px] leading-relaxed text-[#64748B]">
            Described at a high level from the provider’s public information (directory updated {new Date(DIRECTORY_UPDATED).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}). SI Coin has not audited or certified this wallet; confirm details on the official site.
          </p>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 lg:px-8" aria-labelledby="related-title">
          <h2 id="related-title" className="mb-5 text-xl font-black">Similar wallets</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.id}>
                <Link to={`/wallets/${r.id}`} className="group flex h-full items-center gap-3 rounded-2xl border border-[#DFE8F5] bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated">
                  <WalletAvatar id={r.id} name={r.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-extrabold">{r.name}</span>
                    <span className="block truncate text-xs text-[#64748B]">{r.kind}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#64748B] transition-transform group-hover:translate-x-0.5 group-hover:text-[#175CFF]" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <Link to="/wallets#directory" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#175CFF] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to the wallet directory
        </Link>
      </div>

      <AddTokenModal isOpen={tokenOpen} onClose={() => setTokenOpen(false)} />
    </div>
  );
};

export default WalletDetailPage;
