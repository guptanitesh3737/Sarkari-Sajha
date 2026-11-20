import React, { useState } from 'react';
import {
  BookmarkCheck,
  Calendar,
  Building2,
  Trash2,
  ExternalLink,
  CheckCircle,
  Clock,
  Edit2,
  DollarSign,
  Plus,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { ApplicationTrack, Vacancy, ApplicationStatus, Language } from '../types';
import { t } from '../utils/translations';

interface ApplicationTrackerProps {
  applications: ApplicationTrack[];
  vacancies: Vacancy[];
  lang: Language;
  firebaseUser?: FirebaseUser | null;
  onOpenAuth?: () => void;
  onUpdateStatus: (appId: string, status: ApplicationStatus, notes?: string, feePaid?: boolean) => void;
  onRemoveApp: (appId: string) => void;
  onSelectVacancy: (vacancy: Vacancy) => void;
  onOpenGoogleSheetsSync?: () => void;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  vacancies,
  lang,
  firebaseUser,
  onOpenAuth,
  onUpdateStatus,
  onRemoveApp,
  onSelectVacancy,
  onOpenGoogleSheetsSync
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const pipelineStatuses: ApplicationStatus[] = [
    'Bookmarked',
    'Applied',
    'Admit Card Issued',
    'Exam Attended',
    'Interview',
    'Selected'
  ];

  const filteredApps = applications.filter((app) => {
    if (activeFilter !== 'All' && app.status !== activeFilter) return false;
    return true;
  });

  const handleExportCSV = () => {
    if (applications.length === 0) return;

    const headers = [
      'Application ID',
      'Vacancy Title',
      'Organization',
      'Category',
      'Province',
      'Status',
      'Fee Paid',
      'Fee Amount (NPR)',
      'Deadline',
      'Saved Date',
      'Notes'
    ];

    const escapeCsv = (val: string | number | boolean | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = applications.map((app) => {
      const vac = vacancies.find((v) => v.id === app.vacancyId);
      return [
        escapeCsv(app.id),
        escapeCsv(vac?.title || 'Unknown Vacancy'),
        escapeCsv(vac?.org || ''),
        escapeCsv(vac?.category || ''),
        escapeCsv(vac?.province || ''),
        escapeCsv(app.status),
        escapeCsv(app.feePaid ? 'Yes' : 'No'),
        escapeCsv(vac?.fee ?? 0),
        escapeCsv(vac?.deadline || ''),
        escapeCsv(app.appliedAt || ''),
        escapeCsv(app.notes || '')
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sarkarisajha_application_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              <BookmarkCheck className="w-3.5 h-3.5 text-blue-600" /> Career Application Pipeline
            </span>
            <h2 className="text-2xl font-black font-sans text-slate-900">
              {lang === 'np' ? 'मेरो दरखास्त तथा भर्ना ट्रयाकर' : 'My Saved Bookmarks & Applications'}
            </h2>
            <p className="text-xs text-slate-500 max-w-xl">
              Track your Lok Sewa, Banking, and Government job applications from initial bookmark to fee voucher payment, admit card release, exam attendance, and final results!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {onOpenGoogleSheetsSync && (
              <button
                onClick={onOpenGoogleSheetsSync}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 whitespace-nowrap border border-emerald-600"
                title="Sync and export applications directly to Google Sheets"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>{lang === 'np' ? 'गूगल शीट्स सिङ्क' : 'Google Sheets Sync'}</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              disabled={applications.length === 0}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap border border-slate-200"
              title="Export all tracked application history to CSV file"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'np' ? 'CSV एक्सपोर्ट' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Private Data Security Notice if not logged in */}
        {!firebaseUser && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-amber-500/20 text-amber-700 rounded-xl">
                <BookmarkCheck className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {lang === 'np' ? 'व्यक्तिगत ट्रयाकर सुरक्षित गर्नुहोस्' : 'Private Firebase & Firestore Application Storage'}
                </h4>
                <p className="text-[11px] text-slate-600">
                  {lang === 'np'
                    ? 'तपाईं हाल गेस्ट मोडमा हुनुहुन्छ। स्थायी रूपमा दरखास्तहरू बचत र सिङ्क गर्न लगइन गर्नुहोस्।'
                    : 'Sign in to access and sync your private application pipeline securely with Firebase Firestore.'}
                </p>
              </div>
            </div>
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
              >
                {lang === 'np' ? 'साइन इन / लगइन गर्नुहोस्' : 'Sign In / Register'}
              </button>
            )}
          </div>
        )}

        {/* Pipeline Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-4 border-t border-slate-100 mt-4 scrollbar-none">
          <button
            onClick={() => setActiveFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeFilter === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All Tracks ({applications.length})
          </button>

          {pipelineStatuses.map((st) => {
            const count = applications.filter((a) => a.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setActiveFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>{st}</span>
                {count > 0 && (
                  <span className="bg-slate-200 px-1.5 py-0.5 rounded-full text-[10px] font-mono text-slate-800">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications Cards Grid */}
      {filteredApps.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3 shadow-sm">
          <BookmarkCheck className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800">No vacancies saved in this pipeline stage</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Bookmark interesting vacancies from the "Latest Vacancies" tab to start tracking your application progress.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const vac = vacancies.find((v) => v.id === app.vacancyId);
            if (!vac) return null;

            return (
              <div
                key={app.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 text-slate-900 transition shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                        {vac.category}
                      </span>
                      <span className="text-slate-500 text-xs font-mono">{vac.province}</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 font-sans">{vac.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> {vac.org}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Dropdown */}
                    <select
                      value={app.status}
                      onChange={(e) =>
                        onUpdateStatus(app.id, e.target.value as ApplicationStatus, app.notes, app.feePaid)
                      }
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {pipelineStatuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => onRemoveApp(app.id)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition border border-slate-200"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Voucher Payment & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" /> Voucher Fee (NPR {vac.fee}):
                    </span>
                    <button
                      onClick={() =>
                        onUpdateStatus(app.id, app.status, app.notes, !app.feePaid)
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                        app.feePaid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {app.feePaid ? '✓ Fee Paid' : '✗ Unpaid'}
                    </button>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-600" /> Deadline:
                    </span>
                    <span className="font-bold text-amber-800">{vac.deadline}</span>
                  </div>
                </div>

                {/* Candidate Notes */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Preparation & Application Notes:</span>
                    <span className="text-[10px] text-slate-400">Auto-saved</span>
                  </div>
                  <input
                    type="text"
                    value={app.notes || ''}
                    onChange={(e) =>
                      onUpdateStatus(app.id, app.status, e.target.value, app.feePaid)
                    }
                    placeholder="Add personal notes e.g. Submitted citizenship voucher, exam center Kathmandu..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Footer Action */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Saved on: {app.appliedAt}
                  </span>

                  <button
                    onClick={() => onSelectVacancy(vac)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center gap-1 shadow-xs"
                  >
                    <span>View Spec & Syllabus</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
