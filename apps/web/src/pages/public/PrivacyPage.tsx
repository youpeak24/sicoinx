import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-8">
      <div className="space-y-2 border-b border-[#DFE8F5] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#175CFF]">Data Governance</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10213A]">Privacy Policy</h1>
        <p className="text-xs text-[#64748B]">Effective Date: October 1, 2026 • Version 1.2</p>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#DFE8F5] shadow-card space-y-6 text-sm text-[#64748B] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#10213A]">1. Information We Collect</h2>
          <p>
            We collect minimal information necessary to deliver authenticated services: account email, cryptographic password hashes (bcrypt), optional user-provided names, and public wallet addresses verified via cryptographic signature challenges.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#10213A]">2. Information We Never Collect</h2>
          <p>
            We strictly enforce a zero-knowledge boundary regarding private cryptographic materials: we never collect, store, transmit, or inspect user private keys, seed phrases, or external wallet passwords.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#10213A]">3. Session & Security Cookies</h2>
          <p>
            We use secure HttpOnly cookies strictly for authenticated session management and CSRF defense. We do not use third-party advertising tracking cookies or sell subscriber data to marketing brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#10213A]">4. Audit & Access Logs</h2>
          <p>
            Administrative actions, role updates, and reference price publications generate immutable audit entries (recording actor email, timestamp, and affected parameters) to safeguard platform transparency.
          </p>
        </section>
      </div>
    </div>
  );
};
