import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ScrollReveal } from '../../components/common/animations/ScrollReveal';
import { ChevronDown, Search, HelpCircle, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useExtraJsonLd } from '../../seo/dom';
import { faqJsonLd, resolveSeo } from '../../seo/core.js';

export const FaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api
      .get<any[]>('/content/faq')
      .then((data) => {
        setFaqs(data || []);
        // Default open the first two
        if (data && data.length > 0) {
          setOpenIds({ [data[0].id]: true, [data[1]?.id]: true });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // FAQPage structured data built from the published questions (all of them, not just the filtered view).
  useExtraJsonLd(resolveSeo('/faq'), faqJsonLd('/faq', faqs));

  const categories = ['ALL', ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filtered = faqs.filter((f) => {
    const matchesCat = selectedCategory === 'ALL' || f.category === selectedCategory;
    const matchesSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggle = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#175CFF] bg-[#EDF4FF] px-3.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Knowledge Base
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#10213A] tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-[#64748B] max-w-xl mx-auto">
            Clear, documented answers regarding SI Coin architecture, reference pricing, non-custodial wallets, and support channels.
          </p>
        </div>
      </ScrollReveal>

      {/* Search Bar */}
      <ScrollReveal direction="up" delay={100}>
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full text-xs px-4 py-3 pl-10 rounded-2xl border border-[#DFE8F5] bg-white focus:outline-none focus:border-[#175CFF] focus:ring-2 focus:ring-[#175CFF]/15 shadow-xs transition-all"
          />
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
        </div>
      </ScrollReveal>

      {/* Categories */}
      <ScrollReveal direction="up" delay={150}>
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                selectedCategory === c
                  ? 'bg-[#175CFF] text-white shadow-elevated'
                  : 'bg-white border border-[#DFE8F5] text-[#64748B] hover:text-[#10213A] hover:bg-[#F7FAFF]'
              }`}
            >
              {c === 'ALL' ? 'All Categories' : c}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Accordions */}
      {isLoading ? (
        <div className="min-h-[30vh] flex items-center justify-center text-center py-20 text-[#64748B] animate-fade-in">
          <div className="w-8 h-8 border-4 border-[#175CFF] border-t-transparent rounded-full animate-spin mr-3" />
          <span>Loading FAQ knowledge base...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#64748B] space-y-2 animate-fade-in">
          <p className="font-semibold text-[#10213A]">No questions match your search</p>
          <p className="text-xs">Have a question not listed here? Contact our support engineering team.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((faq, idx) => {
            const isOpen = Boolean(openIds[faq.id]);
            return (
              <ScrollReveal key={faq.id} direction="up" delay={(idx % 6) * 60}>
                <div
                  className="bg-white rounded-2xl border border-[#DFE8F5] shadow-xs overflow-hidden transition-all duration-200 hover:border-[#175CFF]/40"
                >
                  <button
                    onClick={() => toggle(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#10213A] hover:bg-[#F7FAFF] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase text-[#175CFF] bg-[#EDF4FF] px-2 py-0.5 rounded-md hidden sm:inline-block">
                        {faq.category}
                      </span>
                      <span>{faq.question}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#64748B] transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? 'transform rotate-180 text-[#175CFF]' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-5 pt-1 text-xs text-[#64748B] leading-relaxed border-t border-[#DFE8F5]/50 bg-[#F7FAFF]/40 whitespace-pre-line">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}

      {/* Bottom Contact Prompt */}
      <ScrollReveal direction="up" delay={200}>
        <div className="text-center p-8 bg-[#EDF4FF] rounded-3xl border border-[#DFE8F5] space-y-3 interactive-card">
          <h3 className="font-bold text-base text-[#10213A]">Still have technical questions?</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Our team is available to assist developers, researchers, and community members with verifiable architectural data.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-elevated transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 group"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Submit Support Inquiry</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
};
