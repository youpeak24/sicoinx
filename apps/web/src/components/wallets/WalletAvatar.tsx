import React from 'react';

/**
 * Brand-neutral monogram tile. We deliberately do not redraw third-party logos: they are trademarks, and
 * the official artwork should only be used under each provider's brand guidelines.
 */
const PALETTE: [string, string][] = [
  ['#175CFF', '#38BDF8'],
  ['#123B9A', '#175CFF'],
  ['#0E7490', '#22D3EE'],
  ['#4F46E5', '#818CF8'],
  ['#0F766E', '#2DD4BF'],
  ['#7C3AED', '#C084FC'],
  ['#B45309', '#FBBF24'],
  ['#BE185D', '#F472B6'],
];

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

export function initialsOf(name: string): string {
  const words = name
    .replace(/\([^)]*\)/g, '')
    .split(/[\s/]+/)
    .filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

interface WalletAvatarProps {
  id: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = { sm: 'w-9 h-9 text-xs rounded-xl', md: 'w-12 h-12 text-sm rounded-2xl', lg: 'w-20 h-20 text-2xl rounded-3xl' };

export const WalletAvatar: React.FC<WalletAvatarProps> = ({ id, name, size = 'md', className = '' }) => {
  const [from, to] = PALETTE[hash(id) % PALETTE.length];
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center font-black text-white shadow-xs select-none ${SIZES[size]} ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {initialsOf(name)}
    </span>
  );
};
