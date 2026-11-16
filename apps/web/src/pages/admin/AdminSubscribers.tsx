import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Mail, Download } from 'lucide-react';

export const AdminSubscribers: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/subscribers')
      .then((data) => setList(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleExport = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Email,SubscribedAt\n' +
      list.map((e) => `"${e.email}","${e.subscribedAt}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sicoin_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Newsletter Subscribers</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Official protocol communications list</p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#DFE8F5] bg-white text-xs font-semibold text-[#10213A] hover:bg-[#F7FAFF] shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV List
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-card overflow-hidden">
        <div className="p-6 border-b border-[#DFE8F5]">
          <h2 className="font-bold text-base text-[#10213A]">Subscribers ({list.length})</h2>
        </div>

        {list.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B]">No newsletter subscribers yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7FAFF] text-[#64748B] border-b border-[#DFE8F5]">
                <tr>
                  <th className="p-4 font-semibold">Subscriber Email</th>
                  <th className="p-4 font-semibold">Subscribed Date</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE8F5]">
                {list.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F7FAFF]/50 transition-colors">
                    <td className="p-4 font-medium text-[#10213A]">{s.email}</td>
                    <td className="p-4 text-[#64748B]">{new Date(s.subscribedAt).toLocaleString()}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold uppercase text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full">
                        Active
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
