import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Ban, ChevronRight, ListChecks, ShieldCheck } from 'lucide-react';
import { CATEGORY_INFO } from '../../data/wallets.js';

interface Section {
  id: string;
  title: string;
  body: React.ReactNode;
}

const Bullets: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-[#475569]">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2.5">
        <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-[#15803D]" aria-hidden="true" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const SECTIONS: Section[] = [
  {
    id: 'choose',
    title: '1. Choose the type that fits how you will use it',
    body: (
      <>
        <p className="text-[15px] leading-relaxed text-[#475569]">
          Most people end up with two wallets: a convenient one for small, everyday amounts and a more protected one for savings. Decide which job you are hiring the wallet for.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {(['user', 'hardware', 'agentic'] as const).map((k) => (
            <div key={k} className="rounded-2xl border border-[#DFE8F5] bg-[#F7FAFF] p-4">
              <h4 className="text-sm font-extrabold text-[#10213A]">{CATEGORY_INFO[k].label}</h4>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#64748B]">{CATEGORY_INFO[k].blurb}</p>
            </div>
          ))}
        </div>
        <Link to="/wallets#directory" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#175CFF] hover:underline">
          Browse the directory <ArrowRight className="h-4 w-4" />
        </Link>
      </>
    ),
  },
  {
    id: 'setup',
    title: '2. Set it up safely',
    body: (
      <Bullets
        items={[
          'Get the app or extension only from the provider’s official website or your phone’s official app store. Check the publisher name and be wary of ads that appear above search results.',
          'Bookmark the official site once you have verified it, and use the bookmark from then on.',
          'Create a strong device passcode and turn on biometric unlock if your wallet offers it.',
          'Do the setup on a device you trust, on a private network, with no one watching and no screen sharing.',
        ]}
      />
    ),
  },
  {
    id: 'phrase',
    title: '3. Protect your recovery phrase',
    body: (
      <>
        <p className="text-[15px] leading-relaxed text-[#475569]">
          The recovery phrase (also called a seed phrase) is the master key to your wallet. It is the only backup, and it cannot be reset by anyone.
        </p>
        <Bullets
          items={[
            'Write it on paper (or a metal backup) and keep it somewhere private and dry. Consider keeping a second copy in a different secure place.',
            'Never type it into a website, never share it in a chat, and never store it in photos, screenshots, notes apps or cloud storage.',
            'Nobody legitimate will ever ask for it: not SI Coin, not wallet support, not an “airdrop” or “verification” page.',
            'Test your backup: practise restoring with a small amount before you rely on it.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'scams',
    title: '4. Recognise common scams',
    body: (
      <div className="mt-1 grid gap-3 sm:grid-cols-2">
        {[
          ['Fake support', 'Messages or calls that claim to be wallet or exchange support and ask you to “verify” your wallet. Real support never asks for your phrase.'],
          ['Look-alike sites', 'Web addresses that differ by one letter, or ads that clone a wallet’s site. Use bookmarks and check the domain every time.'],
          ['Too-good airdrops', 'Unexpected tokens or “free” rewards that ask you to connect your wallet and approve something. Ignore them.'],
          ['Risky approvals', 'Some apps ask for permission to spend your tokens. Read what you approve, and review and revoke old approvals regularly.'],
          ['Address poisoning', 'Scammers send tiny transfers from addresses that look similar to ones you use. Never copy an address from your transaction history.'],
          ['Urgency and pressure', 'Anything that rushes you (“act now or lose access”) is a warning sign. Slow down and verify through official channels.'],
        ].map(([t, d]) => (
          <div key={t} className="flex gap-3 rounded-2xl border border-[#DFE8F5] bg-white p-4">
            <Ban className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
            <div>
              <h4 className="text-sm font-extrabold text-[#10213A]">{t}</h4>
              <p className="mt-1 text-[13px] leading-relaxed text-[#64748B]">{d}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'sending',
    title: '5. Send carefully',
    body: (
      <Bullets
        items={[
          'Send a small test amount first and confirm it arrives before sending the rest.',
          'Check the full address, not just the first and last characters, and confirm you are on the right network.',
          'Keep a small balance for network fees in the same wallet.',
          'On a hardware wallet, verify the address and amount on the device’s own screen.',
        ]}
      />
    ),
  },
  {
    id: 'si',
    title: '6. What SI Coin will and will not do',
    body: (
      <div className="mt-1 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
          <h4 className="text-sm font-extrabold text-emerald-900">SI Coin may</h4>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-emerald-900">
            <li>Let you store your public wallet address on your account</li>
            <li>Publish the official token details on this site and the Announcements page</li>
            <li>Explain how its non-custodial design works</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50/70 p-5">
          <h4 className="text-sm font-extrabold text-red-900">SI Coin will never</h4>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-red-900">
            <li>Ask for your recovery phrase or private key</li>
            <li>Ask you to send funds to “verify” or “unlock” a wallet</li>
            <li>Direct you to import a token address that is not published on its official site</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'trouble',
    title: '7. If something goes wrong',
    body: (
      <Bullets
        items={[
          'If you think your recovery phrase is exposed, create a brand-new wallet with a new phrase right away and move what you can to it. Do not reuse the old one.',
          'Revoke token approvals for the affected address using a reputable approvals-checker tool or your wallet’s own approvals page.',
          'Report scams to the platform where they happened, and to local authorities where appropriate. Recovery of funds is often not possible, which is why prevention matters.',
          <>Contact us through the <Link to="/contact" className="font-bold text-[#175CFF] hover:underline">contact page</Link> if you believe someone is impersonating SI Coin.</>,
        ]}
      />
    ),
  },
];

export const WalletGuidePage: React.FC = () => (
  <div className="min-h-screen bg-[#F7FAFF] pb-24 text-[#10213A]">
    <div className="border-b border-[#DFE8F5] bg-gradient-to-b from-[#EDF4FF] to-[#F7FAFF]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
          <Link to="/" className="hover:text-[#175CFF]">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/wallets" className="hover:text-[#175CFF]">Wallets</Link>
          <ChevronRight className="h-3 w-3" />
          <span aria-current="page" className="font-bold text-[#10213A]">Safety guide</span>
        </nav>
        <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">How to choose and secure a wallet</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#475569] sm:text-lg">
          With a non-custodial wallet, <strong className="text-[#10213A]">you</strong> are the bank, and that comes with responsibility. These habits prevent most losses.
        </p>
      </div>
    </div>

    <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 sm:px-6 lg:grid-cols-4 lg:px-8">
      <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#64748B]">
          <ListChecks className="h-4 w-4" /> On this page
        </p>
        <ol className="space-y-1.5 border-l-2 border-[#DFE8F5]">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="-ml-0.5 block border-l-2 border-transparent py-1 pl-4 text-sm font-semibold text-[#475569] hover:border-[#175CFF] hover:text-[#175CFF]">
                {s.title.replace(/^\d+\.\s/, '')}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <article className="space-y-10 lg:col-span-3">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24 rounded-3xl border border-[#DFE8F5] bg-white p-6 shadow-card sm:p-8">
            <h2 id={`${s.id}-h`} className="text-xl font-black tracking-tight sm:text-2xl">{s.title}</h2>
            <div className="mt-3">{s.body}</div>
          </section>
        ))}

        <p className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>
            This guide is general education, not financial, legal or security advice for your situation. Digital assets are volatile and can be lost permanently. Read the{' '}
            <Link to="/risk-disclosure" className="font-bold underline">Risk Disclosure</Link> and only use amounts you can afford to lose.
          </span>
        </p>
      </article>
    </div>
  </div>
);

export default WalletGuidePage;
