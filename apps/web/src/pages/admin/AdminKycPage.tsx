import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const AdminKycPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedKyc, setSelectedKyc] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [filterStatus]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const url = filterStatus === 'ALL' ? '/admin/kyc' : `/admin/kyc?status=${filterStatus}`;
      const res = await api.get(url);
      setSubmissions(res || []);
    } catch (err: any) {
      console.error('Failed to load KYC submissions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(true);
    setError(null);
    try {
      await api.patch(`/admin/kyc/${id}/review`, {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
      });

      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedKyc(null);
      fetchSubmissions();
    } catch (err: any) {
      setError(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#10213A]">KYC Compliance Queue</h1>
          <p className="text-xs text-[#64748B]">
            Review user identity verifications, inspect government IDs, and approve or reject submissions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === s
                  ? 'bg-[#175CFF] text-white shadow-xs'
                  : 'bg-white border border-[#DFE8F5] text-[#64748B] hover:text-[#10213A]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#DFE8F5] rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#64748B]">Loading KYC submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">
            No KYC submissions found in this status.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DFE8F5] text-[#64748B]">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">ID Type</th>
                  <th className="pb-3 font-semibold">ID Number</th>
                  <th className="pb-3 font-semibold">Submitted</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE8F5]">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="text-[#10213A] hover:bg-gray-50/50">
                    <td className="py-3.5">
                      <div className="font-bold">{sub.fullName}</div>
                      <div className="text-[11px] text-[#64748B]">{sub.user?.email}</div>
                    </td>
                    <td className="py-3.5 font-semibold text-[#175CFF]">{sub.idType}</td>
                    <td className="py-3.5 font-mono">{sub.idNumber}</td>
                    <td className="py-3.5 text-[#64748B]">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : sub.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedKyc(sub)}
                        className="px-2.5 py-1 rounded-lg border border-[#DFE8F5] hover:bg-gray-50 text-[11px] font-semibold"
                      >
                        Inspect
                      </button>
                      {sub.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleReview(sub.id, 'APPROVED')}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedKyc(sub);
                              setShowRejectModal(true);
                            }}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Document Modal */}
      {selectedKyc && !showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DFE8F5] space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#10213A]">{selectedKyc.fullName}</h3>
                <div className="text-xs text-[#64748B]">{selectedKyc.idType} • {selectedKyc.idNumber}</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-[#10213A]">
                {selectedKyc.status}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-[#10213A] block mb-1">Front Document Image</span>
                <div className="rounded-xl overflow-hidden border border-[#DFE8F5] bg-gray-50 p-2 max-h-56 flex items-center justify-center">
                  <img
                    src={selectedKyc.documentFrontUrl}
                    alt="Document Front"
                    className="max-h-52 object-contain rounded-lg"
                    onError={(e: any) => {
                      e.target.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600';
                    }}
                  />
                </div>
              </div>

              {selectedKyc.documentBackUrl && (
                <div>
                  <span className="text-xs font-bold text-[#10213A] block mb-1">Back Document Image</span>
                  <div className="rounded-xl overflow-hidden border border-[#DFE8F5] bg-gray-50 p-2 max-h-40 flex items-center justify-center">
                    <img
                      src={selectedKyc.documentBackUrl}
                      alt="Document Back"
                      className="max-h-36 object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#DFE8F5]">
              <button
                onClick={() => setSelectedKyc(null)}
                className="px-4 py-2 rounded-xl border border-[#DFE8F5] text-xs font-semibold text-[#64748B]"
              >
                Close
              </button>
              {selectedKyc.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleReview(selectedKyc.id, 'APPROVED')}
                    className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold"
                  >
                    Approve KYC
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedKyc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DFE8F5] space-y-4 animate-scale-in">
            <h3 className="font-bold text-sm text-[#10213A]">Specify Reason for KYC Rejection</h3>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Blurry photo, name mismatch with account, or expired government ID."
              className="w-full text-xs p-3 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(selectedKyc.id, 'REJECTED')}
                disabled={!rejectionReason || actionLoading}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
