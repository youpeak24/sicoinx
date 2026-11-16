import React, { useState } from 'react';
import { Mail, X, ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

interface OutboxEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  sentAt: string;
  linkPreview?: string;
}

export const DevMailboxModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [emails, setEmails] = useState<OutboxEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ emails: OutboxEmail[] }>('/auth/dev-mailboxes');
      setEmails(res.emails || []);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    fetchEmails();
  };

  return (
    <>
      {/* Floating Badge Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-5 right-5 z-50 bg-[#123B9A] hover:bg-[#175CFF] text-white p-3.5 rounded-full shadow-elevated flex items-center gap-2 text-xs font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-glow-blue animate-float-slow group"
        title="Development Email Mailbox (Preview local reset & verification links)"
        aria-label="Development Email Mailbox"
      >
        <Mail className="w-4 h-4 transition-transform group-hover:scale-110" />
        <span className="hidden sm:inline">Dev Mailbox</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-scale">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#DFE8F5] flex items-center justify-between bg-[#F7FAFF]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#EDF4FF] text-[#175CFF]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#10213A] text-sm">Development Email Preview</h3>
                  <span className="text-[11px] font-semibold text-[#123B9A]">
                    Local Outbox Sandbox
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchEmails}
                  className="p-2 rounded-xl border border-[#DFE8F5] text-[#64748B] hover:text-[#175CFF] hover:bg-white transition-all active:scale-95"
                  title="Refresh Outbox"
                >
                  <RefreshCw className={`w-4 h-4 transition-transform ${isLoading ? 'animate-spin text-[#175CFF]' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-[#64748B] hover:text-[#10213A] hover:bg-[#EDF4FF] transition-all duration-200 hover:rotate-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {emails.length === 0 ? (
                <div className="text-center py-12 text-[#64748B] space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EDF4FF] flex items-center justify-center mx-auto text-[#175CFF]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-[#10213A]">No emails in local preview queue</p>
                  <p className="text-xs max-w-sm mx-auto text-[#64748B]">
                    When you register, request a password reset, or submit a ticket, emails will capture here automatically for instant testing.
                  </p>
                </div>
              ) : (
                emails.map((e) => (
                  <div
                    key={e.id}
                    className="p-4 rounded-2xl border border-[#DFE8F5] bg-[#F7FAFF] space-y-2 text-xs transition-all hover:border-[#175CFF]/40 shadow-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-[#10213A] text-sm block">{e.subject}</span>
                        <span className="text-[#64748B]">To: {e.to}</span>
                      </div>
                      <span className="text-[11px] text-[#94A3B8]">
                        {new Date(e.sentAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div
                      className="p-3 bg-white rounded-xl border border-[#DFE8F5] text-[#10213A] prose prose-xs max-w-none"
                      dangerouslySetInnerHTML={{ __html: e.html }}
                    />

                    {e.linkPreview && (
                      <div className="pt-1">
                        <a
                          href={e.linkPreview}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#175CFF] text-white font-semibold text-xs hover:bg-[#123B9A] shadow-xs hover:shadow transition-all duration-200"
                        >
                          Execute Verification / Reset Link
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
