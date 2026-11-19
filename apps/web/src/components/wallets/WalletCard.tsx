import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { CATEGORY_INFO, type Wallet } from '../../data/wallets.js';
import { WalletAvatar } from './WalletAvatar';
import { CapabilityTag, DeviceBadge } from './DeviceBadge';

/** External provider link: new tab, no referrer leak, not endorsed by us for SEO. */
export const OfficialLink: React.FC<{ wallet: Wallet; className?: string; children?: React.ReactNode }> = ({ wallet, className = '', children }) => (
  <a
    href={wallet.website}
    target="_blank"
    rel="noopener noreferrer nofollow"
    className={className}
    aria-label={`${wallet.name} official website (opens in a new tab)`}
  >
    {children ?? (
      <>
        <span>Official site</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </>
    )}
  </a>
);

interface WalletCardProps {
  wallet: Wallet;
  selected: boolean;
  compareDisabled: boolean;
  onToggleCompare: (id: string) => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ wallet, selected, compareDisabled, onToggleCompare }) => {
  const info = CATEGORY_INFO[wallet.category];
  const checkId = `compare-${wallet.id}`;

  return (
    <article
      className={`group flex h-full flex-col rounded-3xl border bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated ${
        selected ? 'border-[#175CFF] ring-2 ring-[#175CFF]/20' : 'border-[#DFE8F5]'
      }`}
    >
      <header className="flex items-start gap-3">
        <WalletAvatar id={wallet.id} name={wallet.name} />
        <div className="min-w-0">
          <h3 className="truncate text-base font-extrabold text-[#10213A]">
            <Link to={`/wallets/${wallet.id}`} className="hover:text-[#175CFF] focus-visible:text-[#175CFF]">
              {wallet.name}
            </Link>
          </h3>
          <p className="text-xs font-medium text-[#64748B]">{info.label}</p>
        </div>
      </header>

      <p className="mt-4 text-sm font-semibold leading-snug text-[#10213A]">{wallet.tagline}</p>
      <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-[#64748B]">{wallet.summary}</p>

      <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Availability">
        {wallet.devices.map((d) => (
          <DeviceBadge key={d} device={d} />
        ))}
        {wallet.capabilities.map((c) => (
          <CapabilityTag key={c} label={c} />
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#EDF4FF] pt-4">
        <label htmlFor={checkId} className={`flex items-center gap-2 text-xs font-semibold ${compareDisabled && !selected ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer text-[#475569]'}`}>
          <input
            id={checkId}
            type="checkbox"
            checked={selected}
            disabled={compareDisabled && !selected}
            onChange={() => onToggleCompare(wallet.id)}
            className="h-4 w-4 rounded accent-[#175CFF]"
          />
          Compare
        </label>
        <div className="flex items-center gap-3 text-xs font-bold">
          <OfficialLink wallet={wallet} className="inline-flex items-center gap-1 text-[#64748B] hover:text-[#175CFF]" />
          <Link to={`/wallets/${wallet.id}`} className="inline-flex items-center gap-1 text-[#175CFF] hover:text-[#123B9A]">
            Details <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};
