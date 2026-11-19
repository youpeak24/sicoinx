import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, Copy, ExternalLink, Loader2, ShieldCheck, X } from 'lucide-react';
import { api } from '../../lib/api';
import { SITE } from '../../seo/core.js';

/**
 * "Add SI to your wallet" dialog. Every value comes from the admin-managed coin configuration
 * (GET /coin/config). Nothing is hardcoded: an invented contract address or wrong decimals would put a
 * worthless or dangerous token into someone's wallet. Until a valid contract is published, the dialog
 * explains that instead of offering an import.
 */

interface CoinConfig {
  tokenName: string;
  ticker: string;
  decimals: number;
  blockchainNetwork: string;
  contractAddress: string | null;
  explorerUrl: string | null;
}

const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const isHttps = (u?: string | null) => {
  try {
    return !!u && new URL(u).protocol === 'https:';
  } catch {
    return false;
  }
};

function useCoinConfig(enabled: boolean) {
  const [config, setConfig] = useState<CoinConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get('/coin/config')
      .then((c: CoinConfig) => setConfig(c))
      .catch((e: any) => setError(e?.message || 'Could not load the token details.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (enabled && !config && !loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { config, error, loading, reload: load };
}

const CopyRow: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the value is still selectable on screen */
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#DFE8F5] bg-[#F7FAFF] px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B]">{label}</p>
        <p className={`break-all text-sm font-bold text-[#10213A] ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
      <button type="button" onClick={copy} aria-label={`Copy ${label}`} className="shrink-0 rounded-xl border border-[#DFE8F5] bg-white p-2 text-[#175CFF] hover:bg-[#EDF4FF]">
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};

export const AddTokenModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { config, error, loading, reload } = useCoinConfig(isOpen);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  // Focus management, Escape to close, and background scroll lock.
  useEffect(() => {
    if (!isOpen) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      returnFocus.current?.focus?.();
      setResult(null);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const address = config?.contractAddress && ADDRESS.test(config.contractAddress) ? config.contractAddress : null;
  const isTestnet = /testnet|sepolia|goerli|holesky/i.test(config?.blockchainNetwork || '');
  const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : undefined;

  const addToWallet = async () => {
    if (!config || !address) return;
    if (!ethereum?.request) {
      setResult({ ok: false, msg: 'No browser wallet detected. Copy the details above and add the token manually in your wallet.' });
      return;
    }
    setAdding(true);
    setResult(null);
    try {
      const accepted = await ethereum.request({
        method: 'wallet_watchAsset',
        params: { type: 'ERC20', options: { address, symbol: config.ticker, decimals: config.decimals, image: `${SITE.url}/logo.png` } },
      });
      setResult(accepted ? { ok: true, msg: `${config.ticker} was added to your wallet's token list.` } : { ok: false, msg: 'The request was dismissed in your wallet. Nothing was added.' });
    } catch (e: any) {
      setResult({ ok: false, msg: e?.code === 4001 ? 'You rejected the request in your wallet. Nothing was added.' : e?.message || 'Your wallet could not add the token.' });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-[#071124]/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-token-title"
        tabIndex={-1}
        className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-[#175CFF] to-[#123B9A] p-6 text-white">
          <div>
            <h2 id="add-token-title" className="text-xl font-black tracking-tight">
              Add {config?.ticker || 'SI'} to your wallet
            </h2>
            <p className="mt-1 text-xs text-blue-100/90">Token details come straight from the official SI Coin configuration.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-xl bg-white/10 p-1.5 hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {loading && (
            <p className="flex items-center gap-2 text-sm text-[#64748B]" role="status">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading token details…
            </p>
          )}

          {error && !loading && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}{' '}
              <button type="button" onClick={reload} className="font-bold underline">
                Try again
              </button>
            </div>
          )}

          {config && !address && (
            <div role="status" className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-4 w-4" /> No contract address has been published yet
              </p>
              <p>
                There is nothing to import right now. When the SI Coin contract is published it will appear here and on the{' '}
                <Link to="/announcements" onClick={onClose} className="font-bold underline">
                  Announcements
                </Link>{' '}
                page. <strong>Never import a token address from anywhere else.</strong>
              </p>
            </div>
          )}

          {config && address && (
            <>
              {isTestnet && (
                <div className="flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    This is a <strong>test network preview</strong> ({config.blockchainNetwork}). Test tokens have no monetary value. Switch your wallet to the matching network first.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <CopyRow label="Contract address" value={address} mono />
                <div className="grid grid-cols-2 gap-2">
                  <CopyRow label="Symbol" value={config.ticker} />
                  <CopyRow label="Decimals" value={String(config.decimals)} />
                </div>
                <CopyRow label="Network" value={config.blockchainNetwork} />
              </div>

              {isHttps(config.explorerUrl) && (
                <a href={config.explorerUrl!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#175CFF] hover:underline">
                  Verify this address on the block explorer <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              <button
                type="button"
                onClick={addToWallet}
                disabled={adding}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#175CFF] px-6 py-3.5 text-sm font-bold text-white shadow-elevated transition-colors hover:bg-[#123B9A] disabled:opacity-60"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {ethereum?.request ? `Add ${config.ticker} to my wallet` : 'Browser wallet not detected'}
              </button>
              {!ethereum?.request && <p className="text-xs text-[#64748B]">Using a mobile wallet? Open this page in its built-in browser, or add the token manually with the details above.</p>}
            </>
          )}

          {result && (
            <p role="status" className={`rounded-2xl p-3 text-sm font-semibold ${result.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {result.msg}
            </p>
          )}

          <p className="border-t border-[#EDF4FF] pt-4 text-[11px] leading-relaxed text-[#64748B]">
            SI Coin will never ask for your seed phrase or private key, and adding a token does not give anyone access to your funds. Always compare the address with the official explorer link before confirming in your wallet.
          </p>
        </div>
      </div>
    </div>
  );
};
