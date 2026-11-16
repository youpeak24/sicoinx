import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ScrollReveal } from '../../components/common/animations/ScrollReveal';
import { CheckCircle2, Clock, Calendar, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api
      .get<any[]>('/content/roadmap')
      .then((data) => setMilestones(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#175CFF] bg-[#EDF4FF] px-3.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Protocol Evolution
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#10213A] tracking-tight">
            SI Coin Development Roadmap
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            Our engineering roadmap tracks progress across architectural foundations, Sepolia testnet verification, developer tooling, and eventual decentralized governance transition.
          </p>
        </div>
      </ScrollReveal>

      {/* Target Period Disclaimer Banner */}
      <ScrollReveal direction="up" delay={100}>
        <div className="p-4 rounded-2xl bg-white border border-[#DFE8F5] text-xs text-[#64748B] flex items-center gap-3 shadow-xs interactive-card">
          <Clock className="w-4 h-4 text-[#175CFF] flex-shrink-0" />
          <span>
            <strong>Operational Policy:</strong> Target dates represent projected development horizons subject to thorough security auditing and formal verification rather than financial guarantees.
          </span>
        </div>
      </ScrollReveal>

      {/* Timeline Layout */}
      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-center py-20 text-[#64748B] animate-fade-in">
          <div className="w-8 h-8 border-4 border-[#175CFF] border-t-transparent rounded-full animate-spin mr-3" />
          <span>Loading protocol roadmap...</span>
        </div>
      ) : (
        <div className="relative border-l-2 border-[#DFE8F5] ml-4 sm:ml-8 space-y-12 pb-8">
          {milestones.map((phase, idx) => {
            const isCompleted = phase.status === 'COMPLETED';
            const isInProgress = phase.status === 'IN_PROGRESS';

            return (
              <ScrollReveal key={phase.id || idx} direction="left" delay={idx * 120}>
                <div className="relative pl-8 sm:pl-10 group">
                  {/* Node Marker */}
                  <div
                    className={`absolute -left-[17px] top-1.5 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#15803D] text-white shadow-xs'
                        : isInProgress
                        ? 'bg-[#175CFF] text-white ring-4 ring-[#EDF4FF] shadow-glow-blue animate-pulse'
                        : 'bg-[#DFE8F5] text-[#64748B]'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Content Card */}
                  <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card space-y-4 hover:border-[#175CFF] transition-all interactive-card">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DFE8F5] pb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#175CFF]">
                          {phase.phaseNumber}
                        </span>
                        <h3 className="text-xl font-bold text-[#10213A] mt-0.5">{phase.phaseTitle}</h3>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#64748B] font-semibold bg-[#F7FAFF] px-2.5 py-1 rounded-xl border border-[#DFE8F5]">
                          <Calendar className="w-3.5 h-3.5 text-[#175CFF]" />
                          {phase.targetPeriod}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                            isCompleted
                              ? 'bg-emerald-50 text-[#15803D] border-emerald-200'
                              : isInProgress
                              ? 'bg-blue-50 text-[#175CFF] border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {phase.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-[#64748B] leading-relaxed">{phase.details}</p>

                    {/* Bullet Milestones */}
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-[#10213A] uppercase tracking-wide">
                        Key Deliverables
                      </span>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {phase.milestones?.map((m: string, mIdx: number) => (
                          <li key={mIdx} className="text-xs text-[#64748B] flex items-start gap-2 bg-[#F7FAFF] p-3 rounded-xl border border-[#DFE8F5] transition-colors hover:border-[#175CFF]/30">
                            <span className="text-[#175CFF] font-bold text-sm leading-none">✓</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </div>
  );
};
