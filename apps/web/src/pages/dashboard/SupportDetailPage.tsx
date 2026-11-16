import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Send, ShieldCheck, User } from 'lucide-react';

export const SupportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchTicket = () => {
    if (!id) return;
    setIsLoading(true);
    api
      .get(`/user/support/tickets/${id}`)
      .then(setTicket)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsSending(true);

    try {
      await api.post(`/user/support/tickets/${id}/reply`, { content: replyText });
      setReplyText('');
      fetchTicket();
    } catch (err: any) {
      alert(err.message || 'Failed to submit reply.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-[#64748B]">Loading conversation...</div>;
  }

  if (!ticket) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-lg font-bold text-[#10213A]">Support ticket not found</h2>
        <Link to="/dashboard/support" className="text-xs font-semibold text-[#175CFF]">
          Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          to="/dashboard/support"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#175CFF] mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Ticket List
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFE8F5] pb-4">
          <div>
            <span className="text-[11px] font-semibold text-[#175CFF] uppercase tracking-wide">
              {ticket.category}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#10213A]">{ticket.subject}</h1>
          </div>

          <span
            className={`text-xs font-bold uppercase px-3 py-1 rounded-full self-start sm:self-auto ${
              ticket.status === 'OPEN'
                ? 'bg-blue-100 text-[#175CFF]'
                : ticket.status === 'IN_PROGRESS'
                ? 'bg-amber-100 text-[#B45309]'
                : 'bg-emerald-100 text-[#15803D]'
            }`}
          >
            {ticket.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="space-y-4">
        {ticket.messages?.map((msg: any) => {
          const isStaff = msg.authorRole !== 'USER';
          return (
            <div
              key={msg.id}
              className={`p-6 rounded-3xl border shadow-xs space-y-2 ${
                isStaff
                  ? 'bg-[#EDF4FF] border-[#DFE8F5] ml-4 sm:ml-12'
                  : 'bg-white border-[#DFE8F5] mr-4 sm:mr-12'
              }`}
            >
              <div className="flex items-center justify-between text-xs border-b border-black/5 pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isStaff ? 'bg-[#175CFF] text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isStaff ? '★' : msg.authorName.charAt(0)}
                  </div>
                  <span className="font-bold text-[#10213A]">{msg.authorName}</span>
                  {isStaff && (
                    <span className="text-[10px] uppercase font-bold bg-[#175CFF] text-white px-2 py-0.5 rounded-full">
                      Support Staff
                    </span>
                  )}
                </div>

                <span className="text-[#64748B] text-[11px]">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="text-xs text-[#10213A] leading-relaxed whitespace-pre-wrap pt-1">
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Form */}
      {ticket.status !== 'CLOSED' ? (
        <form onSubmit={handleReply} className="bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card space-y-4">
          <label className="block text-xs font-bold text-[#10213A]">Add Response</label>
          <textarea
            required
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your message reply..."
            className="w-full text-xs p-3.5 rounded-2xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] flex items-center gap-2 transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              {isSending ? 'Sending reply...' : 'Post Reply'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-gray-100 rounded-2xl text-center text-xs text-[#64748B]">
          This ticket has been marked as closed.
        </div>
      )}
    </div>
  );
};
