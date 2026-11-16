import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-32 text-center space-y-6 animate-fade-in relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#175CFF]/10 rounded-full blur-3xl -z-10 pointer-events-none animate-blob" />

      <span className="text-6xl sm:text-8xl font-extrabold text-[#175CFF] tracking-tight block animate-float">
        404
      </span>
      <h1 className="text-2xl sm:text-3xl font-bold text-[#10213A]">Page Not Found</h1>
      <p className="text-sm text-[#64748B] leading-relaxed max-w-md mx-auto">
        The page you are looking for has been moved, renamed, or does not exist within the SI Coin platform.
      </p>
      <div className="pt-2 flex justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-elevated transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 group"
        >
          <Home className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};
