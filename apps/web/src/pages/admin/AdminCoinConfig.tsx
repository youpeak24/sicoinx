import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Coins, CheckCircle2, AlertCircle, Info, ShieldAlert } from 'lucide-react';

export const AdminCoinConfig: React.FC = () => {
  const [form, setForm] = useState<any>({
    tokenName: 'SI Coin',
    ticker: 'SI',
    decimals: 6,
    blockchainNetwork: 'Ethereum (Planned ERC-20) / Sepolia Testnet Preview',
    contractAddress: '',
    explorerUrl: '',
    totalSupply: '100000000',
    circulatingSupply: '18500000',
    maxSupply: '100000000',
    whitepaperUrl: '/whitepaper',
    projectStatus: 'ACTIVE_DEVELOPMENT',
    officialEmail: 'info@sicoin.org',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api
      .get('/admin/coin')
      .then((data) => {
        if (data) setForm(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    try {
      const res = await api.put('/admin/coin', {
        ...form,
        decimals: parseInt(form.decimals, 10),
      });
      setStatusMsg({ type: 'success', text: res.message || 'Coin configuration saved successfully.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save coin configuration.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-[#64748B]">Loading coin configuration...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Coin Configuration</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Manage token branding, deployment parameters, supply metrics, and official metadata
        </p>
      </div>

      {/* Critical Architectural Distinction Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-[#B45309] flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block text-sm">Crucial Architectural Boundary:</strong>
          Modifying website metadata fields below updates public display parameters across the website, calculator, and disclosures. 
          It does <strong>NOT</strong> modify a deployed smart contract bytecode or change on-chain state on Ethereum Sepolia or mainnet.
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#DFE8F5] p-8 shadow-card">
        {statusMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 mb-6 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-[#15803D] border border-emerald-200'
                : 'bg-red-50 text-[#DC2626] border border-red-200'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1">Token Name</label>
              <input
                type="text"
                required
                value={form.tokenName}
                onChange={(e) => setForm({ ...form, tokenName: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1">Provisional Ticker</label>
              <input
                type="text"
                required
                value={form.ticker}
                onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
                className="w-full text-xs font-bold uppercase px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1">Decimals Precision</label>
              <input
                type="number"
                required
                min={0}
                max={18}
                value={form.decimals}
                onChange={(e) => setForm({ ...form, decimals: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1">Blockchain Network</label>
              <input
                type="text"
                required
                value={form.blockchainNetwork}
                onChange={(e) => setForm({ ...form, blockchainNetwork: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1">Project Status</label>
              <select
                value={form.projectStatus}
                onChange={(e) => setForm({ ...form, projectStatus: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              >
                <option value="ACTIVE_DEVELOPMENT">Active Development</option>
                <option value="TESTNET">Sepolia Testnet Active</option>
                <option value="MAINNET_PLANNED">Mainnet Planned</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1">
                Contract Address (Sepolia/Mainnet)
              </label>
              <input
                type="text"
                value={form.contractAddress || ''}
                onChange={(e) => setForm({ ...form, contractAddress: e.target.value })}
                placeholder="0x..."
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1">Explorer URL</label>
              <input
                type="url"
                value={form.explorerUrl || ''}
                onChange={(e) => setForm({ ...form, explorerUrl: e.target.value })}
                placeholder="https://sepolia.etherscan.io/address/0x..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1">Total Supply</label>
              <input
                type="text"
                required
                value={form.totalSupply}
                onChange={(e) => setForm({ ...form, totalSupply: e.target.value })}
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1">Circulating Supply</label>
              <input
                type="text"
                required
                value={form.circulatingSupply}
                onChange={(e) => setForm({ ...form, circulatingSupply: e.target.value })}
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1">Max Supply</label>
              <input
                type="text"
                value={form.maxSupply || ''}
                onChange={(e) => setForm({ ...form, maxSupply: e.target.value })}
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1">Whitepaper URL</label>
              <input
                type="text"
                value={form.whitepaperUrl || ''}
                onChange={(e) => setForm({ ...form, whitepaperUrl: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1">Official Contact Email</label>
              <input
                type="email"
                required
                value={form.officialEmail || ''}
                onChange={(e) => setForm({ ...form, officialEmail: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#DFE8F5] flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-xs transition-colors"
            >
              {isSaving ? 'Saving parameters...' : 'Publish Coin Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
