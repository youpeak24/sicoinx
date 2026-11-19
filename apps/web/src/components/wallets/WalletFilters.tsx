import React from 'react';
import { Search, X } from 'lucide-react';
import {
  CAPABILITIES,
  CATEGORIES,
  DEFAULT_FILTERS,
  DEVICES,
  DEVICE_LABELS,
  SORTS,
  type Device,
  type SortId,
  type WalletFilters as Filters,
} from '../../data/wallets.js';

interface Props {
  filters: Filters;
  counts: Record<string, number>;
  resultCount: number;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

const chip = (active: boolean) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#175CFF]/40 ${
    active ? 'border-[#175CFF] bg-[#175CFF] text-white shadow-xs' : 'border-[#DFE8F5] bg-white text-[#475569] hover:border-[#175CFF]/50 hover:text-[#175CFF]'
  }`;

export const WalletFilters: React.FC<Props> = ({ filters, counts, resultCount, onChange, onReset }) => {
  const dirty = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);
  const showDevices = filters.category !== 'agentic';
  const showCapabilities = filters.category === 'agentic' || filters.category === 'all';

  return (
    <div className="space-y-4 rounded-3xl border border-[#DFE8F5] bg-white p-4 shadow-card sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="wallet-search" className="sr-only">
            Search wallets
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
          <input
            id="wallet-search"
            type="search"
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="Search by name, platform or feature (e.g. open source, browser)"
            autoComplete="off"
            maxLength={80}
            className="w-full rounded-2xl border border-[#DFE8F5] bg-[#F7FAFF] py-3 pl-10 pr-10 text-sm text-[#10213A] placeholder:text-[#94A3B8] focus:border-[#175CFF] focus:bg-white focus:outline-none"
          />
          {filters.q && (
            <button type="button" onClick={() => onChange({ q: '' })} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#64748B] hover:text-[#10213A]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="wallet-sort" className="text-xs font-bold text-[#64748B]">
            Sort
          </label>
          <select
            id="wallet-sort"
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortId })}
            className="rounded-xl border border-[#DFE8F5] bg-white px-3 py-2.5 text-xs font-bold text-[#10213A] focus:border-[#175CFF] focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div role="group" aria-label="Wallet type" className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" aria-pressed={filters.category === c.id} onClick={() => onChange({ category: c.id, device: c.id === 'agentic' ? 'ALL' : filters.device, capability: c.id === 'user' || c.id === 'hardware' ? 'ALL' : filters.capability })} className={chip(filters.category === c.id)}>
            {c.label}
            <span className={`rounded-full px-1.5 text-[10px] ${filters.category === c.id ? 'bg-white/25' : 'bg-[#EDF4FF] text-[#175CFF]'}`}>{counts[c.id] ?? 0}</span>
          </button>
        ))}
      </div>

      {showDevices && (
        <div role="group" aria-label="Platform" className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-[#64748B]">Platform</span>
          <button type="button" aria-pressed={filters.device === 'ALL'} onClick={() => onChange({ device: 'ALL' })} className={chip(filters.device === 'ALL')}>
            Any
          </button>
          {DEVICES.map((d: Device) => (
            <button key={d} type="button" aria-pressed={filters.device === d} onClick={() => onChange({ device: d })} className={chip(filters.device === d)}>
              {DEVICE_LABELS[d]}
              <span className={`rounded-full px-1.5 text-[10px] ${filters.device === d ? 'bg-white/25' : 'bg-[#EDF4FF] text-[#175CFF]'}`}>{counts[d] ?? 0}</span>
            </button>
          ))}
        </div>
      )}

      {showCapabilities && filters.category === 'agentic' && (
        <div role="group" aria-label="Developer interface" className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-[#64748B]">Interface</span>
          <button type="button" aria-pressed={filters.capability === 'ALL'} onClick={() => onChange({ capability: 'ALL' })} className={chip(filters.capability === 'ALL')}>
            Any
          </button>
          {CAPABILITIES.map((c) => (
            <button key={c} type="button" aria-pressed={filters.capability === c} onClick={() => onChange({ capability: c })} className={chip(filters.capability === c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#EDF4FF] pt-3 text-xs text-[#64748B]">
        <p role="status" aria-live="polite">
          <strong className="text-[#10213A]">{resultCount}</strong> {resultCount === 1 ? 'wallet' : 'wallets'} shown
        </p>
        {dirty && (
          <button type="button" onClick={onReset} className="font-bold text-[#175CFF] hover:underline">
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
};
