import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Grid, Plus, Edit, Trash2 } from 'lucide-react';

export const AdminEcosystem: React.FC = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category: 'Infrastructure',
    status: 'AVAILABLE',
    badgeText: '',
    iconName: 'Box',
    displayOrder: 1,
    isPublic: true,
  });

  const fetchModules = () => {
    setIsLoading(true);
    api
      .get('/content/ecosystem')
      .then((data) => setModules(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      category: 'Infrastructure',
      status: 'IN_DEVELOPMENT',
      badgeText: '',
      iconName: 'Box',
      displayOrder: modules.length + 1,
      isPublic: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditId(item.id);
    setFormData({
      title: item.title,
      slug: item.slug,
      description: item.description,
      category: item.category,
      status: item.status,
      badgeText: item.badgeText || '',
      iconName: item.iconName || 'Box',
      displayOrder: item.displayOrder,
      isPublic: item.isPublic,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/admin/ecosystem/${editId}`, formData);
      } else {
        await api.post('/admin/ecosystem', formData);
      }
      setIsModalOpen(false);
      fetchModules();
    } catch (err: any) {
      alert(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      await api.delete(`/admin/ecosystem/${id}`);
      fetchModules();
    } catch (err: any) {
      alert(err.message || 'Failed to delete module.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Ecosystem Modules</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Manage connected apps, developer tooling, and governance components</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Ecosystem Module
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((m) => (
          <div key={m.id} className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">{m.category}</span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  m.status === 'AVAILABLE'
                    ? 'bg-emerald-100 text-[#15803D]'
                    : m.status === 'IN_DEVELOPMENT'
                    ? 'bg-blue-100 text-[#175CFF]'
                    : 'bg-amber-100 text-[#B45309]'
                }`}
              >
                {m.status.replace('_', ' ')}
              </span>
            </div>

            <h3 className="font-bold text-base text-[#10213A]">{m.title}</h3>
            <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">{m.description}</p>

            <div className="pt-3 border-t border-[#DFE8F5] flex justify-end gap-3 text-xs">
              <button onClick={() => handleOpenEdit(m)} className="text-[#175CFF] font-semibold hover:underline">
                Edit
              </button>
              <button onClick={() => handleDelete(m.id)} className="text-[#DC2626] font-semibold hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-2xl w-full max-w-xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            <div className="border-b border-[#DFE8F5] pb-4">
              <h3 className="text-lg font-bold text-[#10213A]">{editId ? 'Edit Module' : 'New Ecosystem Module'}</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">Module Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    setFormData({ ...formData, title, slug: formData.slug || slug });
                  }}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="IN_DEVELOPMENT">In Development</option>
                    <option value="PLANNED">Planned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">Badge Text (Optional)</label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="e.g. Non-Custodial, Live in v1"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#DFE8F5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A]"
                >
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
