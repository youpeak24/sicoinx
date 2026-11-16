import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  FileText,
  Printer,
  X,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ALL');
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [selectedType]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const url = selectedType === 'ALL' ? '/wallet/transactions' : `/wallet/transactions?type=${selectedType}`;
      const res = await api.get(url);
      setTransactions(res.transactions || []);
    } catch (err: any) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReceipt = async (tx: any) => {
    setReceiptLoading(true);
    try {
      // Fetch formal receipt if referenceId available
      if (tx.referenceId) {
        const res = await api.get(`/wallet/receipt/${tx.referenceId}`);
        setActiveReceipt(res);
      } else {
        // Fallback receipt from tx record
        setActiveReceipt({
          receiptNumber: `REC-${tx.txHash.slice(2, 10).toUpperCase()}`,
          orderNumber: tx.referenceId || 'N/A',
          txHash: tx.txHash,
          type: tx.type,
          date: tx.createdAt,
          coinAmount: tx.coinAmount,
          fiatAmount: tx.fiatAmount || 'N/A',
          notes: tx.description,
          status: tx.status,
        });
      }
    } catch (err: any) {
      console.warn('Could not load specific receipt, generating local view', err);
      setActiveReceipt({
        receiptNumber: `REC-${tx.txHash.slice(2, 10).toUpperCase()}`,
        orderNumber: tx.referenceId || 'N/A',
        txHash: tx.txHash,
        type: tx.type,
        date: tx.createdAt,
        coinAmount: tx.coinAmount,
        fiatAmount: tx.fiatAmount || 'N/A',
        notes: tx.description,
        status: tx.status,
      });
    } finally {
      setReceiptLoading(false);
    }
  };

  const typePills = [
    { label: 'All Transactions', value: 'ALL' },
    { label: 'Purchases (Buy)', value: 'BUY_COIN' },
    { label: 'Sales (Withdrawals)', value: 'SELL_COIN' },
    { label: 'Transfers Out', value: 'TRANSFER_OUT' },
    { label: 'Transfers In', value: 'TRANSFER_IN' },
    { label: 'YouPeak Ecosystem', value: 'ECOSYSTEM_DEBIT' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#10213A]">Transaction History</h1>
          <p className="text-sm text-[#64748B]">
            Official immutable record of all SIcoinX purchases, withdrawals, ecosystem transfers, and settlements.
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          className="px-3.5 py-2 rounded-xl border border-[#DFE8F5] bg-white text-xs font-semibold text-[#10213A] hover:bg-gray-50 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#175CFF]" /> Refresh Ledger
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {typePills.map((pill) => (
          <button
            key={pill.value}
            onClick={() => setSelectedType(pill.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedType === pill.value
                ? 'bg-[#175CFF] text-white shadow-xs'
                : 'bg-white border border-[#DFE8F5] text-[#64748B] hover:text-[#10213A]'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Transactions Table Container */}
      <div className="bg-white border border-[#DFE8F5] rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#64748B]">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B] space-y-2">
            <Receipt className="w-8 h-8 mx-auto text-[#64748B]/40" />
            <p>No transactions found for the selected category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DFE8F5] text-[#64748B]">
                  <th className="pb-3 font-semibold">Date & Time</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Coin Amount</th>
                  <th className="pb-3 font-semibold">Balance After</th>
                  <th className="pb-3 font-semibold">Tx Hash</th>
                  <th className="pb-3 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE8F5]">
                {transactions.map((tx) => {
                  const isPositive = tx.coinAmount.startsWith('+');
                  return (
                    <tr key={tx.id} className="text-[#10213A] hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 text-[#64748B] whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.type === 'BUY_COIN'
                              ? 'bg-blue-100 text-blue-800'
                              : tx.type === 'SELL_COIN'
                              ? 'bg-amber-100 text-amber-800'
                              : tx.type === 'TRANSFER_IN' || tx.type === 'ECOSYSTEM_CREDIT'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 max-w-xs truncate font-medium">
                        {tx.description}
                      </td>
                      <td className={`py-3.5 font-bold font-mono whitespace-nowrap ${isPositive ? 'text-[#15803D]' : 'text-[#10213A]'}`}>
                        {tx.coinAmount} SI
                      </td>
                      <td className="py-3.5 font-mono text-[#64748B] whitespace-nowrap">
                        {tx.balanceAfter} SI
                      </td>
                      <td className="py-3.5 font-mono text-[11px] text-[#175CFF] whitespace-nowrap">
                        {tx.txHash ? `${tx.txHash.slice(0, 10)}...` : 'N/A'}
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenReceipt(tx)}
                          className="px-2.5 py-1 rounded-lg border border-[#DFE8F5] hover:border-[#175CFF] hover:text-[#175CFF] text-[11px] font-semibold transition-colors flex items-center gap-1 ml-auto"
                        >
                          <FileText className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DFE8F5] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#175CFF]" />
                <h3 className="font-bold text-base text-[#10213A]">Official Transaction Receipt</h3>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="text-[#64748B] hover:text-[#10213A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F7FAFF] rounded-xl p-4 border border-[#DFE8F5] space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Receipt Number:</span>
                <span className="font-mono font-bold text-[#10213A]">{activeReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Transaction Type:</span>
                <span className="font-semibold text-[#10213A]">{activeReceipt.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Date & Timestamp:</span>
                <span className="text-[#10213A]">{new Date(activeReceipt.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-[#DFE8F5] pt-2">
                <span className="text-[#10213A]">Coin Amount:</span>
                <span className="text-[#175CFF] text-sm">{activeReceipt.coinAmount} SI</span>
              </div>
              {activeReceipt.fiatAmount && (
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Fiat Valuation:</span>
                  <span className="font-bold text-[#10213A]">{activeReceipt.fiatAmount}</span>
                </div>
              )}
              {activeReceipt.rate && (
                <div className="flex justify-between text-[#64748B]">
                  <span>Applied Rate:</span>
                  <span>{activeReceipt.rate}</span>
                </div>
              )}
              <div className="border-t border-[#DFE8F5] pt-2 text-[11px] text-[#64748B]">
                <strong>Memo / Description:</strong> {activeReceipt.notes}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-[#DFE8F5] hover:bg-gray-50 text-xs font-semibold text-[#10213A] flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="px-6 py-2 rounded-xl bg-[#175CFF] text-white text-xs font-bold hover:bg-[#123B9A]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
