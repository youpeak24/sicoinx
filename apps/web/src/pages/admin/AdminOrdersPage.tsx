import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  ArrowLeftRight,
  ShoppingBag,
  Banknote,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('BUY');
  const [buyOrders, setBuyOrders] = useState<any[]>([]);
  const [sellOrders, setSellOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settleModalOrder, setSettleModalOrder] = useState<any | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [buys, sells] = await Promise.all([
        api.get('/admin/orders/buy'),
        api.get('/admin/orders/sell'),
      ]);
      setBuyOrders(buys || []);
      setSellOrders(sells || []);
    } catch (err: any) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleModalOrder) return;
    setActionLoading(true);
    setError(null);

    try {
      await api.patch(`/admin/orders/sell/${settleModalOrder.id}/settle`, {
        settlementUtr: utrNumber.trim(),
      });

      setSuccess(`Sell order ${settleModalOrder.orderNumber} marked as settled with UTR: ${utrNumber}`);
      setSettleModalOrder(null);
      setUtrNumber('');
      fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to settle order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSell = async (orderId: string) => {
    const reason = window.prompt('Enter reason for rejecting this sell request (coins will be refunded):');
    if (!reason) return;

    setActionLoading(true);
    try {
      await api.patch(`/admin/orders/sell/${orderId}/reject`, { reason });
      setSuccess('Order rejected and coins returned to user wallet.');
      fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to reject order.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#10213A]">Buy & Sell Order Management</h1>
          <p className="text-xs text-[#64748B]">
            Monitor user coin purchases via Razorpay and fulfill bank withdrawal / settlement requests.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 rounded-xl border border-[#DFE8F5] bg-white text-xs font-semibold text-[#10213A] hover:bg-gray-50 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#175CFF]" /> Refresh Orders
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('BUY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'BUY'
              ? 'bg-[#175CFF] text-white shadow-xs'
              : 'bg-white border border-[#DFE8F5] text-[#64748B] hover:text-[#10213A]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" /> Buy Orders ({buyOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('SELL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'SELL'
              ? 'bg-[#175CFF] text-white shadow-xs'
              : 'bg-white border border-[#DFE8F5] text-[#64748B] hover:text-[#10213A]'
          }`}
        >
          <Banknote className="w-3.5 h-3.5" /> Sell & Withdrawal Requests ({sellOrders.length})
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

      {/* Table Container */}
      <div className="bg-white border border-[#DFE8F5] rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#64748B]">Loading orders...</div>
        ) : activeTab === 'BUY' ? (
          /* Buy Orders Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DFE8F5] text-[#64748B]">
                  <th className="pb-3 font-semibold">Order / Receipt</th>
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Coins Credited</th>
                  <th className="pb-3 font-semibold">Amount (INR)</th>
                  <th className="pb-3 font-semibold">Method</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Gateway Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE8F5]">
                {buyOrders.map((order) => (
                  <tr key={order.id} className="text-[#10213A] hover:bg-gray-50/50">
                    <td className="py-3.5">
                      <div className="font-bold font-mono">{order.orderNumber}</div>
                      <div className="text-[11px] text-[#64748B] font-mono">{order.receiptNumber}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold">{order.user?.name}</div>
                      <div className="text-[11px] text-[#64748B]">{order.user?.email}</div>
                    </td>
                    <td className="py-3.5 font-bold text-[#15803D]">+{order.coinAmount} SI</td>
                    <td className="py-3.5 font-extrabold text-[#10213A]">₹{order.totalInr}</td>
                    <td className="py-3.5 font-medium">{order.paymentMethod.replace('RAZORPAY_', '')}</td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-[11px] text-[#175CFF]">
                      {order.gatewayPaymentId || order.gatewayOrderId || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Sell Orders Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DFE8F5] text-[#64748B]">
                  <th className="pb-3 font-semibold">Order No</th>
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Coins Sold</th>
                  <th className="pb-3 font-semibold">Payout (INR)</th>
                  <th className="pb-3 font-semibold">Bank Details</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE8F5]">
                {sellOrders.map((order) => (
                  <tr key={order.id} className="text-[#10213A] hover:bg-gray-50/50">
                    <td className="py-3.5 font-mono font-bold">{order.orderNumber}</td>
                    <td className="py-3.5">
                      <div className="font-semibold">{order.user?.name}</div>
                      <div className="text-[11px] text-[#64748B]">{order.user?.email}</div>
                    </td>
                    <td className="py-3.5 font-bold">{order.coinAmount} SI</td>
                    <td className="py-3.5 font-extrabold text-[#15803D]">₹{order.totalInr}</td>
                    <td className="py-3.5 text-[11px]">
                      <div>{order.bankName} (IFSC: {order.ifscCode})</div>
                      <div className="font-mono text-[#64748B]">A/C: {order.accountNumber} ({order.bankAccountName})</div>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === 'SETTLED'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      {order.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => setSettleModalOrder(order)}
                            className="px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold"
                          >
                            Settle Payout
                          </button>
                          <button
                            onClick={() => handleRejectSell(order.id)}
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="font-mono text-[11px] text-[#64748B]">
                          UTR: {order.settlementUtr || 'N/A'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settle Modal */}
      {settleModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DFE8F5] space-y-4 animate-scale-in">
            <h3 className="font-bold text-sm text-[#10213A]">Complete Bank Settlement Payout</h3>
            <p className="text-xs text-[#64748B]">
              Enter the bank wire / NEFT / IMPS transaction reference or UTR number confirming funds transfer of ₹{settleModalOrder.totalInr} to {settleModalOrder.bankAccountName}.
            </p>

            <form onSubmit={handleSettleOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#10213A] mb-1">Bank Reference / UTR Number</label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. UTR492019482103"
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettleModalOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !utrNumber}
                  className="px-5 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                >
                  Confirm & Mark Settled
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
