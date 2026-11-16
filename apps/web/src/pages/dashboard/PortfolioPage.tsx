import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ShieldCheck, Info, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [claimMsg, setClaimMsg] = useState('');

  const fetchPortfolio = () => {
    setIsLoading(true);
    api
      .get('/user/portfolio')
      .then(setPortfolio)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleClaimFaucet = async () => {
    setClaimStatus('loading');
    setClaimMsg('');
    try {
      const res = await api.post('/user/faucet/claim');
      setClaimStatus('success');
      setClaimMsg(res.message || '100.000000 demonstration SI credited to your testnet balance!');
      fetchPortfolio();
    } catch (err: any) {
      setClaimStatus('error');
      setClaimMsg(err.message || 'Faucet claim cooldown active. Try again later.');
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Portfolio Breakdown</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Strict demarcation between verified on-chain assets and testnet demonstration ledgers
          </p>
        </div>
        <button
          onClick={fetchPortfolio}
          className="p-2 rounded-xl border border-[#DFE8F5] bg-white text-[#64748B] hover:text-[#175CFF] self-start sm:self-auto transition-colors"
          title="Refresh balances"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#175CFF]' : ''}`} />
        </button>
      </div>

      {/* Mandatory Separation Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-[#B45309] flex items-start gap-3">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Notice of Asset Separation:</strong> In compliance with financial transparency standards, SI Coin maintains strict segregation between verified on-chain custody (which remains exclusively in your own wallet) and internal testnet sandbox entries. These categories are never aggregated into an artificial total.
        </p>
      </div>

      {/* Two Distinct Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel 1: Verified On-Chain Custody */}
        <div className="bg-white rounded-3xl border border-[#DFE8F5] p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#15803D]" />
              <h3 className="font-bold text-base text-[#10213A]">Verified On-Chain Holdings</h3>
            </div>
            <span className="text-[11px] font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Zero Platform Custody
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#64748B]">Non-Custodial Balance</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[#10213A] tabular-nums">0.000000</span>
              <span className="text-sm font-bold text-[#64748B]">SI</span>
            </div>
            <span className="text-xs text-[#64748B]">Estimated Value: $0.00 USD</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5] space-y-2 text-xs text-[#64748B]">
            <span className="font-bold text-[#10213A] block">Protocol Rule</span>
            <p>
              An account record alone does not imply cryptocurrency ownership. Verified mainnet tokens will only reflect when read directly from the deployed contract via your linked Web3 wallet.
            </p>
          </div>
        </div>

        {/* Panel 2: Simulated Testnet Sandbox Ledger */}
        <div className="bg-white rounded-3xl border border-[#DFE8F5] p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#175CFF]" />
              <h3 className="font-bold text-base text-[#10213A]">Testnet Sandbox Ledger</h3>
            </div>
            <span className="text-[11px] font-bold text-[#175CFF] bg-[#EDF4FF] px-2 py-0.5 rounded-full border border-[#DFE8F5]">
              Non-Monetary Demo
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#64748B]">Developer Testnet Balance</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[#175CFF] tabular-nums">
                {portfolio?.simulatedTestnetLedger?.balanceSi || '0.000000'}
              </span>
              <span className="text-sm font-bold text-[#10213A]">SI</span>
            </div>
            <span className="text-xs text-[#64748B]">
              Recorded entries: {portfolio?.simulatedTestnetLedger?.entriesCount || 0}
            </span>
          </div>

          {/* Faucet Claim Section */}
          <div className="p-4 rounded-2xl bg-[#EDF4FF] border border-[#DFE8F5] space-y-3">
            <div>
              <span className="font-bold text-xs text-[#123B9A] block">Sepolia Testnet Developer Faucet</span>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Claim 100 demonstration SI once every 24 hours to test simulated transfers and dashboard controls.
              </p>
            </div>

            {claimMsg && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-1.5 ${
                  claimStatus === 'success'
                    ? 'bg-emerald-50 text-[#15803D] border border-emerald-200'
                    : 'bg-red-50 text-[#DC2626] border border-red-200'
                }`}
              >
                {claimStatus === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                <span>{claimMsg}</span>
              </div>
            )}

            <button
              onClick={handleClaimFaucet}
              disabled={claimStatus === 'loading'}
              className="w-full py-2.5 px-4 rounded-xl bg-[#175CFF] hover:bg-[#123B9A] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {claimStatus === 'loading' ? 'Claiming faucet...' : 'Claim 100 Testnet SI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
