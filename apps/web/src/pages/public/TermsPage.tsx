import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-8">
      <div className="space-y-2 border-b border-[#DFE8F5] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#175CFF]">Legal Terms</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10213A]">Terms of Service</h1>
        <p className="text-xs text-[#64748B]">Effective Date: October 1, 2026 • Version 1.2</p>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#DFE8F5] shadow-card space-y-6 text-sm text-[#64748B] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#10213A]">1. Acceptance of Terms</h2>
          <p>
            By accessing or interacting with the SI Coin platform, website, public APIs, or associated documentation, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#10213A]">2. Informational Reference Only</h2>
          <p>
            All price feeds, calculated estimates, supply numbers, and roadmap projections are provided strictly for informational and research purposes. SI Coin reference valuations do not constitute executable trading bids or offers to sell digital securities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#10213A]">3. Non-Custodial Interactions</h2>
          <p>
            SI Coin does not hold, custody, or manage cryptographic tokens, private keys, or wallet balances on behalf of users. You retain exclusive responsibility for safeguarding your credentials, hardware devices, and recovery phrases.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#10213A]">4. User Account Conduct</h2>
          <p>
            Users agree not to exploit platform rate limits, conduct automated denial of service attacks, attempt credential stuffing, or submit fraudulent support claims. Violations result in immediate session revocation and account suspension.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#10213A]">5. Limitation of Liability</h2>
          <p>
            Under no circumstances shall the SI Coin Ecosystem Foundation, contributors, or developers be liable for direct, indirect, or incidental damages resulting from blockchain network latency, smart contract execution, or reliance on reference rates.
          </p>
        </section>
      </div>
    </div>
  );
};
