import React from 'react';
import { ShieldCheck, Check, X } from 'lucide-react';

export const AdminRoles: React.FC = () => {
  const permissions = [
    { key: 'manage_users', label: 'User & Account Management' },
    { key: 'manage_roles', label: 'Role & Permission Assignment' },
    { key: 'manage_coin_config', label: 'Coin Configuration & Metadata' },
    { key: 'manage_pricing', label: 'Reference Price Publication & Feeds' },
    { key: 'manage_tokenomics', label: 'Tokenomics Allocation Editing' },
    { key: 'manage_announcements', label: 'Announcements CMS' },
    { key: 'manage_faq', label: 'FAQ CMS' },
    { key: 'manage_roadmap', label: 'Roadmap CMS' },
    { key: 'manage_ecosystem', label: 'Ecosystem Modules CMS' },
    { key: 'manage_support', label: 'Support Ticketing & Agent Replies' },
    { key: 'view_audit_logs', label: 'Audit Trail Telemetry Review' },
    { key: 'manage_system_settings', label: 'System & Security Settings' },
  ];

  const matrix: Record<string, string[]> = {
    SUPER_ADMIN: [
      'manage_users',
      'manage_roles',
      'manage_coin_config',
      'manage_pricing',
      'manage_tokenomics',
      'manage_announcements',
      'manage_faq',
      'manage_roadmap',
      'manage_ecosystem',
      'manage_support',
      'view_audit_logs',
      'manage_system_settings',
    ],
    FINANCE_MANAGER: [
      'manage_coin_config',
      'manage_pricing',
      'manage_tokenomics',
      'view_audit_logs',
    ],
    CONTENT_EDITOR: [
      'manage_announcements',
      'manage_faq',
      'manage_roadmap',
      'manage_ecosystem',
    ],
    SUPPORT_AGENT: [
      'manage_support',
    ],
    READONLY_ANALYST: [
      'view_audit_logs',
    ],
  };

  const roles = [
    { key: 'SUPER_ADMIN', label: 'Super Admin', color: 'text-purple-700 bg-purple-50' },
    { key: 'FINANCE_MANAGER', label: 'Finance Manager', color: 'text-emerald-700 bg-emerald-50' },
    { key: 'CONTENT_EDITOR', label: 'Content Editor', color: 'text-blue-700 bg-blue-50' },
    { key: 'SUPPORT_AGENT', label: 'Support Agent', color: 'text-amber-700 bg-amber-50' },
    { key: 'READONLY_ANALYST', label: 'Read-Only Analyst', color: 'text-slate-700 bg-slate-50' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Role Permissions Matrix</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Strict server-enforced role-based access control (RBAC) boundaries
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-card overflow-hidden">
        <div className="p-6 border-b border-[#DFE8F5]">
          <h2 className="font-bold text-base text-[#10213A]">Capability Authorization Table</h2>
          <p className="text-xs text-[#64748B]">All admin APIs enforce these constraints on every request</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7FAFF] text-[#64748B] border-b border-[#DFE8F5]">
              <tr>
                <th className="p-4 font-semibold">System Permission</th>
                {roles.map((r) => (
                  <th key={r.key} className="p-4 font-semibold text-center whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${r.color}`}>
                      {r.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE8F5]">
              {permissions.map((p) => (
                <tr key={p.key} className="hover:bg-[#F7FAFF]/50 transition-colors">
                  <td className="p-4 font-medium text-[#10213A]">{p.label}</td>
                  {roles.map((r) => {
                    const hasPerm = matrix[r.key]?.includes(p.key);
                    return (
                      <td key={r.key} className="p-4 text-center">
                        {hasPerm ? (
                          <Check className="w-4 h-4 text-[#15803D] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
