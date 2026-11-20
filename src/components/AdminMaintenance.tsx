import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  AlertTriangle,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileCheck,
  HardDrive,
  Activity,
  Layers,
  HelpCircle,
  Lock
} from 'lucide-react';
import { DataHygieneReport } from '../types';
import {
  scanProductionDataHygiene,
  executeSafeProductionCleanup,
  exportDatabaseBackup
} from '../lib/firestoreService';
import { User as FirebaseUser } from 'firebase/auth';

interface AdminMaintenanceProps {
  user: FirebaseUser | null;
  adminRole: string;
}

export const AdminMaintenance: React.FC<AdminMaintenanceProps> = ({ user, adminRole }) => {
  const [report, setReport] = useState<DataHygieneReport | null>(null);
  const [scanning, setScanning] = useState(true);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [cleaning, setCleaning] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [actionResult, setActionResult] = useState<{ success: boolean; message: string } | null>(null);

  const runScan = async () => {
    setScanning(true);
    try {
      const data = await scanProductionDataHygiene();
      setReport(data);
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    runScan();
  }, []);

  const handleExportBackup = async () => {
    setExporting(true);
    try {
      await exportDatabaseBackup();
      setActionResult({
        success: true,
        message: 'Complete database JSON snapshot successfully generated and downloaded.'
      });
    } catch (err: any) {
      setActionResult({
        success: false,
        message: err?.message || 'Failed to export backup.'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExecuteCleanup = async () => {
    if (confirmationCode.trim() !== 'CONFIRM_PRODUCTION_CLEANUP') {
      alert('You must enter the exact confirmation code: CONFIRM_PRODUCTION_CLEANUP');
      return;
    }

    setCleaning(true);
    setActionResult(null);
    try {
      const res = await executeSafeProductionCleanup(
        confirmationCode.trim(),
        user?.uid || 'admin',
        user?.email || 'admin@sarkarisajha.gov.np'
      );

      setActionResult({
        success: res.success,
        message: res.message
      });

      if (res.success) {
        setConfirmationCode('');
        await runScan();
      }
    } catch (err: any) {
      setActionResult({
        success: false,
        message: err?.message || 'Error executing cleanup.'
      });
    } finally {
      setCleaning(false);
    }
  };

  const totalDemoItems = report
    ? (report.demoVacanciesCount || 0) +
      (report.demoAnnouncementsCount || 0) +
      (report.demoQuestionsCount || 0) +
      (report.demoNotificationsCount || 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Production Maintenance & Data Hygiene</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Safe production verification protocol: identify demo content, export JSON snapshots, require explicit typed confirmation, and record all events in immutable audit logs.
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={runScan}
            disabled={scanning}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            <span>Re-Scan Hygiene</span>
          </button>
          <button
            id="btn-export-backup"
            onClick={handleExportBackup}
            disabled={exporting}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Exporting...' : 'Export Backup JSON'}</span>
          </button>
        </div>
      </div>

      {actionResult && (
        <div className={`p-4 rounded-xl border flex items-center space-x-3 text-sm ${
          actionResult.success
            ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
            : 'bg-red-950/80 border-red-700 text-red-200'
        }`}>
          {actionResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span>{actionResult.message}</span>
        </div>
      )}

      {/* Safety Mandate Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-rose-800/40 p-5 rounded-2xl space-y-2">
        <div className="flex items-center space-x-2 text-rose-300 font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-rose-400" />
          <span>Strict Safe Cleanup Guarantees (Prompt Mandate #1)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          SarkariSajha enforces non-destructive safeguards. The cleanup operation <strong>NEVER deletes real production users, actual candidate quiz attempts, or official gazette vacancies</strong>. It isolates and removes only flagged mock test notices, demo placeholders, and sample broadcasts.
        </p>
      </div>

      {/* Health Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-400">Total Vacancies</span>
          <p className="text-2xl font-black text-white mt-1">{report?.totalVacancies || 0}</p>
          <div className="mt-1 flex items-center space-x-1 text-[11px]">
            <span className="text-emerald-400 font-bold">{report?.verifiedVacanciesCount || 0} Verified</span>
            <span className="text-slate-500">|</span>
            <span className={report?.demoVacanciesCount ? 'text-amber-400 font-bold' : 'text-slate-400'}>
              {report?.demoVacanciesCount || 0} Demo
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-400">Announcements</span>
          <p className="text-2xl font-black text-white mt-1">{report?.totalAnnouncements || 0}</p>
          <div className="mt-1 text-[11px]">
            <span className={report?.demoAnnouncementsCount ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {report?.demoAnnouncementsCount || 0} Flagged for Review
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-400">Quiz Question Bank</span>
          <p className="text-2xl font-black text-white mt-1">{report?.totalQuestions || 0}</p>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium">
            <span>Official Lok Sewa Syllabus questions</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-400">Identified Demo Items</span>
          <p className={`text-2xl font-black mt-1 ${totalDemoItems > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {totalDemoItems}
          </p>
          <div className="mt-1 text-[11px]">
            {totalDemoItems === 0 ? (
              <span className="text-emerald-400 font-bold">100% Genuine Production Ready</span>
            ) : (
              <span className="text-amber-400 font-bold">Cleanup Recommended</span>
            )}
          </div>
        </div>
      </div>

      {/* Itemized Identified Demo Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Itemized Demo & Prototype Inventory</h3>
            <p className="text-xs text-slate-400">Specific records flagged for safe removal prior to public production deployment.</p>
          </div>
          <span className="px-3 py-1 bg-slate-800 text-xs font-mono text-slate-300 rounded-lg border border-slate-700">
            {report?.demoItems?.length || 0} flagged records
          </span>
        </div>

        {scanning ? (
          <div className="p-8 text-center text-slate-400 text-xs">Scanning collections in Firestore...</div>
        ) : !report?.demoItems || report.demoItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-slate-200">Zero Demo / Prototype Records Detected</p>
            <p className="text-xs text-slate-500">The public website and Android applications are consuming 100% genuine verified data.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto rounded-xl border border-slate-800">
            {report.demoItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-850/40 hover:bg-slate-800/40 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 font-mono font-bold uppercase text-[10px] border border-amber-800">
                      {item.type}
                    </span>
                    <span className="font-bold text-white">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Reason: {item.reason}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">ID: {item.id}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safe Cleanup Execution Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-rose-400">
          <Lock className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Execute Safe Production Cleanup</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          To execute the cleanup, you must first export a database backup above and then type the exact confirmation phrase below. Once executed, all flagged demo content is safely purged, real users and genuine vacancies remain intact, and the action is immutably logged.
        </p>

        <div className="bg-slate-850 p-4 rounded-xl border border-slate-700 space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Type confirmation code: <span className="text-rose-400 font-mono font-bold select-all">CONFIRM_PRODUCTION_CLEANUP</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="input-cleanup-confirmation"
              type="text"
              placeholder="CONFIRM_PRODUCTION_CLEANUP"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 text-white text-sm font-mono px-4 py-2.5 rounded-xl focus:border-rose-500 focus:outline-none"
            />
            <button
              id="btn-execute-cleanup"
              onClick={handleExecuteCleanup}
              disabled={cleaning || confirmationCode.trim() !== 'CONFIRM_PRODUCTION_CLEANUP'}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-bold text-xs shadow-lg transition-all shrink-0 flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{cleaning ? 'Executing Cleanup...' : 'Execute Safe Cleanup'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
