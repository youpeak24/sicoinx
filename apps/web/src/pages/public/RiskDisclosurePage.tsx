import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export const RiskDisclosurePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-8">
      <div className="space-y-2 border-b border-[#DFE8F5] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#B45309]">Regulatory Disclosures</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10213A]">Risk Disclosure Statement</h1>
        <p className="text-xs text-[#64748B]">Effective Date: October 1, 2026 • Version 1.2</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-[#B45309] flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
        <span>
          Digital asset markets involve substantial economic and technological risk. Review these terms carefully before engaging with the SI Coin ecosystem.
        </span>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#DFE8F5] shadow-card space-y-6 text-sm text-[#64748B] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#10213A]">1. Market Volatility & Liquidity Risk</h2>
          <p>
            Cryptographic tokens are subject to extreme valuation fluctuation driven by broader economic developments, network upgrades, and global market sentiment. Past historical performance or administrator-set benchmarks provide no guarantee of future valuation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#10213A]">2. Technical & Smart Contract Risk</h2>
          <p>
            Smart contract candidates deployed to Ethereum Sepolia or eventual mainnet networks remain subject to technological vulnerabilities, compiler bugs, and blockchain forks despite formal verification and static analysis.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#10213A]">3. No Deposit Protection or Yield Promises</h2>
          <p>
            SI Coin does not operate as a depository bank, asset custodian, or regulated investment manager. Tokens are not insured by the FDIC, SIPC, or equivalent governmental schemes. SI Coin strictly rejects high-yield promises, guaranteed staking returns, or pyramid reward mechanics.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#10213A]">4. Regulatory Uncertainty</h2>
          <p>
            International regulatory frameworks regarding digital assets, utility tokens, and cryptographic networks continue to evolve. Future legal changes in various jurisdictions may restrict protocol interactions or token availability.
          </p>
        </section>
      </div>
    </div>
  );
};
