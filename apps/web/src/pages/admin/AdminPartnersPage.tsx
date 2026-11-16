import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Key, Plus, RefreshCw, AlertCircle, CheckCircle, Copy, Radio, ShoppingBag } from 'lucide-react';

export const AdminPartnersPage: React.FC = () => {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [appName, setAppName] = useState('');
  const [slug, setSlug] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/partners');
      setPartners(res || []);
    } catch (err: any) {
      console.error('Failed to load partners', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      await api.post('/admin/partners', {
        appName,
        slug: slug.toLowerCase().trim(),
        webhookUrl: webhookUrl || undefined,
        permissions: 'read_balance,debit,credit,transfer',
      });

      setSuccess(`Partner '${appName}' registered! API credentials generated.`);
      setShowCreateModal(false);
      setAppName('');
      setSlug('');
      setWebhookUrl('');
      fetchPartners();
    } catch (err: any) {
      setError(err.message || 'Creation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#10213A]">Ecosystem Integration APIs</h1>
          <p className="text-xs text-[#64748B]">
            Configure API Keys and webhooks for connected ecosystem platforms (YouPeak, YouPeak E-Commerce, etc.).
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#175CFF] hover:bg-[#123B9A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Register Connected App
          </button>
          <button
            onClick={fetchPartners}
            className="p-2 rounded-xl border border-[#DFE8F5] bg-white hover:bg-gray-50 text-[#175CFF]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
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

      {/* Partners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {partners.map((p) => (
          <div key={p.id} className="p-5 rounded-2xl bg-white border border-[#DFE8F5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EDF4FF] text-[#175CFF] flex items-center justify-center font-bold">
                  {p.slug.includes('ecom') ? <ShoppingBag className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#10213A]">{p.appName}</h3>
                  <div className="text-[11px] text-[#64748B]">Slug: {p.slug}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                {p.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F7FAFF] border border-[#DFE8F5] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">X-Partner-Key:</span>
                <span className="font-bold text-[#10213A] text-[11px]">{p.apiKey}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#64748B]">Permissions:</span>
                <span className="text-[#175CFF] font-sans font-semibold">{p.permissions}</span>
              </div>
            </div>

            {p.webhookUrl && (
              <div className="text-[11px] text-[#64748B] truncate">
                Webhook: <code className="text-[#10213A]">{p.webhookUrl}</code>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DFE8F5] space-y-4 animate-scale-in">
            <h3 className="font-bold text-sm text-[#10213A]">Register New Connected App</h3>

            <form onSubmit={handleCreatePartner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#10213A] mb-1">Platform / Application Name</label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. YouPeak Mobile or YouPeak Gaming"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10213A] mb-1">Slug (Identifier)</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. youpeak-gaming"
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10213A] mb-1">Webhook URL (Optional)</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://app.youpeak.live/api/webhooks/sicoin"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !appName || !slug}
                  className="px-5 py-2 rounded-xl bg-[#175CFF] text-white text-xs font-bold hover:bg-[#123B9A] disabled:opacity-50"
                >
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
