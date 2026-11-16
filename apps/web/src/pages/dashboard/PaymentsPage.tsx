import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { CreditCard, CheckCircle, AlertCircle, RefreshCw, Receipt } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      setPayments(res || []);
    } catch (err: any) {
      console.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#10213A]">Payment Gateway History</h1>
          <p className="text-sm text-[#64748B]">
            All Razorpay payment transactions, captured authorizations, order references, and receipts.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          className="px-3.5 py-2 rounded-xl border border-[#DFE8F5] bg-white text-xs font-semibold text-[#10213A] hover:bg-gray-50 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#175CFF]" /> Refresh
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-[#DFE8F5] rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#64748B]">Loading payment history...</div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B] space-y-2">
            <CreditCard className="w-8 h-8 mx-auto text-[#64748B]/40" />
            <p>No payment attempts logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DFE8F5] text-[#64748B]">
                  <th className="pb-3 font-semibold">Date & Time</th>
                  <th className="pb-3 font-semibold">Gateway</th>
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Payment ID</th>
                  <th className="pb-3 font-semibold">Method</th>
                  <th className="pb-3 font-semibold">Amount (INR)</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE8F5]">
                {payments.map((p) => (
                  <tr key={p.id} className="text-[#10213A] hover:bg-gray-50/50">
                    <td className="py-3.5 text-[#64748B] whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 font-bold whitespace-nowrap text-[#10213A]">
                      {p.gateway}
                    </td>
                    <td className="py-3.5 font-mono text-[11px] whitespace-nowrap">
                      {p.gatewayOrderId}
                    </td>
                    <td className="py-3.5 font-mono text-[11px] text-[#175CFF] whitespace-nowrap">
                      {p.gatewayPaymentId || 'Pending'}
                    </td>
                    <td className="py-3.5 font-medium whitespace-nowrap">
                      {p.method}
                    </td>
                    <td className="py-3.5 font-extrabold text-[#15803D] whitespace-nowrap">
                      ₹{p.amountInr}
                    </td>
                    <td className="py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'CAPTURED'
                            ? 'bg-green-100 text-green-800'
                            : p.status === 'CREATED'
                            ? 'bg-blue-100 text-blue-800'
                            : p.status === 'REFUNDED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
