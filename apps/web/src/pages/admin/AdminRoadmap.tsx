import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Milestone, Plus, Edit, Trash2 } from 'lucide-react';

export const AdminRoadmap: React.FC = () => {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    phaseNumber: 'Phase 01',
    phaseTitle: '',
    targetPeriod: '',
    status: 'PLANNED',
    milestones: [''],
    details: '',
    isTargetEstimate: true,
    displayOrder: 1,
  });

  const fetchRoadmap = () => {
    setIsLoading(true);
    api
      .get('/content/roadmap')
      .then((data) => setMilestones(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      phaseNumber: `Phase 0${milestones.length + 1}`,
      phaseTitle: '',
      targetPeriod: 'Q1 – Q2 2027',
      status: 'PLANNED',
      milestones: ['Milestone deliverable item 1'],
      details: '',
      isTargetEstimate: true,
      displayOrder: milestones.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditId(item.id);
    setFormData({
      phaseNumber: item.phaseNumber,
      phaseTitle: item.phaseTitle,
      targetPeriod: item.targetPeriod,
      status: item.status,
      milestones: item.milestones || [''],
      details: item.details,
      isTargetEstimate: item.isTargetEstimate,
      displayOrder: item.displayOrder,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/admin/roadmap/${editId}`, formData);
      } else {
        await api.post('/admin/roadmap', formData);
      }
      setIsModalOpen(false);
      fetchRoadmap();
    } catch (err: any) {
      alert(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this roadmap milestone?')) return;
    try {
      await api.delete(`/admin/roadmap/${id}`);
      fetchRoadmap();
    } catch (err: any) {
      alert(err.message || 'Failed to delete milestone.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Roadmap Milestones</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Manage phases, deliverables, target periods, and completion states</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Phase
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {milestones.map((m) => (
          <div key={m.id} className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#175CFF] tracking-wider">{m.phaseNumber}</span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  m.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-[#15803D]'
                    : m.status === 'IN_PROGRESS'
                    ? 'bg-blue-100 text-[#175CFF]'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {m.status.replace('_', ' ')}
              </span>
            </div>

            <h3 className="font-bold text-base text-[#10213A]">{m.phaseTitle}</h3>
            <span className="text-xs text-[#64748B] block font-semibold">{m.targetPeriod}</span>
            <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">{m.details}</p>

            <div className="pt-3 border-t border-[#DFE8F5] flex justify-end gap-3 text-xs">
              <button onClick={() => handleOpenEdit(m)} className="text-[#175CFF] font-semibold hover:underline">
                Edit Phase
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
              <h3 className="text-lg font-bold text-[#10213A]">{editId ? 'Edit Phase' : 'New Roadmap Phase'}</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">Phase Identifier</label>
                  <input
                    type="text"
                    required
                    value={formData.phaseNumber}
                    onChange={(e) => setFormData({ ...formData, phaseNumber: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">Target Period</label>
                  <input
                    type="text"
                    required
                    value={formData.targetPeriod}
                    onChange={(e) => setFormData({ ...formData, targetPeriod: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">Phase Title</label>
                <input
                  type="text"
                  required
                  value={formData.phaseTitle}
                  onChange={(e) => setFormData({ ...formData, phaseTitle: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                >
                  <option value="PLANNED">Planned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">Details Summary</label>
                <textarea
                  required
                  rows={3}
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
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
                  Save Phase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
