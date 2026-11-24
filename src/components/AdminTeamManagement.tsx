import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  Tag
} from 'lucide-react';
import { AdminTeamMember, Language } from '../types';
import { INITIAL_TEAM_MEMBERS } from '../data/seedData';

export type TeamRole = 'super_admin' | 'content_creator' | 'verifier' | 'finance_manager';

interface AdminTeamManagementProps {
  lang: Language;
  currentRole?: string;
  userEmail?: string;
}

export function AdminTeamManagement({ lang, currentRole, userEmail }: AdminTeamManagementProps) {
  const [team, setTeam] = useState<AdminTeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('content_creator');
  const [assignedCategory, setAssignedCategory] = useState('General Knowledge');
  const [message, setMessage] = useState<string | null>(null);

  const getHeaders = () => ({
    'Content-Type': 'application/json'
  });

  const loadTeam = () => {
    setLoading(true);
    fetch('/api/admin/team', {
      headers: getHeaders()
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load team: HTTP ${res.status}`);
        }
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('Non-JSON response received from server');
      })
      .then(data => {
        if (Array.isArray(data)) setTeam(data);
      })
      .catch(err => {
        console.warn('Notice: Using cached initial admin team directory.', err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name,
          email,
          role,
          assignedCategories: [assignedCategory]
        })
      });

      if (res.ok) {
        setMessage('Admin team member role assigned successfully!');
        setName('');
        setEmail('');
        setShowAddForm(false);
        loadTeam();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMessage(errorData.error || 'Failed to assign team member role.');
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error adding team member:', err);
      setMessage('Network error connecting to administrative service.');
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this admin access?')) return;
    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        loadTeam();
      }
    } catch (err) {
      console.error('Error revoking member:', err);
    }
  };

  const roleConfigs: Record<string, { label: string; color: string; desc: string }> = {
    super_admin: { label: 'Super Admin', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200', desc: 'Full platform access, billing, user moderation and data export' },
    notice_publisher: { label: 'Notice Publisher', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200', desc: 'PDF notice ingestion, vacancy publication & administrative alerts' },
    quiz_reviewer: { label: 'Quiz Reviewer', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200', desc: 'Syllabus alignment check, answer key verification & AI audit' },
    content_creator: { label: 'Content Creator', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200', desc: 'Drafting chapter study notes and model quiz sets' }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Admin Team & Granular Permission Delegation</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Delegate publication and review tasks to moderators, content creators, and subject matter experts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition shadow-xs self-start bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Cancel Invite' : 'Invite Team Member'}</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Invite Form */}
      {showAddForm && (
        <form onSubmit={handleAddMember} className="bg-sky-50/70 dark:bg-slate-800/40 p-5 rounded-2xl space-y-4 animate-scale-up text-xs">
          <h4 className="font-bold text-slate-800 dark:text-slate-200">Add New Team Member & Assign Permissions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Adhikari"
                className="w-full p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ramesh@sarkarisajha.np"
                className="w-full p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as TeamRole)}
                className="w-full p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="content_creator">Content Creator (Notes & Questions)</option>
                <option value="quiz_reviewer">Quiz Reviewer (Syllabus & Key Verification)</option>
                <option value="notice_publisher">Notice Publisher (PDF Ingestion & Alerts)</option>
                <option value="super_admin">Super Admin (Full System Control)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Assigned Subject Area</label>
              <select
                value={assignedCategory}
                onChange={(e) => setAssignedCategory(e.target.value)}
                className="w-full p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="General Knowledge & Current Affairs">General Knowledge & Current Affairs</option>
                <option value="Governance & Public Management">Governance & Public Management</option>
                <option value="Banking & Monetary Economics">Banking & Monetary Economics</option>
                <option value="Constitution & Civil Service Acts">Constitution & Civil Service Acts</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-full font-bold transition bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
            >
              Assign Role & Save
            </button>
          </div>
        </form>
      )}

      {/* Team Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {team.map((member) => {
          const config = roleConfigs[member.role] || roleConfigs.content_creator;
          const isSuper = member.role === 'super_admin';

          return (
            <div
              key={member.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl flex flex-col justify-between space-y-4 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Added: {member.addedAt}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{member.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {member.email}
                  </p>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed bg-sky-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl">
                  {config.desc}
                </p>

                {member.assignedCategories && member.assignedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {member.assignedCategories.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {!isSuper && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRevoke(member.id)}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Permissions</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
