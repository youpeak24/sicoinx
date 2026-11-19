import React from 'react';

interface LogoProps {
  className?: string;
}

// 1. MetaMask - Authentic geometric origami Fox
export const MetaMaskLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#FFF7ED" />
    <g transform="translate(4, 4) scale(0.8)">
      {/* Ears */}
      <polygon points="4,2 14,14 6,17" fill="#E2761B" stroke="#E2761B" strokeWidth="0.5" />
      <polygon points="36,2 26,14 34,17" fill="#E2761B" stroke="#E2761B" strokeWidth="0.5" />
      {/* Head sides */}
      <polygon points="6,17 14,14 11,24" fill="#CD6116" />
      <polygon points="34,17 26,14 29,24" fill="#CD6116" />
      {/* Cheeks */}
      <polygon points="11,24 14,14 20,18 20,26" fill="#F6851B" />
      <polygon points="29,24 26,14 20,18 20,26" fill="#F6851B" />
      {/* Forehead */}
      <polygon points="14,14 4,2 20,8" fill="#E4761B" />
      <polygon points="26,14 36,2 20,8" fill="#E4761B" />
      {/* Eyes */}
      <polygon points="12,19 15,16 16,19 13,20" fill="#233447" />
      <polygon points="28,19 25,16 24,19 27,20" fill="#233447" />
      {/* Snout */}
      <polygon points="20,26 15,26 13,32 17,35 20,35" fill="#D7C1B3" />
      <polygon points="20,26 25,26 27,32 23,35 20,35" fill="#D7C1B3" />
      {/* Nose */}
      <polygon points="17,35 23,35 20,38" fill="#161616" />
      {/* Cheek white highlights */}
      <polygon points="6,17 11,24 5,26" fill="#D7C1B3" />
      <polygon points="34,17 29,24 35,26" fill="#D7C1B3" />
    </g>
  </svg>
);

// 2. Trust Wallet - Authentic Blue Shield with gradient
export const TrustWalletLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#0500FF" />
    <path
      d="M20 7.5L10 11.8V20.2C10 26.5 14.3 32.4 20 34C25.7 32.4 30 26.5 30 20.2V11.8L20 7.5Z"
      fill="url(#tw-grad)"
    />
    <path
      d="M20 9.8L12 13.2V20.2C12 25.3 15.4 30.1 20 31.6C24.6 30.1 28 25.3 28 20.2V13.2L20 9.8Z"
      fill="white"
    />
    <path
      d="M20 12.5L25.5 15V20.2C25.5 24 23.2 27.6 20 28.9V12.5Z"
      fill="#0500FF"
    />
    <defs>
      <linearGradient id="tw-grad" x1="10" y1="7.5" x2="30" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00D1FF" />
        <stop offset="1" stopColor="#0500FF" />
      </linearGradient>
    </defs>
  </svg>
);

// 3. Binance Wallet - Yellow & Charcoal Diamond Matrix
export const BinanceWalletLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#181A20" />
    <g transform="translate(7.5, 7.5)">
      {/* Center diamond */}
      <polygon points="12.5,9.5 15.5,12.5 12.5,15.5 9.5,12.5" fill="#F0B90B" />
      {/* Top rhombus */}
      <polygon points="12.5,3.5 15,6 10,11 7.5,8.5" fill="#F0B90B" />
      <polygon points="12.5,3.5 10,6 15,11 17.5,8.5" fill="#F0B90B" />
      {/* Bottom rhombus */}
      <polygon points="12.5,21.5 15,19 10,14 7.5,16.5" fill="#F0B90B" />
      <polygon points="12.5,21.5 10,19 15,14 17.5,16.5" fill="#F0B90B" />
      {/* Left and Right chevrons */}
      <polygon points="3.5,12.5 6,10 8.5,12.5 6,15" fill="#F0B90B" />
      <polygon points="21.5,12.5 19,10 16.5,12.5 19,15" fill="#F0B90B" />
    </g>
  </svg>
);

// 4. Rabby Wallet - Soft Blue Rabbit Mascot
export const RabbyWalletLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#6B7CFF" />
    <g transform="translate(8, 8)">
      {/* Rabbit Silhouette */}
      <path
        d="M6 14C6 8 10 5 12 1C12.5 4 13.5 7 14 9C15 7 16.5 4 18 1C19.5 5 21 8 20 14C23 17 24 20 22 23C20 25 15 25 12 25C9 25 4 25 2 23C0 20 1 17 6 14Z"
        fill="white"
      />
      {/* Cheeks & Eyes */}
      <circle cx="8" cy="16" r="1.5" fill="#6B7CFF" />
      <circle cx="16" cy="16" r="1.5" fill="#6B7CFF" />
      <path d="M10.5 19C11.5 19.8 12.5 19.8 13.5 19" stroke="#6B7CFF" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </svg>
);

