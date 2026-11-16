import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ClipboardList, Search, RefreshCw, Calendar, User, Eye } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = () => {
    setIsLoading(true);
    api
      .get<{ logs: any[]; total: number }>(`/admin/audit-logs?page=${page}&limit=30`)
      .then((data) => {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Immutable Audit Trail</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Full compliance record of administrative operations, price publications, and role alterations
          </p>
        </div>

        <button onClick={fetchLogs} className="p-2 text-[#64748B] hover:text-[#175CFF] border border-[#DFE8F5] rounded-xl bg-white">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-card overflow-hidden">
        <div className="p-6 border-b border-[#DFE8F5]">
          <h2 className="font-bold text-base text-[#10213A]">Event Stream ({total})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7FAFF] text-[#64748B] border-b border-[#DFE8F5]">
              <tr>
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">Actor Email</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Action</th>
                <th className="p-4 font-semibold">Entity Type</th>
                <th className="p-4 font-semibold">IP Address</th>
                <th className="p-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE8F5]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F7FAFF]/50 transition-colors">
                  <td className="p-4 text-[#64748B] whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 font-medium text-[#10213A]">{log.actorEmail || 'System Service'}</td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold uppercase text-[#123B9A] bg-[#EDF4FF] px-2 py-0.5 rounded-full">
                      {log.actorRole || 'SYSTEM'}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-[#175CFF]">{log.action}</td>
                  <td className="p-4 text-[#64748B]">{log.entityType}</td>
                  <td className="p-4 font-mono text-[11px] text-[#94A3B8]">{log.ipAddress || '127.0.0.1'}</td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-[#175CFF] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-4 animate-in fade-in zoom-in-95">
            <div className="border-b border-[#DFE8F5] pb-3">
              <h3 className="text-base font-bold text-[#10213A]">Audit Event Details</h3>
              <span className="text-xs text-[#64748B] font-mono">{selectedLog.id}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div><strong>Action:</strong> <span className="text-[#175CFF] font-bold">{selectedLog.action}</span></div>
              <div><strong>Actor:</strong> {selectedLog.actorEmail} ({selectedLog.actorRole})</div>
              <div><strong>Timestamp:</strong> {new Date(selectedLog.createdAt).toISOString()}</div>
              <div><strong>User Agent:</strong> <span className="font-mono text-[11px] break-all">{selectedLog.userAgent || '—'}</span></div>
              <div>
                <strong>Payload / Modifications:</strong>
                <pre className="mt-1 p-3 bg-[#F7FAFF] rounded-xl border border-[#DFE8F5] text-[11px] font-mono max-h-56 overflow-y-auto whitespace-pre-wrap">
                  {selectedLog.details || 'No additional payload stored'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-[#175CFF] text-white text-xs font-semibold"
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
