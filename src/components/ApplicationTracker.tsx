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
import { num, L, daysLeft, H1 } from '../utils/ui';

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

  const tr = L(lang);
  const np = lang === 'np';
  const STAGES = [tr('Bookmarked', 'बुकमार्क'), tr('Form drafted', 'फाराम तयार'), tr('Fee paid', 'दस्तुर तिरियो'), tr('Submitted', 'बुझाइयो')];
  const DOTS = ['#98a2b3', '#5ea9e2', '#f59e0b', '#059669'];

  // Board stage derived from the stored status model:
  // 0 Bookmarked · 1 Applied (fee unpaid) · 2 Applied (fee paid) · 3 admit card issued or later.
  const stageOf = (a: ApplicationTrack) =>
    a.status === 'Bookmarked' ? 0 : a.status === 'Applied' ? (a.feePaid ? 2 : 1) : 3;
  const moveTo = (a: ApplicationTrack, k: number) => {
    const next = Math.max(0, Math.min(3, k));
    if (next === stageOf(a)) return;
    const map: [ApplicationStatus, boolean][] = [
      ['Bookmarked', false],
      ['Applied', false],
      ['Applied', true],
      ['Admit Card Issued', true]
    ];
    onUpdateStatus(a.id, map[next][0], a.notes, map[next][1]);
  };

  const rows = applications
    .map((a) => {
      const v = vacancies.find((x) => x.id === a.vacancyId);
      const deadline = v?.application_deadline || v?.deadline;
      return { a, v, k: stageOf(a), dl: daysLeft(deadline), deadline };
    })
    .sort((x, y) => (x.deadline || '9999').localeCompare(y.deadline || '9999'));
  const pending = rows.filter((r) => r.k < 3);
  const week = pending.filter((r) => r.dl >= 0 && r.dl <= 7).length;

  return (
    <div className="flex flex-col gap-5 pt-7 pb-6">
      <div className="flex flex-wrap justify-between items-end gap-3.5">
        <div className="flex flex-col gap-1.5">
          <h1 className={H1.replace('lg:text-[56px]', 'lg:text-[48px]')}>{tr('My applications', 'मेरो आवेदनहरू')}</h1>
          <p className="text-[15px] text-ink-soft">
            {tr(
              `${pending.length} in progress · ${week} deadline${week === 1 ? '' : 's'} this week`,
              `${num(pending.length, lang)} प्रक्रियामा · यो हप्ता ${num(week, lang)} अन्तिम मिति`
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onOpenGoogleSheetsSync && (
            <button
              onClick={onOpenGoogleSheetsSync}
              className="h-11 px-[18px] rounded-full bg-white text-sm text-ink flex items-center gap-2 shadow-[0_1px_2px_rgb(11_18_32/0.05)] hover:bg-sky-50 transition"
            >
              <span className="w-[18px] h-[18px] rounded bg-[#0f9d58] text-white flex items-center justify-center">
                <FileSpreadsheet className="w-3 h-3" />
              </span>
              {tr('Sync to Google Sheets', 'गुगल शिटमा सिंक')}
            </button>
          )}
          <button
            onClick={handleExportCSV}
            disabled={applications.length === 0}
            className="h-11 px-4 rounded-full bg-white text-sm text-ink flex items-center gap-2 shadow-[0_1px_2px_rgb(11_18_32/0.05)] hover:bg-sky-50 disabled:opacity-50 transition"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {!firebaseUser && (
        <div className="bg-white rounded-[24px] px-5 py-4 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            {tr('You are browsing as a guest. Sign in to keep your tracker synced across devices.', 'तपाईं गेस्ट मोडमा हुनुहुन्छ। ट्र्याकर सबै उपकरणमा सिंक गर्न साइन इन गर्नुहोस्।')}
          </p>
          {onOpenAuth && (
            <button onClick={onOpenAuth} className="h-10 px-4 rounded-full bg-ink text-white text-sm shrink-0 hover:bg-black transition">
              {tr('Sign in', 'साइन इन')}
            </button>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="bg-white rounded-[24px] shadow-soft py-14 px-6 text-center">
          <h2 className="font-display text-2xl font-semibold text-ink">{tr('Nothing tracked yet', 'अहिलेसम्म केही ट्र्याक गरिएको छैन')}</h2>
          <p className="mt-2 text-sm text-ink-soft max-w-sm mx-auto">
            {tr('Open a vacancy and tap “Track this application” to add it here.', 'कुनै विज्ञापन खोलेर “यो आवेदन ट्र्याक गर्नुहोस्” थिच्नुहोस्।')}
          </p>
        </div>
      ) : (
        <div className="flex gap-3.5 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
          {STAGES.map((name, k) => {
            const items = rows.filter((r) => r.k === k);
            return (
              <section key={name} aria-label={name} className="flex-[1_0_260px] snap-start bg-white/60 rounded-[24px] p-3 flex flex-col gap-2.5 min-h-[360px]">
                <div className="flex justify-between items-center px-1.5 py-1">
                  <span className="flex items-center gap-2 font-semibold text-sm text-ink">
                    <span className="w-2 h-2 rounded-full" style={{ background: DOTS[k] }} />
                    {name}
                  </span>
                  <span className="text-xs text-[#667085] bg-white px-2 py-0.5 rounded-full">{num(items.length, lang)}</span>
                </div>
                {items.map(({ a, v, dl }) => {
                  const done = k === 3;
                  const closed = !done && dl < 0;
                  const urgent = !done && dl >= 0 && dl <= 10;
                  const due = done
                    ? tr('Done', 'सम्पन्न')
                    : closed
                      ? tr('Closed', 'बन्द')
                      : Number.isFinite(dl)
                        ? tr(`${dl}d left`, `${num(dl, lang)} दिन`)
                        : tr('Open', 'खुला');
                  return (
                    <article key={a.id} className="bg-white rounded-[18px] p-3.5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgb(11_18_32/0.04),0_8px_20px_-12px_rgb(11_18_32/0.14)]">
                      <button
                        onClick={() => v && onSelectVacancy(v)}
                        className="text-left font-semibold text-sm leading-[1.35] text-ink hover:underline underline-offset-2"
                      >
                        {v ? (np && v.titleNp ? v.titleNp : v.title) : tr('Removed vacancy', 'हटाइएको विज्ञापन')}
                      </button>
                      <div className="text-xs text-[#667085]">{v?.shortOrg || v?.organization || ''}</div>
                      <div className="flex justify-between items-center gap-2">
                        <span
                          className="text-[11.5px] font-semibold px-[9px] py-1 rounded-full"
                          style={
                            done
                              ? { background: '#ecfdf5', color: '#047857' }
                              : closed
                                ? { background: '#eef2f6', color: '#667085' }
                                : urgent
                                  ? { background: '#ffe4e6', color: '#be123c' }
                                  : { background: '#f3f9fe', color: '#0b1220' }
                          }
                        >
                          {due}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => onRemoveApp(a.id)}
                            aria-label={tr('Remove', 'हटाउनुहोस्')}
                            className="w-8 h-8 rounded-full text-[#98a2b3] hover:text-[#be123c] hover:bg-[#fff1f2] flex items-center justify-center transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveTo(a, k - 1)}
                            disabled={k === 0}
                            aria-label={tr(`Move back to ${STAGES[Math.max(0, k - 1)]}`, `${STAGES[Math.max(0, k - 1)]} मा फर्काउनुहोस्`)}
                            className="w-8 h-8 rounded-full border border-[#e4e7ec] bg-white text-ink disabled:opacity-30 hover:bg-sky-50 transition"
                          >
                            ←
                          </button>
                          <button
                            onClick={() => moveTo(a, k + 1)}
                            disabled={k === 3}
                            aria-label={tr(`Move to ${STAGES[Math.min(3, k + 1)]}`, `${STAGES[Math.min(3, k + 1)]} मा सार्नुहोस्`)}
                            className="w-8 h-8 rounded-full bg-ink text-white disabled:opacity-30 hover:bg-black transition"
                          >
                            →
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
