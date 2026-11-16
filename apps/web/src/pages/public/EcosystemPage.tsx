import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ScrollReveal } from '../../components/common/animations/ScrollReveal';
import { Search, ExternalLink, Box, LayoutDashboard, Wallet, Calculator, CreditCard, Vote, Server, Sparkles } from 'lucide-react';

export const EcosystemPage: React.FC = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api
      .get<any[]>('/content/ecosystem')
      .then((data) => setModules(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const getIcon = (name: string) => {
    switch (name) {
      case 'LayoutDashboard': return <LayoutDashboard className="w-6 h-6" />;
      case 'Wallet': return <Wallet className="w-6 h-6" />;
      case 'Calculator': return <Calculator className="w-6 h-6" />;
      case 'CreditCard': return <CreditCard className="w-6 h-6" />;
      case 'Vote': return <Vote className="w-6 h-6" />;
      case 'Server': return <Server className="w-6 h-6" />;
      default: return <Box className="w-6 h-6" />;
    }
  };

  const filtered = modules.filter((m) => {
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#175CFF] bg-[#EDF4FF] px-3.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Platform Architecture
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#10213A] tracking-tight">
            SI Coin Connected Ecosystem
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            Explore all live, in-development, and planned infrastructure modules across identity, telemetry, developer tooling, and decentralized governance.
          </p>
        </div>
      </ScrollReveal>

      {/* Filter and Search Bar */}
      <ScrollReveal direction="up" delay={100}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#DFE8F5]">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {['ALL', 'AVAILABLE', 'IN_DEVELOPMENT', 'PLANNED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  statusFilter === st
                    ? 'bg-[#175CFF] text-white shadow-elevated'
                    : 'bg-white border border-[#DFE8F5] text-[#64748B] hover:text-[#10213A] hover:bg-[#F7FAFF]'
                }`}
              >
                {st === 'ALL' ? 'All Modules' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules..."
              className="w-full text-xs px-3.5 py-2.5 pl-9 rounded-xl border border-[#DFE8F5] bg-white focus:outline-none focus:border-[#175CFF] focus:ring-2 focus:ring-[#175CFF]/15 transition-all shadow-xs"
            />
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
          </div>
        </div>
      </ScrollReveal>

      {/* Grid */}
      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-center py-20 text-[#64748B] animate-fade-in">
          <div className="w-8 h-8 border-4 border-[#175CFF] border-t-transparent rounded-full animate-spin mr-3" />
          <span>Loading ecosystem modules...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[#64748B] space-y-2 animate-fade-in">
          <p className="font-semibold text-[#10213A]">No ecosystem modules matched your search</p>
          <p className="text-xs">Try selecting a different status filter or clearing your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item, idx) => (
            <ScrollReveal key={item.id} direction="up" delay={(idx % 6) * 80}>
              <div
                className="bg-white p-7 rounded-3xl border border-[#DFE8F5] shadow-card flex flex-col justify-between space-y-6 hover:border-[#175CFF] transition-all group interactive-card h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#EDF4FF] text-[#175CFF] flex items-center justify-center group-hover:bg-[#175CFF] group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-xs">
                      {getIcon(item.iconName)}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        item.status === 'AVAILABLE'
                          ? 'bg-emerald-50 text-[#15803D] border-emerald-200'
                          : item.status === 'IN_DEVELOPMENT'
                          ? 'bg-blue-50 text-[#175CFF] border-blue-200'
                          : 'bg-amber-50 text-[#B45309] border-amber-200'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-[#10213A] mt-0.5">{item.title}</h3>
                    <p className="text-xs text-[#64748B] leading-relaxed mt-2">{item.description}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#DFE8F5] flex items-center justify-between text-xs">
                  {item.badgeText && (
                    <span className="text-[#64748B] font-medium">{item.badgeText}</span>
                  )}
                  {item.appUrl && (
                    <a
                      href={item.appUrl}
                      className="inline-flex items-center gap-1 font-semibold text-[#175CFF] hover:underline ml-auto group/link"
                    >
                      <span>Open Tool</span>
                      <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </a>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
};
