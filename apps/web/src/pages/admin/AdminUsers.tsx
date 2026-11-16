import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Users, Search, ShieldCheck, Ban, CheckCircle2, RefreshCw } from 'lucide-react';
import { Role } from '@sicoin/shared';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = () => {
    setIsLoading(true);
    api
      .get<{ users: any[]; total: number }>(`/admin/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`)
      .then((data) => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err: any) {
      alert(err.message || 'Failed to update user role.');
    }
  };

  const handleToggleBan = async (userId: string, currentBanned: boolean) => {
    const action = currentBanned ? 'unban' : 'ban';
    if (!confirm(`Are you sure you want to ${action} this account?`)) return;

    try {
      await api.patch(`/admin/users/${userId}/ban`, { isBanned: !currentBanned });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isBanned: !currentBanned } : u)));
    } catch (err: any) {
      alert(err.message || 'Failed to update ban status.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">User & Access Management</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Manage registered accounts, role assignments, and security suspensions</p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or name..."
            className="w-full text-xs px-3.5 py-2 pl-9 rounded-xl border border-[#DFE8F5] bg-white focus:outline-none focus:border-[#175CFF]"
          />
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-card overflow-hidden">
        <div className="p-6 border-b border-[#DFE8F5] flex items-center justify-between">
          <h2 className="font-bold text-base text-[#10213A]">Registered Users ({total})</h2>
          <button onClick={fetchUsers} className="p-2 text-[#64748B] hover:text-[#175CFF]">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7FAFF] text-[#64748B] border-b border-[#DFE8F5]">
              <tr>
                <th className="p-4 font-semibold">User Profile</th>
                <th className="p-4 font-semibold">Verification</th>
                <th className="p-4 font-semibold">2FA</th>
                <th className="p-4 font-semibold">Assigned Role</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE8F5]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#F7FAFF]/50 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-sm text-[#10213A] block">{u.name}</span>
                    <span className="text-[#64748B] font-mono text-[11px] block">{u.email}</span>
                  </td>
                  <td className="p-4">
                    {u.isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#B45309] bg-amber-50 px-2 py-0.5 rounded-full">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {u.mfaEnabled ? (
                      <span className="text-[10px] font-bold text-[#15803D]">Active</span>
                    ) : (
                      <span className="text-[10px] text-[#64748B]">Disabled</span>
                    )}
                  </td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white"
                    >
                      <option value="USER">User</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="FINANCE_MANAGER">Finance Manager</option>
                      <option value="CONTENT_EDITOR">Content Editor</option>
                      <option value="SUPPORT_AGENT">Support Agent</option>
                      <option value="READONLY_ANALYST">Read-Only Analyst</option>
                    </select>
                  </td>
                  <td className="p-4">
                    {u.isBanned ? (
                      <span className="text-[10px] font-bold uppercase text-[#DC2626] bg-red-100 px-2 py-0.5 rounded-full">
                        Suspended
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase text-[#15803D] bg-emerald-100 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleBan(u.id, u.isBanned)}
                      className={`text-[11px] font-semibold hover:underline ${
                        u.isBanned ? 'text-[#15803D]' : 'text-[#DC2626]'
                      }`}
                    >
                      {u.isBanned ? 'Restore Account' : 'Suspend Account'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
