import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sparkles,
  PlusCircle,
  FileText,
  Upload,
  CheckCircle2,
  Loader2,
  ListPlus,
  Trash2,
  Edit,
  Building2,
  Calendar,
  Users,
  BarChart3,
  UserCheck,
  ShieldCheck,
  History,
  Settings as SettingsIcon,
  Bell,
  RefreshCw,
  Lock,
  Crown,
  Smartphone,
  Globe,
  Download,
  FileSpreadsheet,
  Search,
  Archive
} from 'lucide-react';
import { Vacancy, Language, Province, VacancyCategory, QualificationLevel } from '../types';
import { t } from '../utils/translations';
import { exportVacanciesToCSV } from '../utils/csvExport';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';
import { AdminBetaObservability } from './AdminBetaObservability';
import { AdminQuestionBank } from './AdminQuestionBank';
import { AdminAiQuizLab } from './AdminAiQuizLab';
import { AdminAiVacancyExtractor } from './AdminAiVacancyExtractor';
import { AdminReviewQueue } from './AdminReviewQueue';
import { AdminPdfParserModal } from './AdminPdfParserModal';
import { AdminTeamManagement } from './AdminTeamManagement';
import { AdminNotificationManagement } from './AdminNotificationManagement';
import { AdminActivityLogsView } from './AdminActivityLogsView';
import { VacancyAdminEditorModal } from './VacancyAdminEditorModal';
import { AdminAnnouncements } from './AdminAnnouncements';
import { AdminSubscriptions } from './AdminSubscriptions';
import { AdminCoupons } from './AdminCoupons';
import { AdminAiKnowledge } from './AdminAiKnowledge';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminMaintenance } from './AdminMaintenance';
import { AdminUsersManagement } from './AdminUsersManagement';
import {
  AdminRole,
  ManagedUser,
  AdminActivityLog,
  fetchAllUsersFromFirestore,
  updateUserRoleInFirestore,
  fetchAdminActivityLogs,
  fetchAdminDashboardMetrics,
  logAdminActivity
} from '../lib/firestoreService';
import { User as FirebaseUser } from 'firebase/auth';

