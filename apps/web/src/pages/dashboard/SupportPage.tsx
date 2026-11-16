import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Headphones, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [priority, setPriority] = useState('MEDIUM');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTickets = () => {
    setIsLoading(true);
    api
      .get('/user/support/tickets')
      .then((data) => setTickets(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.post('/user/support/tickets', {
        subject,
        category,
        priority,
        message,
      });

      setIsModalOpen(false);
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Support & Inquiries</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Submit authenticated questions, bug reports, and testnet telemetry reviews
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-xs self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Support Ticket
        </button>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-card overflow-hidden">
        <div className="p-6 border-b border-[#DFE8F5]">
          <h2 className="font-bold text-base text-[#10213A]">Your Ticket History</h2>
          <p className="text-xs text-[#64748B]">All submitted support threads and active dialogues</p>
        </div>

        {tickets.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-2">
            <Headphones className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
            <p className="font-semibold text-[#10213A]">No support tickets created yet</p>
            <p>Need help or have testnet feedback? Click "Create Support Ticket" above.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#DFE8F5]">
            {tickets.map((t) => (
              <Link
                key={t.id}
                to={`/dashboard/support/${t.id}`}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F7FAFF] transition-colors group block"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-[#10213A] group-hover:text-[#175CFF] transition-colors">
                      {t.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        t.status === 'OPEN'
                          ? 'bg-blue-100 text-[#175CFF]'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-[#B45309]'
                          : 'bg-emerald-100 text-[#15803D]'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-[#64748B] block">
                    Category: {t.category} • Messages: {t.messagesCount} • Updated: {new Date(t.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-xs font-semibold text-[#175CFF] self-start sm:self-auto flex items-center gap-1">
                  View Thread →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            <div className="border-b border-[#DFE8F5] pb-4">
              <h3 className="text-lg font-bold text-[#10213A]">Create New Support Ticket</h3>
              <p className="text-xs text-[#64748B]">Our engineering staff typically responds within 24 hours</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of inquiry or bug report"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Testnet Participation">Testnet Participation</option>
                    <option value="Wallet Verification">Wallet Verification</option>
                    <option value="Security Report">Security Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide all relevant details, wallet addresses, or error logs..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A]"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
