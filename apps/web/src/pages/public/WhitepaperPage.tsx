import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ScrollReveal } from '../../components/common/animations/ScrollReveal';
import { FileText, Download, Clock, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

export const WhitepaperPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string>('executive-summary');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api
      .get('/content/whitepaper')
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center py-24 text-[#64748B] animate-fade-in">
        <div className="w-8 h-8 border-4 border-[#175CFF] border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading technical whitepaper...</span>
      </div>
    );
  }

  const sections = data?.sections || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
      {/* Top Banner */}
      <ScrollReveal direction="up">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#DFE8F5] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 interactive-card">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#175CFF]">
              <FileText className="w-4 h-4" />
              <span>Technical Paper • Version {data?.version || '1.2.0'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A] tracking-tight">
              {data?.title || 'SI Coin: Architecture for Verifiable Financial Transparency'}
            </h1>
            <p className="text-xs text-[#64748B]">
              Author: {data?.author || 'SI Protocol Research & Engineering Group'} • Revised: {data?.lastRevisionDate || '2026-10-15'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-elevated transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 group"
            >
              <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              <span>Download / Print PDF</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Abstract */}
      <ScrollReveal direction="up" delay={100}>
        <div className="bg-[#EDF4FF] rounded-3xl p-8 border border-[#DFE8F5] space-y-3 interactive-card">
          <h3 className="font-bold text-sm text-[#10213A] uppercase tracking-wider">Abstract</h3>
          <p className="text-sm text-[#64748B] leading-relaxed italic">
            "{data?.abstract}"
          </p>
        </div>
      </ScrollReveal>

      {/* Interactive Reader Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4">
          <ScrollReveal direction="right" delay={150}>
            <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card sticky top-28 space-y-2 interactive-card">
              <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] px-2 block mb-3">
                Table of Contents
              </span>
              {sections.map((sec: any) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between ${
                    activeSection === sec.id
                      ? 'bg-[#175CFF] text-white shadow-elevated translate-x-1'
                      : 'text-[#64748B] hover:text-[#10213A] hover:bg-[#F7FAFF] hover:translate-x-0.5'
                  }`}
                >
                  <span>{sec.title}</span>
                  {activeSection === sec.id && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Section Content Display */}
        <div className="lg:col-span-8">
          <ScrollReveal direction="left" delay={200}>
            <div className="bg-white rounded-3xl border border-[#DFE8F5] p-8 sm:p-10 shadow-card space-y-6 interactive-card min-h-[400px]">
              {sections
                .filter((sec: any) => sec.id === activeSection)
                .map((sec: any) => (
                  <div key={sec.id} className="space-y-4 animate-fade-in">
                    <h2 className="text-2xl font-bold text-[#10213A] border-b border-[#DFE8F5] pb-4">
                      {sec.title}
                    </h2>
                    <div className="text-sm text-[#64748B] leading-relaxed whitespace-pre-line space-y-4">
                      {sec.content}
                    </div>
                  </div>
                ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};
