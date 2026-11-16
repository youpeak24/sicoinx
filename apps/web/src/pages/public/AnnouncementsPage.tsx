import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ScrollReveal } from '../../components/common/animations/ScrollReveal';
import { ArrowRight, Sparkles, Calendar, Tag } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    api
      .get<any[]>('/content/announcements')
      .then((data) => setList(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ['ALL', ...Array.from(new Set(list.map((i) => i.category)))];

  const filtered = selectedCategory === 'ALL' ? list : list.filter((i) => i.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#175CFF] bg-[#EDF4FF] px-3.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Communications
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#10213A] tracking-tight">
            Official Announcements & Disclosures
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            Stay informed on protocol milestones, testnet verification reports, security audits, and allocation disclosures.
          </p>
        </div>
      </ScrollReveal>

      {/* Category Filter Pills */}
      <ScrollReveal direction="up" delay={100}>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#DFE8F5]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-[#175CFF] text-white shadow-elevated'
                  : 'bg-white border border-[#DFE8F5] text-[#64748B] hover:text-[#10213A] hover:bg-[#F7FAFF]'
              }`}
            >
              {cat === 'ALL' ? 'All Communications' : cat}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-center py-20 text-[#64748B] animate-fade-in">
          <div className="w-8 h-8 border-4 border-[#175CFF] border-t-transparent rounded-full animate-spin mr-3" />
          <span>Loading announcements...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[#64748B] animate-fade-in">No announcements in this category.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filtered.map((item, idx) => (
            <ScrollReveal key={item.id} direction="up" delay={(idx % 6) * 80}>
              <Link
                to={`/announcements/${item.slug}`}
                className="bg-white p-7 rounded-3xl border border-[#DFE8F5] shadow-card hover:border-[#175CFF] transition-all flex flex-col justify-between space-y-4 group interactive-card h-full"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span className="font-semibold text-[#175CFF] bg-[#EDF4FF] px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#94A3B8]" />
                      {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-[#10213A] group-hover:text-[#175CFF] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#64748B] line-clamp-4 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#DFE8F5] text-xs font-semibold text-[#175CFF] flex items-center gap-1">
                  <span>Read Full Announcement</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
};
