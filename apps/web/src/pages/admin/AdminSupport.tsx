import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Headphones, Send, Clock, CheckCircle2 } from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchTickets = () => {
    setIsLoading(true);
    api
      .get('/admin/support/tickets')
      .then((data) => {
        setTickets(data || []);
        if (selectedTicket) {
          const updated = (data || []).find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setIsSending(true);
    try {
      await api.post(`/admin/support/tickets/${selectedTicket.id}/reply`, { content: replyText });
      setReplyText('');
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to post reply.');
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      await api.patch(`/admin/support/tickets/${ticketId}/status`, { status });
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket status.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Support Operations</h1>
        <p className="text-xs text-[#64748B] mt-0.5">Review user inquiries, technical bug reports, and reply as staff</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Ticket List */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#DFE8F5] shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#DFE8F5] bg-[#F7FAFF]">
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#64748B]">All Open Tickets ({tickets.length})</h2>
          </div>

          <div className="divide-y divide-[#DFE8F5] max-h-[600px] overflow-y-auto">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-4 cursor-pointer transition-colors text-xs space-y-1 ${
                  selectedTicket?.id === t.id ? 'bg-[#EDF4FF]' : 'hover:bg-[#F7FAFF]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#10213A] truncate">{t.subject}</span>
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      t.status === 'OPEN'
                        ? 'bg-blue-100 text-[#175CFF]'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-[#B45309]'
                        : 'bg-emerald-100 text-[#15803D]'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <span className="text-[#64748B] block truncate">From: {t.userName} ({t.userEmail})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Thread View & Response Panel */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card space-y-6">
          {selectedTicket ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-4">
                <div>
                  <h3 className="font-bold text-base text-[#10213A]">{selectedTicket.subject}</h3>
                  <span className="text-xs text-[#64748B]">
                    User: {selectedTicket.userName} ({selectedTicket.userEmail})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              {/* Message Thread */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                {selectedTicket.messages?.map((msg: any) => {
                  const isStaff = msg.authorRole !== 'USER';
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl text-xs space-y-1 ${
                        isStaff ? 'bg-[#EDF4FF] border border-[#DFE8F5]' : 'bg-[#F7FAFF] border border-[#DFE8F5]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[#10213A]">
                        <span>{msg.authorName} {isStaff && '(Staff)'}</span>
                        <span className="text-[10px] text-[#64748B] font-normal">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[#64748B] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  );
                })}
              </div>

              {/* Staff Reply Form */}
              <form onSubmit={handleReply} className="space-y-3 pt-2 border-t border-[#DFE8F5]">
                <label className="block text-xs font-bold text-[#10213A]">Staff Response</label>
                <textarea
                  required
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official reply to user..."
                  className="w-full text-xs p-3 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-5 py-2 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSending ? 'Posting...' : 'Dispatch Reply'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-24 text-xs text-[#64748B]">
              Select a ticket from the left column to view the message thread and reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