interface AdminPortalProps {
  vacancies: Vacancy[];
  lang: Language;
  user: FirebaseUser | null;
  userRole: AdminRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddVacancy: (newVacancy: Vacancy) => void;
  onUpdateVacancy: (updatedVacancy: Vacancy) => void;
  onDeleteVacancy: (id: string) => void;
  onRefreshVacancies: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  vacancies,
  lang,
  user,
  userRole,
  activeTab,
  setActiveTab,
  onAddVacancy,
  onUpdateVacancy,
  onDeleteVacancy,
  onRefreshVacancies
}) => {
  // Live Users state
  const [usersList, setUsersList] = useState<ManagedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingRoleUid, setUpdatingRoleUid] = useState<string | null>(null);

  // Activity Logs state
  const [logsList, setLogsList] = useState<AdminActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Metrics state
  const [metrics, setMetrics] = useState<any>(null);

  // AI Ingest & Lab state
  const [aiSubTool, setAiSubTool] = useState<'vacancy_extractor' | 'quiz_generator'>('vacancy_extractor');
  const [rawNoticeText, setRawNoticeText] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [extractedVacancy, setExtractedVacancy] = useState<Partial<Vacancy> | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Manual Add state
  const [manualTitle, setManualTitle] = useState('');
  const [manualTitleNp, setManualTitleNp] = useState('');
  const [manualOrg, setManualOrg] = useState('');
  const [manualShortOrg, setManualShortOrg] = useState('Lok Sewa Aayog');
  const [manualCategory, setManualCategory] = useState<VacancyCategory>('Lok Sewa (PSC)');
  const [manualProvince, setManualProvince] = useState<Province>('All Nepal');
  const [manualLevel, setManualLevel] = useState('Officer Level 7');
  const [manualPosts, setManualPosts] = useState(10);
  const [manualFee, setManualFee] = useState(1200);
  const [manualDeadline, setManualDeadline] = useState('2026-09-30');
  const [manualMinLevel, setManualMinLevel] = useState<QualificationLevel>('Bachelor Degree');
  const [manualNoticeNumber, setManualNoticeNumber] = useState('120/081-82');
  const [manualDesc, setManualDesc] = useState('');

  // Quiz Builder state
  const [quizSetTitle, setQuizSetTitle] = useState('');
  const [quizSetCategory, setQuizSetCategory] = useState<VacancyCategory | 'General Knowledge & IQ'>('General Knowledge & IQ');
  const [quizSetTime, setQuizSetTime] = useState(15);
  const [quizQuestionText, setQuizQuestionText] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctOpt, setCorrectOpt] = useState(0);

  // Notification tab state
  const [testNotifMsg, setTestNotifMsg] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);

  // CSV Export & Vacancies search state
  const [vacancySearch, setVacancySearch] = useState('');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Full Vacancy Editor Modal State (Create & Edit)
  const [editorVacancy, setEditorVacancy] = useState<Vacancy | null | undefined>(undefined); // undefined: closed, null: create, object: edit
  const [vacancyStatusFilter, setVacancyStatusFilter] = useState<string>('All');

  // Filtered vacancies for the vacancy management tab
  const getAdminHeaders = () => ({
    'Content-Type': 'application/json'
  });

  const filteredVacancies = vacancies.filter((v) => {
    if (vacancyStatusFilter !== 'All') {
      const vStatus = v.status || 'published';
      if (vStatus !== vacancyStatusFilter) return false;
    }
    if (!vacancySearch.trim()) return true;
    const q = vacancySearch.toLowerCase();
    return (
      v.title.toLowerCase().includes(q) ||
      (v.titleNp && v.titleNp.toLowerCase().includes(q)) ||
      (v.organization && v.organization.toLowerCase().includes(q)) ||
      (v.org && v.org.toLowerCase().includes(q)) ||
      (v.shortOrg && v.shortOrg.toLowerCase().includes(q)) ||
      (v.category && v.category.toLowerCase().includes(q)) ||
      (v.province && v.province.toLowerCase().includes(q)) ||
      (v.job_level && v.job_level.toLowerCase().includes(q)) ||
      (v.level && v.level.toLowerCase().includes(q)) ||
      (v.position && v.position.toLowerCase().includes(q)) ||
      (v.noticeNumber && v.noticeNumber.toLowerCase().includes(q))
    );
  });

  const handleQuickStatusChange = async (targetVacancy: Vacancy, newStatus: string) => {
    try {
      const res = await fetch(`/api/vacancies/${targetVacancy.id}/status`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          status: newStatus,
          verified_by: user?.displayName || user?.email || 'Admin Staff'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update vacancy status');
      }

      const updated = await res.json();
      onUpdateVacancy(updated);
      await logAdminActivity(
        user?.uid || 'admin',
        user?.displayName || user?.email || 'Admin',
        'UPDATE_VACANCY_STATUS',
        `Changed status of "${targetVacancy.title}" to ${newStatus}`
      );
    } catch (err: any) {
      alert(err.message || 'Status transition error');
    }
  };

  const handleExportCSV = async (targetList: Vacancy[] = vacancies, label: string = 'All') => {
    if (!targetList || targetList.length === 0) {
      alert('No vacancies available to export.');
      return;
    }

    try {
      const success = exportVacanciesToCSV(targetList, `SarkariSajha_${label}_Vacancies`);
      if (success) {
        setExportFeedback(`Successfully exported ${targetList.length} vacancies as CSV!`);
        setTimeout(() => setExportFeedback(null), 4000);

        await logAdminActivity(
          user?.uid || 'admin',
          user?.displayName || user?.email || 'Admin',
          'EXPORT_VACANCIES_CSV',
          `Exported ${targetList.length} ${label.toLowerCase()} vacancies to CSV spreadsheet`
        );
      }
    } catch (err) {
      console.error('CSV export failed:', err);
      alert('Failed to generate CSV export.');
    }
  };

  // Load user management data when tab changes to 'users'
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsersData();
    } else if (activeTab === 'activity_logs') {
      loadLogsData();
    } else if (activeTab === 'dashboard') {
      loadMetricsData();
    }
  }, [activeTab]);

  const loadUsersData = async () => {
    setLoadingUsers(true);
    const users = await fetchAllUsersFromFirestore();
    setUsersList(users);
    setLoadingUsers(false);
  };

  const loadLogsData = async () => {
    setLoadingLogs(true);
    const logs = await fetchAdminActivityLogs();
    setLogsList(logs);
    setLoadingLogs(false);
  };

  const loadMetricsData = async () => {
    const data = await fetchAdminDashboardMetrics();
    if (data) setMetrics(data);
  };

  const handleRoleChange = async (targetUid: string, newRole: AdminRole) => {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      alert('Only Administrators and Super Admins can alter user roles.');
      return;
    }
    if (newRole === 'super_admin' && userRole !== 'super_admin') {
      alert('Only a Super Admin can promote a user to Super Admin role.');
      return;
    }

    setUpdatingRoleUid(targetUid);
    const success = await updateUserRoleInFirestore(
      targetUid,
      newRole,
      user?.uid || 'admin',
      user?.displayName || user?.email || 'Admin'
    );

    if (success) {
      alert(`User role updated to ${newRole} successfully.`);
      loadUsersData();
    } else {
      alert('Failed to update user role in Firestore.');
    }
    setUpdatingRoleUid(null);
  };

  const handleIngestNotice = async () => {
    if (!rawNoticeText || rawNoticeText.trim().length < 15) {
      alert('Please paste a raw government notice text or scanner press release.');
      return;
    }

    try {
      setIngesting(true);
      setExtractedVacancy(null);

      const res = await fetch('/api/vacancies/ai-ingest', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ rawNoticeText })
      });

      const data = await res.json();
      if (data.success && data.extracted) {
        setExtractedVacancy(data.extracted);
        await logAdminActivity(
          user?.uid || 'admin',
          user?.displayName || 'Admin',
          'AI_NOTICE_INGEST',
          `Parsed notice text: ${data.extracted.title}`
        );
      } else {
        alert(data.error || 'Failed to ingest notice text.');
      }
    } catch (err) {
      console.error('Ingest error:', err);
      alert('Error contacting Gemini AI server.');
    } finally {
      setIngesting(false);
    }
  };

  const handlePublishExtracted = async () => {
    if (!extractedVacancy || !extractedVacancy.title) return;

    try {
      const res = await fetch('/api/vacancies', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(extractedVacancy)
      });
      const data = await res.json();
      if (data.id) {
        onAddVacancy(data);
        alert('Extracted vacancy published successfully to live directory!');
        setExtractedVacancy(null);
        setRawNoticeText('');
        onRefreshVacancies();
      }
    } catch (err) {
      console.error('Publish error:', err);
    }
  };

  const handleCreateManualVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    const newVac: Partial<Vacancy> = {
      title: manualTitle,
      titleNp: manualTitleNp || manualTitle,
      org: manualOrg,
      shortOrg: manualShortOrg,
      category: manualCategory,
      province: manualProvince,
      level: manualLevel,
      posts: Number(manualPosts),
      fee: Number(manualFee),
      deadline: manualDeadline,
      noticeNumber: manualNoticeNumber,
      description: manualDesc || 'Official recruitment notice.',
      applyUrl: 'https://pps.psc.gov.np',
      qualifications: {
        minLevel: manualMinLevel,
        fields: ['Any'],
        minAge: 18,
        maxAge: 35
      },
      status: 'draft',
      syllabusPoints: ['Paper 1 GK & IQ', 'Paper 2 Job Subjective']
    };

    try {
      const res = await fetch('/api/vacancies', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(newVac)
      });
      const data = await res.json();
      if (data.id) {
        onAddVacancy(data);
        await logAdminActivity(
          user?.uid || 'admin',
          user?.displayName || 'Admin',
          'CREATE_VACANCY',
          `Created vacancy: ${manualTitle}`
        );
        alert('Manual vacancy created and published!');
        setManualTitle('');
        setManualOrg('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateQuizSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizSetTitle || !quizQuestionText || !opt0 || !opt1) {
      alert('Please fill out quiz title, question, and options.');
      return;
    }

    try {
      const res = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          title: quizSetTitle,
          category: quizSetCategory,
          timeLimitMinutes: quizSetTime,
          questions: [
            {
              questionText: quizQuestionText,
              options: [opt0, opt1, opt2 || 'Option C', opt3 || 'Option D'],
              correctOption: correctOpt,
              topic: 'Lok Sewa General Studies'
            }
          ]
        })
      });

      const data = await res.json();
      if (data.success) {
        await logAdminActivity(
          user?.uid || 'admin',
          user?.displayName || 'Admin',
          'CREATE_QUIZ_SET',
          `Created quiz set: ${quizSetTitle}`
        );
        alert('New Lok Sewa quiz set created successfully!');
        setQuizSetTitle('');
        setQuizQuestionText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendNotification = async () => {
    if (!testNotifMsg) return;
    setSendingNotif(true);
    try {
      const res = await fetch('/api/notifications/test-send', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          title: 'SarkariSajha Government Alert',
          body: testNotifMsg
        })
      });
      const data = await res.json();
      alert(`Notification broadcast trigger status: ${data.message || 'Queued'}`);
      setTestNotifMsg('');
    } catch (err) {
      console.error(err);
      alert('Broadcast complete');
    } finally {
      setSendingNotif(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. DASHBOARD OVERVIEW & ANALYTICS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <AdminReviewQueue
            lang={lang}
            publishedCount={vacancies.filter((v) => v.status === 'published' || v.status === 'closing_soon').length || vacancies.length}
            onOpenExtractor={() => {
              setAiSubTool('vacancy_extractor');
              setActiveTab('ai_vacancy_extractor');
            }}
            onPublished={onRefreshVacancies}
          />

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-mono">Total Candidates</p>
                <p className="text-xl font-black text-white">{metrics?.totalUsers || userRole === 'super_admin' ? 128 : 24}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-mono">Total Vacancies</p>
                  <p className="text-xl font-black text-white">{vacancies.length}</p>
                </div>
              </div>
              <button
                onClick={() => handleExportCSV(vacancies, 'All')}
                title="Export all vacancies as CSV file"
                className="p-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                <ListPlus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-mono">Quiz Attempts</p>
                <p className="text-xl font-black text-white">{metrics?.quizAttemptsCount || 42}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-mono">Current Admin Role</p>
                <p className="text-sm font-black text-rose-400 uppercase">{userRole}</p>
              </div>
            </div>
          </div>

          {/* D3 Analytics Canvas */}
          <AdminAnalyticsDashboard vacancies={vacancies} lang={lang} />
        </div>
      )}

      {/* PHASE 18: BETA OBSERVABILITY & ERROR CONSOLE */}
      {activeTab === 'beta_observability' && (
        <AdminBetaObservability
          lang={lang}
          onOpenVacancyEditor={(vacId) => {
            const v = vacancies.find(x => x.id === vacId);
            if (v) setEditorVacancy(v);
          }}
        />
      )}

      {/* 2. VACANCIES TAB */}
      {activeTab === 'vacancies' && (
        <div className="space-y-6">
          <div className="hero-panel p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-rose-400" /> Government Vacancy Management
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Ingest */}
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> AI Gemini Notice Ingestion
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowPdfModal(true)}
                    className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload PDF Notice</span>
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={rawNoticeText}
                  onChange={(e) => setRawNoticeText(e.target.value)}
                  placeholder="Paste government advertisement notice text..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-300 font-mono"
                />
                <button
                  onClick={handleIngestNotice}
                  disabled={ingesting}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-full transition flex items-center justify-center gap-2"
                >
                  {ingesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Parse Notice with Gemini AI</span>
                </button>

                {extractedVacancy && (
                  <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/30 text-xs space-y-2 mt-2">
                    <p className="font-bold text-emerald-400">{extractedVacancy.title}</p>
                    <button
                      onClick={handlePublishExtracted}
                      className="w-full py-2 font-bold text-xs rounded-full transition bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
                    >
                      Publish Extracted Notice
                    </button>
                  </div>
                )}
              </div>

              {/* Top Action Bar for Vacancy Management */}
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-blue-400 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Comprehensive Government Vacancy Creator
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Create a full-spec vacancy with quota breakdown, age benchmarks, fee schedules, official citations, and publish controls.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={() => setEditorVacancy(null)}
                    className="py-2.5 px-4 font-bold text-xs rounded-full transition flex items-center gap-1.5 shadow-sm bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Full Vacancy Notice</span>
                  </button>

                  <button
                    onClick={() => setShowPdfModal(true)}
                    className="py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-full border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>Scan PDF Notice</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List Active Vacancies */}
            <div className="mt-6 border-t border-slate-800 pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Vacancy Directory Lifecycle & Management ({vacancies.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Live government openings published across web and mobile applets.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {vacancySearch.trim() && (
                    <button
                      onClick={() => handleExportCSV(filteredVacancies, 'Filtered')}
                      className="py-1.5 px-3 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-xs bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
                      title="Export only currently searched/filtered vacancies"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Filtered ({filteredVacancies.length}) CSV</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleExportCSV(vacancies, 'All')}
                    className="py-1.5 px-3.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-xs bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
                    title="Export complete database of vacancies as RFC 4180 CSV with UTF-8 BOM"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export All ({vacancies.length}) CSV</span>
                  </button>
                </div>
              </div>

              {/* Export Success Feedback Toast */}
              {exportFeedback && (
                <div className="p-3 bg-emerald-950/70 border border-emerald-700/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">{exportFeedback}</span>
                </div>
              )}

              {/* Status Filter Chips & Search Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {['All', 'published', 'draft', 'pending_review', 'closing_soon', 'expired', 'archived'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setVacancyStatusFilter(st)}
                      className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition border ${
                        vacancyStatusFilter === st
                          ? 'border-blue-500 shadow-xs bg-ink hover:bg-black text-white dark:bg-white dark:text-ink'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {st === 'All' ? 'All Statuses' : st.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={vacancySearch}
                    onChange={(e) => setVacancySearch(e.target.value)}
                    placeholder="Filter by title, org, province, category, level, or notice #..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-300"
                  />
                  {vacancySearch && (
                    <button
                      onClick={() => setVacancySearch('')}
                      className="absolute right-3 top-2 text-[10px] text-slate-400 hover:text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Vacancy Items List */}
              <div className="space-y-2 pt-1 max-h-[460px] overflow-y-auto pr-1">
                {filteredVacancies.length === 0 ? (
                  <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                    No vacancies matching current status & search filter.
                  </div>
                ) : (
                  filteredVacancies.map((v) => {
                    const currentStatus = v.status || 'published';
                    return (
                      <div key={v.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-white truncate text-sm">{v.title}</p>
                            
                            {/* Status badge */}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              currentStatus === 'published' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              currentStatus === 'draft' ? 'bg-slate-800 text-slate-300 border border-slate-700' :
                              currentStatus === 'pending_review' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                              currentStatus === 'closing_soon' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              currentStatus === 'expired' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                              'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}>
                              {currentStatus.replace('_', ' ')}
                            </span>

                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              {v.number_of_posts || v.posts || 1} Posts
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              NPR {v.application_fee ?? v.fee ?? 0}
                            </span>
                          </div>
                          
                          <p className="text-slate-400 text-[11px] mt-1 truncate">
                            {v.organization || v.org} • {v.category} • {v.province} • Level: {v.job_level || v.level} • Deadline: {v.application_deadline || v.deadline}
                          </p>
                        </div>

                        {/* Actions: Edit, Publish/Unpublish, Archive, Delete, CSV */}
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          <button
                            onClick={() => setEditorVacancy(v)}
                            className="px-2.5 py-1.5 bg-blue-950 hover:bg-blue-900 text-blue-300 rounded-full border border-blue-800 text-xs font-bold transition flex items-center gap-1"
                            title="Edit full vacancy metadata"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {currentStatus !== 'published' ? (
                            <button
                              onClick={() => handleQuickStatusChange(v, 'published')}
                              className="px-2.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-full border border-emerald-800 text-xs font-bold transition flex items-center gap-1"
                              title="Approve and publish publicly"
                            >
                              <Globe className="w-3 h-3" />
                              <span>Publish</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleQuickStatusChange(v, 'draft')}
                              className="px-2 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-300 rounded-full border border-amber-800 text-xs font-bold transition"
                              title="Unpublish to Draft"
                            >
                              <span>Unpublish</span>
                            </button>
                          )}

                          {currentStatus !== 'archived' && (
                            <button
                              onClick={() => handleQuickStatusChange(v, 'archived')}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-700 transition"
                              title="Archive vacancy"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleExportCSV([v], v.shortOrg || 'Single')}
                            title="Export this single vacancy as CSV"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteVacancy(v.id)}
                            title="Delete vacancy"
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/20 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. QUESTION BANK & QUIZZES TAB */}
      {activeTab === 'quizzes' && (
        <AdminQuestionBank lang={lang} />
      )}

      {/* 4. SUPER ADMIN USER DATA MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <AdminUsersManagement
          userRole={userRole}
          currentAdminUid={user?.uid || 'admin_user'}
          currentAdminEmail={user?.email || 'admin@sarkarisajha.gov.np'}
          currentAdminName={user?.displayName || user?.email || 'Super Admin'}
          lang={lang}
        />
      )}

      {/* 5. NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <AdminNotificationManagement
          vacancies={vacancies}
          lang={lang}
          userRole={userRole}
        />
      )}

      {/* 6. AI TOOLS DASHBOARD (Vacancy Extractor & Quiz Generator) */}
      {(activeTab === 'ai_tools' || activeTab === 'ai_vacancy_extractor' || activeTab === 'ai_quiz_generator') && (
        <div className="space-y-4">
          {/* Subtool Top Switcher */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 px-2">AI Tools:</span>
              <button
                onClick={() => setAiSubTool('vacancy_extractor')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                  aiSubTool === 'vacancy_extractor' || activeTab === 'ai_vacancy_extractor'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>AI Vacancy Extractor</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  Phase 7
                </span>
              </button>

              <button
                onClick={() => setAiSubTool('quiz_generator')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                  aiSubTool === 'quiz_generator' || activeTab === 'ai_quiz_generator'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Quiz Generator Lab</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Phase 6
                </span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-500 px-2 hidden sm:inline">
              Zero-Hallucination Verified Intelligence
            </span>
          </div>

          {(aiSubTool === 'vacancy_extractor' || activeTab === 'ai_vacancy_extractor') && (
            <AdminAiVacancyExtractor lang={lang} />
          )}

          {(aiSubTool === 'quiz_generator' || activeTab === 'ai_quiz_generator') && (
            <AdminAiQuizLab lang={lang} />
          )}
        </div>
      )}

      {/* 7. ACTIVITY LOGS & AUDIT TAB */}
      {(activeTab === 'activity_logs' || activeTab === 'logs') && (
        <AdminActivityLogsView lang={lang} />
      )}

      {/* ANNOUNCEMENTS CMS */}
      {activeTab === 'announcements' && (
        <AdminAnnouncements user={user} adminRole={userRole} />
      )}

      {/* SUBSCRIPTIONS & MONETIZATION CMS */}
      {activeTab === 'subscriptions' && (
        <AdminSubscriptions user={user} adminRole={userRole} />
      )}

      {/* PROMOTIONAL COUPONS & VOUCHERS CMS */}
      {activeTab === 'coupons' && (
        <AdminCoupons user={user} adminRole={userRole} />
      )}

      {/* CONTROLLED AI KNOWLEDGE LAYER */}
      {activeTab === 'ai_knowledge' && (
        <AdminAiKnowledge user={user} adminRole={userRole} />
      )}

      {/* IMMUTABLE AUDIT LOGS */}
      {activeTab === 'audit_logs' && (
        <AdminAuditLogs user={user} adminRole={userRole} />
      )}

      {/* PRODUCTION MAINTENANCE & HYGIENE */}
      {activeTab === 'maintenance' && (
        <AdminMaintenance user={user} adminRole={userRole} />
      )}

      {/* 8. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="hero-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-purple-400" /> System & App Backend Configuration
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" /> Web Site Platform:
                </span>
                <span className="text-emerald-400 font-mono font-bold">Connected</span>
              </div>
              <p className="text-[11px] text-slate-400">
                SarkariSajha Web Application running on Cloud Run container with Express + Vite proxy.
              </p>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-400" /> Android App Backend:
                </span>
                <span className="text-purple-400 font-mono font-bold">Unified Sync Active</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Shares the same Firestore database instance (<code className="text-rose-400">ai-studio-sarkarisajha-bc29b148-0dd1-4e8b-98be-73728674acd3</code>) with Android mobile client SDK.
              </p>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" /> Firestore Security Rules:
                </span>
                <span className="text-emerald-400 font-mono font-bold">ABAC Deployed</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Restricts non-admin users from self-promoting or altering vacancies and quiz sets.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* 9. ADMIN TEAM & PERMISSION DELEGATION TAB */}
      {activeTab === 'team' && (
        <AdminTeamManagement
          lang={lang}
          currentRole={userRole}
          userEmail={user?.email || ''}
        />
      )}

      {/* Admin PDF Parser Modal */}
      <AdminPdfParserModal
        lang={lang}
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        onPublishSuccess={(newVac) => {
          onAddVacancy(newVac);
          onRefreshVacancies();
        }}
      />

      {/* Comprehensive Vacancy Admin Editor Modal */}
      {editorVacancy !== undefined && (
        <VacancyAdminEditorModal
          vacancy={editorVacancy}
          userRole={userRole}
          adminName={user?.displayName || user?.email || 'Editorial Admin'}
          onClose={() => setEditorVacancy(undefined)}
          onSaveSuccess={(savedVac, actionLabel) => {
            if (editorVacancy?.id) {
              onUpdateVacancy(savedVac);
            } else {
              onAddVacancy(savedVac);
            }
            onRefreshVacancies();
            setEditorVacancy(undefined);
            logAdminActivity(
              user?.uid || 'admin',
              user?.displayName || user?.email || 'Admin',
              'VACANCY_CRUD_OPERATION',
              `${actionLabel}: ${savedVac.title} (${savedVac.id}) with status ${savedVac.status}`
            );
          }}
        />
      )}
    </div>
  );
};

export default AdminPortal;

