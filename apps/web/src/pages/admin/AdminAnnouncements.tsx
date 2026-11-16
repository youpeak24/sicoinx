import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Megaphone, Plus, Edit, Trash2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const AdminAnnouncements: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: 'General',
    status: 'PUBLISHED',
    isPinned: false,
    isFeaturedBanner: false,
  });

  const fetchAnnouncements = () => {
    setIsLoading(true);
    api
      .get('/admin/announcements')
      .then((data) => setItems(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      title: '',
      slug: '',
      summary: '',
      content: '',
      category: 'Ecosystem Announcement',
      status: 'PUBLISHED',
      isPinned: false,
      isFeaturedBanner: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditId(item.id);
    setFormData({
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      content: item.content,
      category: item.category,
      status: item.status,
      isPinned: item.isPinned,
      isFeaturedBanner: item.isFeaturedBanner,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/admin/announcements/${editId}`, formData);
      } else {
        await api.post('/admin/announcements', formData);
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Announcements CMS</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage protocol notices, featured header strips, and technical release publications
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Announcement
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-card overflow-hidden">
        <div className="p-6 border-b border-[#DFE8F5]">
          <h2 className="font-bold text-base text-[#10213A]">All Announcements ({items.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7FAFF] text-[#64748B] border-b border-[#DFE8F5]">
              <tr>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Banner / Pinned</th>
                <th className="p-4 font-semibold">Created</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE8F5]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#F7FAFF]/50 transition-colors">
                  <td className="p-4 font-bold text-[#10213A] max-w-sm truncate">{item.title}</td>
                  <td className="p-4 text-[#64748B]">{item.category}</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        item.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-[#15803D]'
                          : item.status === 'DRAFT'
                          ? 'bg-amber-100 text-[#B45309]'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 space-x-1">
                    {item.isFeaturedBanner && (
                      <span className="text-[10px] bg-blue-100 text-[#175CFF] font-semibold px-2 py-0.5 rounded-full">
                        Header Banner
                      </span>
                    )}
                    {item.isPinned && (
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
                        Pinned
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-[#64748B] whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="text-[#175CFF] hover:underline font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-[#DC2626] hover:underline font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#DFE8F5] pb-4">
              <h3 className="text-lg font-bold text-[#10213A]">
                {editId ? 'Edit Announcement' : 'Create New Announcement'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-|-$/g, '');
                    setFormData({ ...formData, title, slug: formData.slug || slug });
                  }}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">Summary (1-2 sentences)</label>
                <textarea
                  required
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">Full Content</label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="bannerCheck"
                    checked={formData.isFeaturedBanner}
                    onChange={(e) => setFormData({ ...formData, isFeaturedBanner: e.target.checked })}
                    className="rounded border-[#DFE8F5] text-[#175CFF]"
                  />
                  <label htmlFor="bannerCheck" className="text-xs text-[#10213A] font-semibold cursor-pointer">
                    Top Announcement Banner
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="pinCheck"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="rounded border-[#DFE8F5] text-[#175CFF]"
                  />
                  <label htmlFor="pinCheck" className="text-xs text-[#10213A] font-semibold cursor-pointer">
                    Pin to Top
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#DFE8F5]">
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
                  Save Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