// 5. Safe (Gnosis Safe) - Electric Green Keyhole Infinity
export const SafeLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#121312" />
    <g transform="translate(9, 9)">
      <rect x="2" y="2" width="18" height="18" rx="5" stroke="#12FF80" strokeWidth="2.5" />
      <circle cx="11" cy="9.5" r="3" fill="#12FF80" />
      <polygon points="9.5,10.5 12.5,10.5 13.5,15 8.5,15" fill="#12FF80" />
    </g>
  </svg>
);

// 6. Coin98 - Golden Linked Ring
export const Coin98Logo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#171717" />
    <g transform="translate(8, 8)">
      <circle cx="12" cy="12" r="9" stroke="url(#c98-gold)" strokeWidth="3" />
      <path d="M12 6C8.686 6 6 8.686 6 12C6 15.314 8.686 18 12 18" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" fill="url(#c98-gold)" />
    </g>
    <defs>
      <linearGradient id="c98-gold" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FAD961" />
        <stop offset="1" stopColor="#F76B1C" />
      </linearGradient>
    </defs>
  </svg>
);

// 7. Bitget Wallet - Cyan & Electric Blue Geometric Polygon
export const BitgetWalletLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#0D111C" />
    <g transform="translate(9, 9)">
      <path d="M2 11L11 2L20 11L11 20L2 11Z" fill="#0052FF" />
      <path d="M7 11L14 4L18 8L11 15L7 11Z" fill="#00F0FF" />
      <path d="M11 7L15 11L11 15L7 11L11 7Z" fill="white" />
    </g>
  </svg>
);

// 8. TokenPocket - Blue Isometric Cube
export const TokenPocketLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#2980FE" />
    <g transform="translate(10, 10)">
      <rect x="2" y="2" width="7" height="16" rx="2" fill="white" />
      <path d="M9 2H15C17.2 2 19 3.8 19 6V7C19 9.2 17.2 11 15 11H9V2Z" fill="white" opacity="0.9" />
    </g>
  </svg>
);

// 9. MathWallet - Bold Modern Math Orange
export const MathWalletLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#FF5000" />
    <g transform="translate(8, 8)">
      <path
        d="M3 19V5L12 14L21 5V19M8 19V11M16 19V11"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

// 10. SafePal - Interlocking Blue Shield
export const SafePalLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#3D5AFE" />
    <g transform="translate(8, 8)">
      <path
        d="M12 2L4 6V13C4 18.5 7.4 23.5 12 25C16.6 23.5 20 18.5 20 13V6L12 2Z"
        fill="white"
        fillOpacity="0.15"
      />
      <path
        d="M16 8C16 8 8 9.5 8 13C8 16 16 15 16 18C16 21 8 21 8 21"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

// 11. imToken - Cyan Connected Ring / Ribbon
export const ImTokenLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#00C2CE" />
    <g transform="translate(9, 9)">
      <circle cx="7" cy="11" r="5" stroke="white" strokeWidth="2.5" />
      <circle cx="15" cy="11" r="5" stroke="white" strokeWidth="2.5" />
      <path d="M7 8.5C9 8.5 13 8.5 15 8.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);

// 12. ONTO Wallet - Blue Concentric Iris Loop
export const OntoLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#1968FF" />
    <g transform="translate(9, 9)">
      <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2.5" />
      <circle cx="11" cy="11" r="4" fill="white" />
    </g>
  </svg>
);

// 13. MyEtherWallet (MEW) - Emerald Shield Crest
export const MEWLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#05C0A5" />
    <g transform="translate(9, 9)">
      <path
        d="M11 2L3 6V12C3 17 6.4 21.5 11 23C15.6 21.5 19 17 19 12V6L11 2Z"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
      <text x="11" y="15" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="sans-serif">
        M
      </text>
    </g>
  </svg>
);

// 14. Torus (Web3Auth) - Blue Torus Ring with Dynamic Nodes
export const TorusLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#0364FF" />
    <g transform="translate(8, 8)">
      <ellipse cx="12" cy="12" rx="9" ry="5" stroke="white" strokeWidth="2" strokeDasharray="3 2" />
      <circle cx="6" cy="12" r="2.5" fill="white" />
      <circle cx="18" cy="12" r="2.5" fill="white" />
      <circle cx="12" cy="7" r="2" fill="white" />
      <circle cx="12" cy="17" r="2" fill="white" />
    </g>
  </svg>
);

