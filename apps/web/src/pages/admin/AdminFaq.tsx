import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { HelpCircle, Plus, Edit, Trash2 } from 'lucide-react';

export const AdminFaq: React.FC = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    displayOrder: 1,
    isPublished: true,
  });

  const fetchFaqs = () => {
    setIsLoading(true);
    api
      .get('/content/faq')
      .then((data) => setFaqs(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      displayOrder: faqs.length + 1,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditId(item.id);
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category,
      displayOrder: item.displayOrder,
      isPublished: item.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/admin/faq/${editId}`, formData);
      } else {
        await api.post('/admin/faq', formData);
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch (err: any) {
      alert(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ item?')) return;
    try {
      await api.delete(`/admin/faq/${id}`);
      fetchFaqs();
    } catch (err: any) {
      alert(err.message || 'Failed to delete FAQ item.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">FAQ Knowledge Base</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Manage questions and public clarification disclosures</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add FAQ Item
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-card overflow-hidden">
        <div className="p-6 border-b border-[#DFE8F5]">
          <h2 className="font-bold text-base text-[#10213A]">Published Questions ({faqs.length})</h2>
        </div>

        <div className="divide-y divide-[#DFE8F5]">
          {faqs.map((faq) => (
            <div key={faq.id} className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-[#F7FAFF]/50 transition-colors">
              <div className="space-y-1.5 max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#175CFF] bg-[#EDF4FF] px-2 py-0.5 rounded-md">
                  {faq.category}
                </span>
                <h3 className="font-bold text-sm text-[#10213A]">{faq.question}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">{faq.answer}</p>
              </div>

              <div className="flex items-center gap-3 whitespace-nowrap self-start sm:self-auto text-xs">
                <button
                  onClick={() => handleOpenEdit(faq)}
                  className="font-semibold text-[#175CFF] hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="font-semibold text-[#DC2626] hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-2xl w-full max-w-xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            <div className="border-b border-[#DFE8F5] pb-4">
              <h3 className="text-lg font-bold text-[#10213A]">
                {editId ? 'Edit FAQ Item' : 'New FAQ Item'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">Answer</label>
                <textarea
                  required
                  rows={5}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
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
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
