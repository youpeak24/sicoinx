import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink, Minus } from 'lucide-react';
import { CATEGORY_INFO, DEVICES, DEVICE_LABELS, WALLETS, resolveCompare } from '../../data/wallets.js';
import { CapabilityTag } from '../../components/wallets/DeviceBadge';
import { WalletAvatar } from '../../components/wallets/WalletAvatar';

const SLOTS = 3;

const Yes: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center gap-1 font-semibold text-[#15803D]">
    <Check className="h-4 w-4" aria-hidden="true" />
    <span className="sr-only">{label}: yes</span>
    <span aria-hidden="true">Yes</span>
  </span>
);
const No: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center gap-1 text-slate-400">
    <Minus className="h-4 w-4" aria-hidden="true" />
    <span className="sr-only">{label}: no</span>
    <span aria-hidden="true">No</span>
  </span>
);

export const WalletComparePage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const selected = resolveCompare(params.get('ids'), SLOTS);
  const ids = selected.map((w) => w.id);

  const setSlot = (slot: number, value: string) => {
    const next = [...ids];
    if (value) next[slot] = value;
    else next.splice(slot, 1);
    const unique = Array.from(new Set(next.filter(Boolean))).slice(0, SLOTS);
    setParams(unique.length ? { ids: unique.join(',') } : {}, { replace: true });
  };

  // The table scroller below is `relative` on purpose: it makes the scroller the containing block for the
  // sr-only (position:absolute) labels in each cell. Without it they escape the clipping and widen the page on phones.
  const ready = selected.length >= 2;
  const hasAgent = selected.some((w) => w.category === 'agentic');
  const hasConsumer = selected.some((w) => w.category !== 'agentic');

  return (
    <div className="min-h-screen bg-[#F7FAFF] pb-24 text-[#10213A]">
      <div className="border-b border-[#DFE8F5] bg-gradient-to-b from-[#EDF4FF] to-[#F7FAFF]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link to="/wallets#directory" className="mb-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#175CFF] hover:underline">
            <ArrowLeft className="h-4 w-4" /> Wallet directory
          </Link>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Compare wallets</h1>
          <p className="mt-3 max-w-2xl text-base text-[#475569]">Pick two or three wallets to see platforms, type and notes side by side. The link in your address bar can be shared.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: SLOTS }).map((_, i) => {
            const taken = new Set(ids.filter((_, j) => j !== i));
            return (
              <div key={i} className="rounded-2xl border border-[#DFE8F5] bg-white p-4 shadow-card">
                <label htmlFor={`slot-${i}`} className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#64748B]">
                  Wallet {i + 1}{i < 2 ? '' : ' (optional)'}
                </label>
                <select
                  id={`slot-${i}`}
                  value={ids[i] ?? ''}
                  onChange={(e) => setSlot(i, e.target.value)}
                  className="w-full rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] px-3 py-2.5 text-sm font-semibold text-[#10213A] focus:border-[#175CFF] focus:outline-none"
                >
                  <option value="">Choose a wallet…</option>
                  {WALLETS.filter((w) => !taken.has(w.id)).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {!ready ? (
          <div role="status" className="rounded-3xl border border-dashed border-[#DFE8F5] bg-white p-10 text-center text-sm text-[#64748B]">
            Choose at least two wallets above to compare them. You can also tick “Compare” on the cards in the{' '}
            <Link to="/wallets#directory" className="font-bold text-[#175CFF] hover:underline">directory</Link>.
          </div>
        ) : (
          <div className="relative overflow-x-auto rounded-3xl border border-[#DFE8F5] bg-white shadow-card">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">Comparison of {selected.map((w) => w.name).join(', ')}</caption>
              <thead>
                <tr className="border-b border-[#DFE8F5] bg-[#F7FAFF]">
                  <th scope="col" className="sticky left-0 z-10 w-40 bg-[#F7FAFF] px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#64748B]">Wallet</th>
                  {selected.map((w) => (
                    <th key={w.id} scope="col" className="px-5 py-4 align-top">
                      <Link to={`/wallets/${w.id}`} className="flex items-center gap-3 hover:text-[#175CFF]">
                        <WalletAvatar id={w.id} name={w.name} size="sm" />
                        <span className="text-base font-extrabold">{w.name}</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_th]:font-semibold [&_tr]:border-b [&_tr]:border-[#EDF4FF] [&_tr:last-child]:border-0">
                <tr>
                  <th scope="row" className="sticky left-0 bg-white px-5 py-4 text-[#64748B]">Type</th>
                  {selected.map((w) => (
                    <td key={w.id} className="px-5 py-4 font-semibold">{CATEGORY_INFO[w.category].label}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="sticky left-0 bg-white px-5 py-4 text-[#64748B]">Format</th>
                  {selected.map((w) => (
                    <td key={w.id} className="px-5 py-4">{w.kind}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="sticky left-0 bg-white px-5 py-4 text-[#64748B]">Tends to suit</th>
                  {selected.map((w) => (
                    <td key={w.id} className="px-5 py-4 text-[#475569]">{w.bestFor}</td>
                  ))}
                </tr>
                {hasConsumer &&
                  DEVICES.map((d) => (
                    <tr key={d}>
                      <th scope="row" className="sticky left-0 bg-white px-5 py-4 text-[#64748B]">{DEVICE_LABELS[d]}</th>
                      {selected.map((w) => (
                        <td key={w.id} className="px-5 py-4">
                          {w.category === 'agentic' ? <span className="text-xs text-slate-400">n/a</span> : w.devices.includes(d) ? <Yes label={DEVICE_LABELS[d]} /> : <No label={DEVICE_LABELS[d]} />}
                        </td>
                      ))}
                    </tr>
                  ))}
                {hasAgent && (
                  <tr>
                    <th scope="row" className="sticky left-0 bg-white px-5 py-4 text-[#64748B]">Developer interfaces</th>
                    {selected.map((w) => (
                      <td key={w.id} className="px-5 py-4">
                        {w.capabilities.length ? <span className="flex flex-wrap gap-1.5">{w.capabilities.map((c) => <CapabilityTag key={c} label={c} />)}</span> : <span className="text-xs text-slate-400">n/a</span>}
                      </td>
                    ))}
                  </tr>
                )}
                <tr>
                  <th scope="row" className="sticky left-0 bg-white px-5 py-4 text-[#64748B]">EVM networks</th>
                  {selected.map((w) => (
                    <td key={w.id} className="px-5 py-4">{w.evm ? <Yes label="EVM networks" /> : <span className="text-xs text-slate-400">Not stated</span>}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="sticky left-0 bg-white px-5 py-4 text-[#64748B]">Worth knowing</th>
                  {selected.map((w) => (
                    <td key={w.id} className="px-5 py-4 text-[13px] leading-relaxed text-[#475569]">{w.caveat ?? 'Follow the standard precautions in the safety guide.'}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="sticky left-0 bg-white px-5 py-4 text-[#64748B]">Official site</th>
                  {selected.map((w) => (
                    <td key={w.id} className="px-5 py-4">
                      <a href={w.website} target="_blank" rel="noopener noreferrer nofollow" aria-label={`${w.name} official website (opens in a new tab)`} className="inline-flex items-center gap-1 font-bold text-[#175CFF] hover:underline">
                        {new URL(w.website).hostname.replace(/^www\./, '')} <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs leading-relaxed text-[#64748B]">
          Comparisons are high-level and informational. They are not recommendations, and SI Coin has not audited or certified any listed wallet. Confirm details with each provider.
        </p>
      </div>
    </div>
  );
};

export default WalletComparePage;
