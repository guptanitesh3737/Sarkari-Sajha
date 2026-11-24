import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Download,
  Calendar,
  X
} from 'lucide-react';
import { AuditLogRecord } from '../types';
import { fetchDetailedAuditLogs } from '../lib/firestoreService';
import { User as FirebaseUser } from 'firebase/auth';

interface AdminAuditLogsProps {
  user: FirebaseUser | null;
  adminRole: string;
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({ user, adminRole }) => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceFilter, setResourceFilter] = useState('ALL');
  const [inspectLog, setInspectLog] = useState<AuditLogRecord | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchDetailedAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Admin Email', 'Action', 'Resource', 'Resource ID', 'Details', 'Severity'];
    const rows = logs.map((l) => [
      l.timestamp,
      l.adminEmail,
      l.action,
      l.resource,
      l.resourceId || '',
      `"${(l.details || '').replace(/"/g, '""')}"`,
      l.severity || 'info'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter((l) => {
    if (resourceFilter !== 'ALL' && l.resource !== resourceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.action.toLowerCase().includes(q) ||
        l.adminEmail.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        (l.resourceId && l.resourceId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Immutable Production Audit Trail</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete cryptographic and tamper-evident history of administrative actions, vacancy verifications, and pricing changes.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Immutable Notice */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Audit records are strictly append-only. Modification and in-place deletions are rejected by Firestore security rules.</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Total Recorded Events: {logs.length}</span>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search action, admin email, details, resource ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-sm pl-9 pr-3 py-2 rounded-full focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-sm px-3 py-2 rounded-full focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Resources</option>
            <option value="VACANCIES">Vacancies</option>
            <option value="ANNOUNCEMENTS">Announcements</option>
            <option value="SUBSCRIPTION_PLANS">Subscription Plans</option>
            <option value="COUPONS">Coupons</option>
            <option value="AI_KNOWLEDGE">AI Knowledge</option>
            <option value="USER_ROLES">User Roles</option>
            <option value="DATA_CLEANUP">Data Cleanup</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-slate-400">No audit log records match your filter.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredLogs.map((l) => (
              <div
                key={l.id}
                id={`audit-row-${l.id}`}
                className="p-4 sm:p-5 hover:bg-slate-850/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {l.action}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 font-semibold border border-blue-800">
                      {l.resource}
                    </span>
                    {l.severity === 'critical' && (
                      <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 font-bold border border-red-700">
                        Critical
                      </span>
                    )}
                    {l.severity === 'warning' && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 font-bold border border-amber-700">
                        Warning
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 font-medium">{l.details}</p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                    <span>Admin: <strong className="text-slate-200">{l.adminEmail}</strong></span>
                    <span>Time: {new Date(l.timestamp).toLocaleString()}</span>
                    {l.resourceId && <span>ID: <code className="text-slate-300 font-mono">{l.resourceId}</code></span>}
                  </div>
                </div>

                <div className="shrink-0 self-end md:self-center">
                  <button
                    onClick={() => setInspectLog(l)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect State</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INSPECT STATE MODAL */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-blue-400">{inspectLog.action}</span>
                <h3 className="text-base font-bold text-white">Event Snapshot Details</h3>
              </div>
              <button onClick={() => setInspectLog(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-850 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block">Executor</span>
                  <span className="font-bold text-white">{inspectLog.adminEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Recorded Timestamp</span>
                  <span className="font-bold text-white">{inspectLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Target Resource</span>
                  <span className="text-blue-300 font-mono">{inspectLog.resource} ({inspectLog.resourceId || 'N/A'})</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Severity Level</span>
                  <span className="capitalize font-bold text-white">{inspectLog.severity || 'Info'}</span>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-300 mb-1">Audit Explanation:</p>
                <p className="p-3 bg-slate-800 rounded-xl text-slate-200 border border-slate-700">{inspectLog.details}</p>
              </div>

              {inspectLog.newState && (
                <div>
                  <p className="font-semibold text-slate-300 mb-1">State Payload Snapshot:</p>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-60">
                    {JSON.stringify(inspectLog.newState, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