// 15. Ledger - Clean Black Matte & Minimalist Brackets
export const LedgerLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#141414" />
    <g transform="translate(10, 10)">
      {/* Top Left Bracket */}
      <path d="M2 7V2H7" stroke="white" strokeWidth="2.5" strokeLinecap="square" />
      {/* Top Right Bracket */}
      <path d="M13 2H18V7" stroke="white" strokeWidth="2.5" strokeLinecap="square" />
      {/* Bottom Left Bracket */}
      <path d="M2 13V18H7" stroke="white" strokeWidth="2.5" strokeLinecap="square" />
      {/* Bottom Right Bracket */}
      <path d="M13 18H18V13" stroke="white" strokeWidth="2.5" strokeLinecap="square" />
      {/* Center L mark */}
      <path d="M8 7V13H12" stroke="white" strokeWidth="2" strokeLinecap="square" />
    </g>
  </svg>
);

// 16. Trezor - Iconic Forest Green Lock Emblem
export const TrezorLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#00854D" />
    <g transform="translate(10, 8)">
      {/* Lock Shackle */}
      <path d="M5 10V6C5 3.2 7.2 1 10 1C12.8 1 15 3.2 15 6V10" stroke="white" strokeWidth="2.5" fill="none" />
      {/* Padlock Body */}
      <rect x="3" y="10" width="14" height="13" rx="3" fill="white" />
      {/* Keyhole */}
      <circle cx="10" cy="15" r="1.5" fill="#00854D" />
      <polygon points="9,15 11,15 11.5,19 8.5,19" fill="#00854D" />
    </g>
  </svg>
);

// 17. Trust Wallet AgentKit (TWAK) - Cybernetic Shield with AI Core
export const TwakAgentLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#070E24" />
    <g transform="translate(7, 7)">
      <path
        d="M13 3L4 7V15C4 20.5 7.8 25.5 13 27C18.2 25.5 22 20.5 22 15V7L13 3Z"
        stroke="#00D1FF"
        strokeWidth="2"
        fill="#0500FF"
        fillOpacity="0.4"
      />
      {/* Neural / Agentic Chip Nodes */}
      <circle cx="13" cy="14" r="3" fill="#00D1FF" />
      <line x1="13" y1="7" x2="13" y2="11" stroke="#00D1FF" strokeWidth="1.5" />
      <line x1="8" y1="16" x2="11" y2="15" stroke="#00D1FF" strokeWidth="1.5" />
      <line x1="18" y1="16" x2="15" y2="15" stroke="#00D1FF" strokeWidth="1.5" />
      <line x1="13" y1="17" x2="13" y2="22" stroke="#00D1FF" strokeWidth="1.5" />
    </g>
  </svg>
);

// 18. Altana - Cosmic Violet Session-Key Vault
export const AltanaAgentLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#240D47" />
    <g transform="translate(8, 8)">
      <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" stroke="#A855F7" strokeWidth="2" fill="none" />
      <polygon points="12,6 18,9.5 18,14.5 12,18 6,14.5 6,9.5" fill="#A855F7" fillOpacity="0.5" />
      <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
    </g>
  </svg>
);

// 19. Turnkey - Obsidian & Emerald Secure Enclave Key
export const TurnkeyAgentLogo: React.FC<LogoProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#0B130E" />
    <g transform="translate(8, 8)">
      <circle cx="12" cy="12" r="9" stroke="#00D26A" strokeWidth="2" strokeDasharray="4 2" />
      <rect x="9" y="8" width="6" height="8" rx="3" fill="#00D26A" />
      <circle cx="12" cy="11" r="1.5" fill="#0B130E" />
      <path d="M12 16V19M10 18H14" stroke="#00D26A" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

// Map of wallet slug -> Logo component
export const WALLET_LOGO_MAP: Record<string, React.FC<LogoProps>> = {
  metamask: MetaMaskLogo,
  'trust-wallet': TrustWalletLogo,
  'binance-wallet': BinanceWalletLogo,
  rabby: RabbyWalletLogo,
  safe: SafeLogo,
  coin98: Coin98Logo,
  'bitget-wallet': BitgetWalletLogo,
  tokenpocket: TokenPocketLogo,
  'math-wallet': MathWalletLogo,
  safepal: SafePalLogo,
  imtoken: ImTokenLogo,
  'onto-wallet': OntoLogo,
  mew: MEWLogo,
  torus: TorusLogo,
  ledger: LedgerLogo,
  trezor: TrezorLogo,
  'trust-wallet-agentkit': TwakAgentLogo,
  twak: TwakAgentLogo,
  altana: AltanaAgentLogo,
  turnkey: TurnkeyAgentLogo,
};
