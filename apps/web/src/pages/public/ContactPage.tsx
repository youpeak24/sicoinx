import React, { useState } from 'react';
import { api } from '../../lib/api';
import { ScrollReveal } from '../../components/common/animations/ScrollReveal';
import { Mail, Send, CheckCircle2, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      await api.post('/public/contact', formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to submit inquiry. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#175CFF] bg-[#EDF4FF] px-3.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Support & Inquiries
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#10213A] tracking-tight">
            Connect with SI Coin Engineering
          </h1>
          <p className="text-base text-[#64748B] leading-relaxed">
            Submit technical questions, bug bounty findings, or ecosystem partnership inquiries directly to our team.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7">
          <ScrollReveal direction="right" delay={150}>
            <div className="bg-white rounded-3xl border border-[#DFE8F5] p-8 sm:p-10 shadow-card interactive-card">
              {status === 'success' ? (
                <div className="text-center py-12 space-y-4 animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#10213A]">Inquiry Dispatched Successfully</h3>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out. A confirmation has been registered, and our support staff will review and follow up with you.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-[#EDF4FF] text-[#123B9A] text-xs font-semibold hover:bg-[#DFE8F5] transition-all duration-200 active:scale-95"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {status === 'error' && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-center gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#10213A] mb-1.5">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] focus:ring-2 focus:ring-[#175CFF]/15 transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#10213A] mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] focus:ring-2 focus:ring-[#175CFF]/15 transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#10213A] mb-1.5">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief summary of inquiry"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] focus:ring-2 focus:ring-[#175CFF]/15 transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#10213A] mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Detailed description of your question or technical feedback..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] focus:ring-2 focus:ring-[#175CFF]/15 transition-all shadow-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#175CFF] hover:bg-[#123B9A] text-white text-xs font-semibold shadow-elevated transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    <span>{status === 'loading' ? 'Transmitting inquiry...' : 'Submit Inquiry'}</span>
                  </button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* Side Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <ScrollReveal direction="left" delay={200}>
            <div className="bg-[#EDF4FF] rounded-3xl p-8 border border-[#DFE8F5] space-y-4 interactive-card">
              <h3 className="font-bold text-base text-[#10213A]">Direct Communication Channels</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                We respond to inquiries in order of receipt, prioritizing security audits and testnet telemetry reports.
              </p>

              <div className="space-y-3 pt-2 text-xs text-[#10213A]">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/70 border border-white/60">
                  <Mail className="w-4 h-4 text-[#175CFF]" />
                  <span className="font-medium">info@sicoin.org</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/70 border border-white/60">
                  <MessageSquare className="w-4 h-4 text-[#175CFF]" />
                  <span>Authenticated User Ticketing: Available in Dashboard</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left" delay={300}>
            <div className="bg-white rounded-3xl p-6 border border-[#DFE8F5] space-y-2 text-xs text-[#64748B] interactive-card shadow-card">
              <span className="font-bold text-[#10213A] block">Non-Custodial Security Reminder</span>
              <p>
                SI Coin representatives will never request your private keys, seed phrases, or password credentials.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};
