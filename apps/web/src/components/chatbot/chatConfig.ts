export interface ChatConfig {
  siteKey: string;
  apiPath?: string;
  name: string;
  subtitle: string;
  avatar?: string;
  greeting: string;
  teaser?: string;
  placeholder?: string;
  disclaimer?: string;
  suggestions?: string[];
  actions?: { label: string; href: string }[];
  /** CSS custom properties (see chatbot.css) that colour the widget. */
  theme?: Record<string, string>;
}

/**
 * Everything site-specific about the chat widget. The knowledge the AI answers from (static platform
 * guide + live database data) lives in apps/api/src/lib/chatContext.ts and chatLive.ts.
 */
export const chatConfig: ChatConfig = {
  siteKey: 'sicoinx',
  apiPath: '/api/v1/chat',
  name: 'SI Assistant',
  subtitle: 'Online · Price, KYC, wallet & more',
  avatar: '/logo.png',
  greeting:
    'Hi, I’m the **SI Coin** assistant.\n\nAsk me about the reference price, tokenomics, the roadmap, or how to register, verify your KYC, buy, sell, transfer and link a wallet.',
  teaser: 'Questions about SI Coin or your account? Ask me.',
  placeholder: 'Ask about SI Coin…',
  disclaimer: 'AI assistant · not financial advice. Never share your seed phrase, password or OTP.',
  suggestions: [
    'What is the reference price?',
    'How do I buy SI coins?',
    'How does KYC work?',
    'Show me the tokenomics',
  ],
  actions: [
    { label: '📈 Market', href: '/market' },
    { label: '🆘 Contact support', href: '/contact' },
  ],
  theme: {
    '--cbx-accent': '#175CFF',
    '--cbx-accent-2': '#123B9A',
    '--cbx-on-accent': '#ffffff',
    '--cbx-head-bg': 'linear-gradient(135deg, #123B9A, #175CFF)',
    '--cbx-launcher-bg': 'linear-gradient(135deg, #0AB5E0 0%, #1457FF 100%)',
    '--cbx-chip': '#175CFF',
    '--cbx-link': '#175CFF',
    '--cbx-bg': '#ffffff',
    '--cbx-surface': '#F2F6FD',
    '--cbx-text': '#10213A',
    '--cbx-muted': '#5B6B84',
    '--cbx-border': 'rgba(16, 33, 58, 0.12)',
    '--cbx-user-bg': '#175CFF',
    '--cbx-font': 'inherit',
    '--cbx-right': '1rem',
    // sits above the fixed bottom navigation bar that is visible at every screen size
    '--cbx-bottom': '5.25rem',
  },
};
