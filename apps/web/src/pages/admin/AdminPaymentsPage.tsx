import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { CreditCard, RefreshCw, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/payments');
      setPayments(res || []);
    } catch (err: any) {
      console.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId: string) => {
    const reason = window.prompt('Specify reason for issuing Razorpay refund (coins will be revoked):');
    if (!reason) return;

    setActionLoading(true);
    setError(null);
    try {
      await api.post(`/admin/payments/${paymentId}/refund`, {
        refundReason: reason.trim(),
      });
      setSuccess('Payment successfully refunded via Razorpay and coins revoked.');
      fetchPayments();
    } catch (err: any) {
      setError(err.message || 'Refund failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#10213A]">Payment & Settlement Monitoring</h1>
          <p className="text-xs text-[#64748B]">
            All Razorpay payment captures, transaction order statuses, and administrative refund execution.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          className="px-3.5 py-2 rounded-xl border border-[#DFE8F5] bg-white text-xs font-semibold text-[#10213A] hover:bg-gray-50 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#175CFF]" /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-center gap-3 text-xs">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-white border border-[#DFE8F5] rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#64748B]">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">No payment records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DFE8F5] text-[#64748B]">
                  <th className="pb-3 font-semibold">Date & Time</th>
                  <th className="pb-3 font-semibold">User Account</th>
                  <th className="pb-3 font-semibold">Razorpay Order ID</th>
                  <th className="pb-3 font-semibold">Payment ID</th>
                  <th className="pb-3 font-semibold">Amount (INR)</th>
                  <th className="pb-3 font-semibold">Method</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE8F5]">
                {payments.map((p) => (
                  <tr key={p.id} className="text-[#10213A] hover:bg-gray-50/50">
                    <td className="py-3.5 text-[#64748B] whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5">
                      <div className="font-bold">{p.user?.name}</div>
                      <div className="text-[11px] text-[#64748B]">{p.user?.email}</div>
                    </td>
                    <td className="py-3.5 font-mono text-[11px]">{p.gatewayOrderId}</td>
                    <td className="py-3.5 font-mono text-[11px] text-[#175CFF]">
                      {p.gatewayPaymentId || 'Pending'}
                    </td>
                    <td className="py-3.5 font-bold text-[#15803D]">₹{p.amountInr}</td>
                    <td className="py-3.5 font-medium">{p.method}</td>
                    <td className="py-3.5">
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
                    <td className="py-3.5 text-right">
                      {p.status === 'CAPTURED' && (
                        <button
                          onClick={() => handleRefund(p.id)}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Issue Refund
                        </button>
                      )}
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
