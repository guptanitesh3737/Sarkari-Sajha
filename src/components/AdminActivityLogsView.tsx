import React, { useState, useEffect } from 'react';
import {
  FileText,
  Filter,
  Search,
  RefreshCw,
  Download,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Briefcase,
  HelpCircle,
  BrainCircuit,
  UploadCloud,
  UserCheck,
  Settings,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { AdminActivityLog, AdminActionCategory, Language } from '../types';
import { fetchAdminActivityLogs } from '../lib/firestoreService';

interface AdminActivityLogsViewProps {
  lang: Language;
}

export const AdminActivityLogsView: React.FC<AdminActivityLogsViewProps> = ({ lang }) => {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/activity-logs', window.location.origin);
      if (selectedCategory !== 'ALL') url.searchParams.set('category', selectedCategory);
      if (selectedSeverity !== 'ALL') url.searchParams.set('severity', selectedSeverity);
      if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      } else {
        const fallback = await fetchAdminActivityLogs();
        setLogs(fallback);
      }
    } catch (err) {
      console.error('Failed to load admin activity logs:', err);
      const fallback = await fetchAdminActivityLogs();
      setLogs(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedCategory, selectedSeverity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const rows = [
      ['Timestamp', 'Admin Name', 'Category', 'Action', 'Target Name', 'Severity', 'Details'],
      ...logs.map(l => [
        l.timestamp,
        `"${l.adminName || 'Admin'}"`,
        l.category || 'SETTINGS_CHANGE',
        l.action,
        `"${l.targetName || ''}"`,
        l.severity || 'info',
        `"${(l.details || '').replace(/"/g, '""')}"`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SarkariSajha_Admin_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryIcon = (category?: AdminActionCategory) => {
    switch (category) {
      case 'VACANCY_CHANGE': return Briefcase;
      case 'QUESTION_CHANGE': return HelpCircle;
      case 'AI_GENERATION': return BrainCircuit;
      case 'PUBLISHING': return UploadCloud;
      case 'USER_ROLE_CHANGE': return UserCheck;
      case 'SETTINGS_CHANGE': return Settings;
      default: return FileText;
    }
  };

  const getCategoryColor = (category?: AdminActionCategory) => {
    switch (category) {
      case 'VACANCY_CHANGE': return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'QUESTION_CHANGE': return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'AI_GENERATION': return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'PUBLISHING': return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'USER_ROLE_CHANGE': return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'SETTINGS_CHANGE': return 'bg-rose-950 text-rose-300 border-rose-800';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">
              {lang === 'np' ? 'प्रशासनिक कार्य अडिट लग' : 'Admin Activity Audit Trail & Change Logs'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive tamper-evident logging of vacancy changes, question edits, AI generations, publishing, roles, and settings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-emerald-800 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Audit</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-nowrap text-xs">
          <span className="text-slate-400 font-bold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-blue-400" /> Category:
          </span>
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'VACANCY_CHANGE', label: 'Vacancy Changes' },
            { id: 'QUESTION_CHANGE', label: 'Question Changes' },
            { id: 'AI_GENERATION', label: 'AI Generation' },
            { id: 'PUBLISHING', label: 'Publishing' },
            { id: 'USER_ROLE_CHANGE', label: 'User-Role Changes' },
            { id: 'SETTINGS_CHANGE', label: 'Settings Changes' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Severity Filter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-800">
          <form onSubmit={handleSearchSubmit} className="md:col-span-8 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail by admin name, action, or target keywords..."
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
            >
              Search
            </button>
          </form>

          <div className="md:col-span-4 flex items-center gap-2 justify-end">
            <span className="text-xs text-slate-400">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mb-2" />
            Loading audit activity trail...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-slate-900 border border-slate-800 rounded-2xl">
            No activity records match your filter criteria.
          </div>
        ) : (
          logs.map((log) => {
            const Icon = getCategoryIcon(log.category);
            const categoryBadge = getCategoryColor(log.category);
            const isExpanded = expandedLogId === log.id;

            return (
              <div
                key={log.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 transition hover:border-slate-700 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-xl border shrink-0 ${categoryBadge}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoryBadge}`}>
                          {(log.category || 'ACTION').replace('_', ' ')}
                        </span>
                        <span className="font-bold text-xs text-white truncate">
                          {log.action}
                        </span>
                        {log.severity && log.severity !== 'info' && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            log.severity === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {log.severity}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{log.details}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-slate-400 text-xs sm:self-center">
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-slate-300">{log.adminName || 'Admin'}</p>
                      <p className="text-[10px] font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>

                    {log.targetName && (
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="p-1 text-slate-400 hover:text-white rounded-lg"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && log.targetName && (
                  <div className="pt-2 border-t border-slate-800/80 bg-slate-950/60 p-3 rounded-xl text-xs space-y-1 text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Target Entity: <strong className="text-slate-200">{log.targetName}</strong></span>
                      {log.targetId && <span className="font-mono text-[10px] text-slate-500">ID: {log.targetId}</span>}
                    </div>
                    {log.diff && (
                      <pre className="text-[10px] font-mono bg-slate-950 p-2 rounded text-slate-300 overflow-x-auto border border-slate-800 mt-1">
                        {JSON.stringify(log.diff, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
