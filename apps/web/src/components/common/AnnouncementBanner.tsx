import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { api } from '../../lib/api';

export const AnnouncementBanner: React.FC = () => {
  const [banner, setBanner] = useState<{ title: string; slug: string } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    api
      .get<{ title: string; slug: string }>('/content/announcements/banner')
      .then((data) => setBanner(data))
      .catch(() => {
        setBanner({
          title: 'Explore the SI Coin ecosystem and project roadmap.',
          slug: 'welcome-to-si-coin-ecosystem',
        });
      });
  }, []);

  if (!banner || isDismissed) return null;

  return (
    <aside aria-label="Announcement" className="bg-[#175CFF] text-white text-xs sm:text-sm font-medium py-2 px-4 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center overflow-hidden">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold tracking-wide uppercase">
            <Sparkles className="w-3 h-3 text-white" />
            Update
          </span>
          <span className="truncate">{banner.title}</span>
          <Link
            to={`/announcements/${banner.slug}`}
            className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-[#EDF4FF] font-semibold whitespace-nowrap ml-1 group"
          >
            Learn more
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-white/80 hover:text-white p-1 rounded-md transition-colors"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
