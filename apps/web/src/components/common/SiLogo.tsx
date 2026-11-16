import React from 'react';
import { Link } from 'react-router-dom';

interface SiLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const SiLogo: React.FC<SiLogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 focus:outline-none group ${className}`}>
      <div className={`${iconSizes[size]} transition-transform duration-200 group-hover:scale-105 flex-shrink-0`}>
        <img src="/si-monogram.svg" alt="SI Coin Monogram" className="w-full h-full object-contain" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-[#10213A] ${textSizes[size]} leading-none`}>
            SI <span className="text-[#175CFF]">Coin</span>
          </span>
          {size === 'lg' && (
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#64748B] mt-0.5">
              Digital Value Ecosystem
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
