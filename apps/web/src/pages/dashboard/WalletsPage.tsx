import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Wallet, ShieldCheck, Plus, Trash2, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export const WalletsPage: React.FC = () => {
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [chainInput, setChainInput] = useState('Ethereum Sepolia Testnet');
  const [challengeData, setChallengeData] = useState<{ challengeToken: string; messageToSign: string } | null>(null);
  const [step, setStep] = useState<'address' | 'sign' | 'complete'>('address');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchWallets = () => {
    setIsLoading(true);
    api
      .get('/user/wallets')
      .then((data) => setWallets(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleStartLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.match(/^0x[a-fA-F0-9]{40}$/)) {
      setErrorMsg('Please enter a valid 42-character Ethereum address (0x...).');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);

    try {
      // Step 1: Request expiring single-use challenge token from backend
      const res = await api.post('/user/wallets/challenge');
      setChallengeData(res);
      setStep('sign');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate cryptographic challenge.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifySignature = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // Step 2: Complete signature challenge verification
      await api.post('/user/wallets/verify', {
        address: addressInput,
        chain: chainInput,
        challengeToken: challengeData?.challengeToken,
      });

      setStep('complete');
      fetchWallets();
    } catch (err: any) {
      setErrorMsg(err.message || 'Signature verification failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this wallet address?')) return;
    try {
      await api.delete(`/user/wallets/${id}`);
      fetchWallets();
    } catch (err: any) {
      alert(err.message || 'Failed to disconnect wallet.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAddressInput('');
    setChallengeData(null);
    setStep('address');
    setErrorMsg('');
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Linked Wallets</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Non-custodial cryptographic wallet verification using expiring challenge signatures
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-xs self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          Link New Wallet
        </button>
      </div>

      {/* Non-Custodial Rule Box */}
      <div className="bg-[#EDF4FF] rounded-3xl p-6 border border-[#DFE8F5] space-y-2 text-xs text-[#123B9A]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#175CFF]" />
          <strong className="text-sm">Cryptographic Security Protocol</strong>
        </div>
        <p className="leading-relaxed">
          SI Coin never requests, stores, or transmits private keys or recovery phrases. Linking a wallet generates a temporary server nonce that you sign locally to prove key ownership without relinquishing token custody.
        </p>
      </div>

      {/* Wallets List */}
      <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-card overflow-hidden">
        <div className="p-6 border-b border-[#DFE8F5]">
          <h2 className="font-bold text-base text-[#10213A]">Active Connected Addresses</h2>
          <p className="text-xs text-[#64748B]">Verified addresses associated with this account</p>
        </div>

        {wallets.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-3">
            <Wallet className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
            <p className="font-semibold text-[#10213A]">No wallets currently linked</p>
            <p className="max-w-sm mx-auto">
              Link your Ethereum address to enable testnet balance inspection and future mainnet validator registration.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#DFE8F5]">
            {wallets.map((w) => (
              <div key={w.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#10213A]">{w.address}</span>
                    {w.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified via Signature
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#64748B] block">
                    Network: {w.chain} • Linked: {new Date(w.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <button
                  onClick={() => handleDisconnect(w.id)}
                  className="p-2 rounded-xl text-[#64748B] hover:text-[#DC2626] hover:bg-red-50 border border-transparent hover:border-red-100 self-start sm:self-auto transition-colors"
                  title="Disconnect wallet"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Link Wallet Workflow */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            <div className="border-b border-[#DFE8F5] pb-4">
              <h3 className="text-lg font-bold text-[#10213A]">Link Web3 Wallet Address</h3>
              <p className="text-xs text-[#64748B]">Cryptographic challenge-response verification</p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {step === 'address' && (
              <form onSubmit={handleStartLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">
                    Public Wallet Address (Hex 0x...)
                  </label>
                  <input
                    type="text"
                    required
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value.trim())}
                    placeholder="0x71C...392A"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setAddressInput('0x32A89F07211C824bA7D18fEc31548e658Ec0989b')}
                      className="text-[11px] text-[#175CFF] hover:underline"
                    >
                      Fill sample testnet address
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">Blockchain Network</label>
                  <select
                    value={chainInput}
                    onChange={(e) => setChainInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
                  >
                    <option value="Ethereum Sepolia Testnet">Ethereum Sepolia Testnet</option>
                    <option value="Ethereum Mainnet (Preview)">Ethereum Mainnet (Preview)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#10213A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A]"
                  >
                    Generate Challenge
                  </button>
                </div>
              </form>
            )}

            {step === 'sign' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5] space-y-2">
                  <span className="text-xs font-bold text-[#10213A] block">Cryptographic Challenge String</span>
                  <pre className="text-[11px] font-mono bg-white p-3 rounded-xl border border-[#DFE8F5] whitespace-pre-wrap text-[#64748B]">
                    {challengeData?.messageToSign}
                  </pre>
                </div>

                <div className="p-3 bg-blue-50 text-[#123B9A] rounded-xl text-xs flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#175CFF] flex-shrink-0 mt-0.5" />
                  <span>
                    Simulated cryptographic signature confirmation. Confirms ownership of {addressInput.slice(0, 8)}... without exposing private keys.
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('address')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifySignature}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A]"
                  >
                    {isProcessing ? 'Verifying Challenge...' : 'Confirm Signature Challenge'}
                  </button>
                </div>
              </div>
            )}

            {step === 'complete' && (
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#15803D] mx-auto" />
                <h4 className="font-bold text-lg text-[#10213A]">Wallet Verified Successfully</h4>
                <p className="text-xs text-[#64748B]">
                  Address <strong className="font-mono text-[#10213A]">{addressInput}</strong> is now linked to your SI Coin account.
                </p>
                <div className="pt-2">
                  <button
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
