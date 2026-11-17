import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ScrollReveal } from '../../components/common/animations/ScrollReveal';
import { ArrowLeft, Calendar, Tag, ShieldCheck } from 'lucide-react';
import { useSeo } from '../../seo/dom';
import { announcementSeo, resolveSeo } from '../../seo/core.js';

export const AnnouncementDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    api
      .get(`/content/announcements/${slug}`)
      .then(setItem)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [slug]);

  // Per-announcement <title>, description, canonical, Open Graph and Article JSON-LD.
  // Unknown/expired announcements are marked noindex so they never enter the index.
  useSeo(
    item
      ? announcementSeo({ ...item, slug: item.slug || slug })
      : !isLoading
        ? { ...resolveSeo('/announcement-not-found'), title: 'Announcement Not Found | SI Coin' }
        : null
  );

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center py-24 text-[#64748B] animate-fade-in">
        <div className="w-8 h-8 border-4 border-[#175CFF] border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading announcement...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-[#10213A]">Announcement Not Found</h1>
        <p className="text-sm text-[#64748B]">The requested announcement does not exist or has expired.</p>
        <Link to="/announcements" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#175CFF] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Announcements
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-8 animate-fade-in">
      <ScrollReveal direction="up">
        <div>
          <Link
            to="/announcements"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#175CFF] mb-6 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            Back to Announcements
          </Link>

          <div className="flex items-center gap-3 text-xs text-[#64748B] mb-3">
            <span className="font-semibold text-[#175CFF] bg-[#EDF4FF] px-3 py-1 rounded-full">
              {item.category}
            </span>
            <span className="flex items-center gap-1 text-[#64748B]">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(item.publishedAt || item.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10213A] tracking-tight leading-tight">
            {item.title}
          </h1>
        </div>
      </ScrollReveal>

      {/* Summary Highlight Box */}
      <ScrollReveal direction="up" delay={100}>
        <div className="p-6 rounded-2xl bg-[#EDF4FF] border border-[#DFE8F5] text-sm text-[#123B9A] font-medium leading-relaxed interactive-card">
          {item.summary}
        </div>
      </ScrollReveal>

      {/* Content */}
      <ScrollReveal direction="up" delay={150}>
        <div className="bg-white rounded-3xl border border-[#DFE8F5] p-8 sm:p-12 shadow-card prose prose-slate max-w-none text-[#10213A] text-sm leading-relaxed whitespace-pre-line interactive-card">
          {item.content}
        </div>
      </ScrollReveal>
    </article>
  );
};
