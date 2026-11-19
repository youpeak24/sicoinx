import React from 'react';
import { Link } from 'react-router-dom';
import { GitCompare, X } from 'lucide-react';
import type { Wallet } from '../../data/wallets.js';
import { MAX_COMPARE } from './useCompareSelection';
import { WalletAvatar } from './WalletAvatar';

interface CompareTrayProps {
  selected: Wallet[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

/** Sticky bar that appears once at least one wallet is picked for comparison. */
export const CompareTray: React.FC<CompareTrayProps> = ({ selected, onRemove, onClear }) => {
  if (selected.length === 0) return null;
  const canCompare = selected.length >= 2;

  return (
    <div
      role="region"
      aria-label="Wallet comparison"
      className="fixed inset-x-0 bottom-[5.5rem] z-40 mx-auto w-[calc(100%-1.5rem)] max-w-3xl rounded-2xl border border-[#DFE8F5] bg-white/95 p-3 shadow-2xl backdrop-blur"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {selected.map((w) => (
            <span key={w.id} className="inline-flex items-center gap-2 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] py-1 pl-1 pr-2 text-xs font-bold text-[#10213A]">
              <WalletAvatar id={w.id} name={w.name} size="sm" className="!h-6 !w-6 !rounded-lg !text-[10px]" />
              <span className="max-w-[8rem] truncate">{w.name}</span>
              <button type="button" onClick={() => onRemove(w.id)} aria-label={`Remove ${w.name} from comparison`} className="rounded-md p-0.5 text-[#64748B] hover:bg-white hover:text-[#DC2626]">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <span className="text-[11px] font-medium text-[#64748B]">
            {selected.length}/{MAX_COMPARE} selected{!canCompare ? ' · pick at least 2' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClear} className="rounded-xl px-3 py-2 text-xs font-bold text-[#64748B] hover:text-[#10213A]">
            Clear
          </button>
          {canCompare ? (
            <Link
              to={`/wallets/compare?ids=${selected.map((w) => w.id).join(',')}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#175CFF] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#123B9A]"
            >
              <GitCompare className="h-3.5 w-3.5" /> Compare
            </Link>
          ) : (
            <span aria-disabled="true" className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-500">
              <GitCompare className="h-3.5 w-3.5" /> Compare
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
