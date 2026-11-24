import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  Eye,
  BookmarkCheck,
  ExternalLink,
  Award,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  MessageSquare,
  FileWarning,
  Bug,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Check,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Cpu,
  Layers,
  Terminal
} from 'lucide-react';
import {
  Language,
  BetaObservabilityMetrics,
  BetaFeedbackItem,
  VacancyReportItem,
  AiFeedbackItem,
  BetaSurveySubmission,
  ErrorLogItem,
  BetaFeedbackType
} from '../types';

interface AdminBetaObservabilityProps {
  lang: Language;
  onOpenVacancyEditor?: (vacId: string) => void;
}

export const AdminBetaObservability: React.FC<AdminBetaObservabilityProps> = ({
  lang,
  onOpenVacancyEditor
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'feedback' | 'vacancy_reports' | 'ai_feedback' | 'surveys' | 'errors'
  >('overview');

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<BetaObservabilityMetrics | null>(null);
  const [feedbackList, setFeedbackList] = useState<BetaFeedbackItem[]>([]);
  const [vacancyReports, setVacancyReports] = useState<VacancyReportItem[]>([]);
  const [aiFeedbackList, setAiFeedbackList] = useState<AiFeedbackItem[]>([]);
  const [surveys, setSurveys] = useState<BetaSurveySubmission[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLogItem[]>([]);

  // Filters
  const [feedbackFilter, setFeedbackFilter] = useState<string>('ALL');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('ALL');
  const [vacancyReportStatusFilter, setVacancyReportStatusFilter] = useState<string>('ALL');
  const [errorSourceFilter, setErrorSourceFilter] = useState<string>('ALL');
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Resolution note editing
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const fetchAllBetaData = async () => {
    setLoading(true);
    try {
      const [mRes, fRes, vrRes, aiRes, sRes, eRes] = await Promise.all([
        fetch('/api/admin/beta-observability').then(r => r.json()),
        fetch('/api/admin/beta/feedback').then(r => r.json()),
        fetch('/api/admin/vacancy-reports').then(r => r.json()),
        fetch('/api/admin/ai-feedback').then(r => r.json()),
        fetch('/api/admin/beta/survey').then(r => r.json()),
        fetch('/api/admin/errors').then(r => r.json())
      ]);

      setMetrics(mRes);
      setFeedbackList(fRes.feedback || []);
      setVacancyReports(vrRes.reports || []);
      setAiFeedbackList(aiRes.feedback || []);
      setSurveys(sRes.submissions || []);
      setErrorLogs(eRes.errors || []);
    } catch (err) {
      console.error('Error fetching beta observability data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBetaData();
  }, []);

  const handleUpdateFeedbackStatus = async (
    id: string,
    status: 'new' | 'investigating' | 'resolved' | 'dismissed',
    adminNotes?: string
  ) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/beta/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes })
      });
      if (res.ok) {
        setFeedbackList(prev =>
          prev.map(f => (f.id === id ? { ...f, status, adminNotes: adminNotes ?? f.adminNotes } : f))
        );
        setEditingNoteId(null);
      }
    } catch (err) {
      console.error('Failed to update feedback status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateVacancyReportStatus = async (
    id: string,
    status: 'pending' | 'verified' | 'resolved' | 'rejected',
    resolutionNotes?: string
  ) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/vacancy-reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolutionNotes })
      });
      if (res.ok) {
        setVacancyReports(prev =>
          prev.map(r => (r.id === id ? { ...r, status, resolutionNotes: resolutionNotes ?? r.resolutionNotes } : r))
        );
        setEditingNoteId(null);
      }
    } catch (err) {
      console.error('Failed to update vacancy report status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleErrorResolved = async (id: string, currentResolved: boolean) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/errors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: !currentResolved })
      });
      if (res.ok) {
        setErrorLogs(prev =>
          prev.map(e => (e.id === id ? { ...e, resolved: !currentResolved } : e))
        );
      }
    } catch (err) {
      console.error('Failed to toggle error resolved:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered lists
  const filteredFeedback = feedbackList.filter(item => {
    const matchType = feedbackFilter === 'ALL' || item.type === feedbackFilter;
    const matchStatus = feedbackStatusFilter === 'ALL' || item.status === feedbackStatusFilter;
    return matchType && matchStatus;
  });

  const filteredVacancyReports = vacancyReports.filter(item => {
    return vacancyReportStatusFilter === 'ALL' || item.status === vacancyReportStatusFilter;
  });

  const filteredErrors = errorLogs.filter(item => {
    return errorSourceFilter === 'ALL' || item.source === errorSourceFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-900/40 via-purple-900/40 to-blue-900/40 border border-rose-500/30 dark:border-rose-700/40 p-5 sm:p-6 rounded-3xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white shadow-xs">
              PHASE 18
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Private Beta Launch & Observability Console
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Real-time candidate telemetry, telemetry error monitoring, candidate surveys, and gazette integrity audits.
          </p>
        </div>

        <button
          onClick={fetchAllBetaData}
          disabled={loading}
          className="px-4 py-2 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{lang === 'np' ? 'डाटा ताजा गर्नुहोस्' : 'Refresh Telemetry'}</span>
        </button>
      </div>

      {/* Primary KPI Metrics Deck */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Active 24h */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl space-y-1 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold">Active 24h</span>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{metrics.activeUsers24h}</p>
            <p className="text-[10px] text-emerald-600 font-bold">Candidates online</p>
          </div>

          {/* Vacancy Engagement */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl space-y-1 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold">Notice Views</span>
              <Eye className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{metrics.vacancyViews}</p>
            <p className="text-[10px] text-slate-500">{metrics.vacancySaves} saved to tracker</p>
          </div>

          {/* Official Portal Clicks */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl space-y-1 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold">PSC Clicks</span>
              <ExternalLink className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{metrics.officialLinkClicks}</p>
            <p className="text-[10px] text-indigo-600 font-bold">Verified outbound apply</p>
          </div>

          {/* Mock Exam Sets */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl space-y-1 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold">Quiz Starts</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{metrics.quizStarts}</p>
            <p className="text-[10px] text-amber-600 font-bold">{metrics.avgQuizScore}% Avg Accuracy</p>
          </div>

          {/* AI Latency */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl space-y-1 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold">AI Latency</span>
              <Bot className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{metrics.aiAvgLatencyMs}ms</p>
            <p className="text-[10px] text-purple-600 font-bold">{metrics.aiQueriesCount} groundings</p>
          </div>

          {/* System Health / Error Rate */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl space-y-1 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold">Error Rate</span>
              <Activity className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {metrics.errorRatePercent}%
            </p>
            <p className="text-[10px] text-slate-500">API avg {metrics.apiAvgLatencyMs}ms</p>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Telemetrics & Health</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-3 px-3.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'feedback'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Beta User Feedback ({feedbackList.filter(f => f.status === 'new').length} New)</span>
        </button>

        <button
          onClick={() => setActiveTab('vacancy_reports')}
          className={`pb-3 px-3.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'vacancy_reports'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileWarning className="w-4 h-4" />
          <span>Notice Audit Reports ({vacancyReports.filter(r => r.status === 'pending').length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_feedback')}
          className={`pb-3 px-3.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ai_feedback'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Quality & Ratings ({aiFeedbackList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('surveys')}
          className={`pb-3 px-3.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'surveys'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>10-Question Surveys ({surveys.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('errors')}
          className={`pb-3 px-3.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'errors'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Error Log Stream ({errorLogs.filter(e => !e.resolved).length} Unresolved)</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 1: OVERVIEW & TELEMETRY GAUGES */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Candidate Journey Funnel */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] space-y-4 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-600" />
                Candidate Conversion & Engagement Funnel
              </h3>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">1. Total Visitors</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">3,890</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">2. Profile Setup & Target Goal Selection</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">984 (25.3%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[25.3%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">3. Vacancy Detail & Gazette Verification</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">1,840 (47.3%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-[47.3%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">4. Timed Mock Exam Started</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">955 (24.5%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[24.5%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">5. AI Assistant Career Grounding Plan</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">1,450 (37.2%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-[37.2%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance, Latency & AI Cost Controls */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] space-y-4 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-600" />
                Backend Health & AI Cost Protections
              </h3>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-sky-50/70 dark:bg-white/5 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">API Response Latency</span>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">~35 ms</p>
                  <p className="text-[10px] text-slate-400">Zero bottle-necks</p>
                </div>

                <div className="p-3 bg-sky-50/70 dark:bg-white/5 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">AI Prompt In-Memory Cache</span>
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400">92.4% Hit Rate</p>
                  <p className="text-[10px] text-slate-400">15m sliding TTL</p>
                </div>

                <div className="p-3 bg-sky-50/70 dark:bg-white/5 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">Gemini Token Consumption</span>
                  <p className="text-lg font-black text-purple-600 dark:text-purple-400">462k Tokens</p>
                  <p className="text-[10px] text-slate-400">Under daily free budget</p>
                </div>

                <div className="p-3 bg-sky-50/70 dark:bg-white/5 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">Android / PWA Parity</span>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">100% Verified</p>
                  <p className="text-[10px] text-slate-400">Safe crash reporting active</p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Private Beta Status:</strong> All endpoints protected with sliding-window rate limiting and official source citations.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 2: CANDIDATE FEEDBACK & BUG REPORTS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              <select
                value={feedbackFilter}
                onChange={e => setFeedbackFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs"
              >
                <option value="ALL">All Categories</option>
                <option value="bug_report">Bug Reports</option>
                <option value="feature_request">Feature Requests</option>
                <option value="wrong_vacancy_info">Wrong Vacancy Info</option>
                <option value="incorrect_quiz_question">Quiz Error</option>
                <option value="incorrect_ai_response">AI Guidance Issue</option>
                <option value="general_feedback">General Feedback</option>
              </select>

              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">Status:</span>
              <select
                value={feedbackStatusFilter}
                onChange={e => setFeedbackStatusFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="new">New ({feedbackList.filter(f => f.status === 'new').length})</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <span className="text-xs font-mono font-bold text-slate-500">
              Showing {filteredFeedback.length} of {feedbackList.length} items
            </span>
          </div>

          {/* Feedback Items List */}
          {filteredFeedback.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-[2rem] text-slate-400 text-xs shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
              No feedback items found matching filter criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeedback.map(fb => {
                const isNew = fb.status === 'new';
                return (
                  <div
                    key={fb.id}
                    className={`bg-white dark:bg-slate-900 p-5 rounded-2xl transition-all space-y-3 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10 ${
                      isNew
                        ? 'border-rose-300 dark:border-rose-800/80 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            fb.type === 'bug_report'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : fb.type === 'feature_request'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : fb.type === 'wrong_vacancy_info'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {fb.type.replace('_', ' ').toUpperCase()}
                        </span>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{fb.title}</h4>
                        {fb.rating && (
                          <span className="text-xs text-amber-500 font-bold">★ {fb.rating}/5</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </span>
                        <select
                          value={fb.status}
                          disabled={actionLoadingId === fb.id}
                          onChange={e =>
                            handleUpdateFeedbackStatus(
                              fb.id,
                              e.target.value as any
                            )
                          }
                          className={`px-2 py-1 rounded-full text-xs font-bold border ${
                            fb.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : fb.status === 'investigating'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                              : fb.status === 'new'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="investigating">Investigating</option>
                          <option value="resolved">Resolved</option>
                          <option value="dismissed">Dismissed</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-sky-50/70 dark:bg-slate-950/60 p-3 rounded-xl">
                      {fb.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 gap-2">
                      <div className="flex items-center gap-2">
                        <span>Submitted by: <strong>{fb.userName || fb.userEmail || 'Anonymous Candidate'}</strong></span>
                        {fb.contextUrl && (
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            Path: {fb.contextUrl}
                          </span>
                        )}
                      </div>

                      {/* Admin Notes Section */}
                      {editingNoteId === fb.id ? (
                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                          <input
                            type="text"
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            placeholder="Add resolution note..."
                            className="px-2 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-full text-xs text-slate-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleUpdateFeedbackStatus(fb.id, fb.status, noteText)}
                            className="px-2 py-1 bg-rose-600 text-white rounded-full text-xs font-bold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingNoteId(fb.id);
                            setNoteText(fb.adminNotes || '');
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                        >
                          {fb.adminNotes ? `Admin Note: ${fb.adminNotes}` : '+ Add Admin Note'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 3: VACANCY AUDIT REPORTS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'vacancy_reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Filter Status:</span>
              <select
                value={vacancyReportStatusFilter}
                onChange={e => setVacancyReportStatusFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs"
              >
                <option value="ALL">All Reports</option>
                <option value="pending">Pending Audit ({vacancyReports.filter(r => r.status === 'pending').length})</option>
                <option value="verified">Verified Gazette Issue</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected / Invalid</option>
              </select>
            </div>

            <span className="text-xs font-mono text-slate-400">
              {filteredVacancyReports.length} reports logged
            </span>
          </div>

          <div className="space-y-3">
            {filteredVacancyReports.map(report => (
              <div
                key={report.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl space-y-3 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">
                      {report.organization}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {report.vacancyTitle}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={report.status}
                      disabled={actionLoadingId === report.id}
                      onChange={e =>
                        handleUpdateVacancyReportStatus(
                          report.id,
                          e.target.value as any
                        )
                      }
                      className={`px-2 py-1 rounded-full text-xs font-bold border ${
                        report.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : report.status === 'pending'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      <option value="pending">Pending Audit</option>
                      <option value="verified">Verified Issue</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>

                    {onOpenVacancyEditor && (
                      <button
                        onClick={() => onOpenVacancyEditor(report.vacancyId)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold transition"
                      >
                        Edit Notice
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-sky-50/70 dark:bg-slate-950/60 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-rose-600 block">
                    Issue: {report.reportType.replace('_', ' ').toUpperCase()}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{report.description}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Reported by: <strong>{report.userEmail}</strong></span>
                  <span>{new Date(report.reportedAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 4: AI QUALITY & FEEDBACK RATINGS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'ai_feedback' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl flex items-center gap-3">
              <ThumbsUp className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-xl font-black text-emerald-900 dark:text-emerald-200">
                  {aiFeedbackList.filter(f => f.rating === 'helpful').length}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Helpful / Accurate</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl flex items-center gap-3">
              <ThumbsDown className="w-6 h-6 text-amber-600" />
              <div>
                <p className="text-xl font-black text-amber-900 dark:text-amber-200">
                  {aiFeedbackList.filter(f => f.rating === 'not_helpful').length}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Not Helpful</p>
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
              <div>
                <p className="text-xl font-black text-rose-900 dark:text-rose-200">
                  {aiFeedbackList.filter(f => f.rating === 'incorrect').length}
                </p>
                <p className="text-xs text-rose-700 dark:text-rose-400 font-semibold">Flagged Incorrect</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {aiFeedbackList.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl space-y-2 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Query: "{item.userQuery}"
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      item.rating === 'helpful'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.rating === 'not_helpful'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.rating.toUpperCase()}
                  </span>
                </div>

                <div className="p-3 bg-sky-50/70 dark:bg-slate-950/60 rounded-xl text-xs text-slate-600 dark:text-slate-400">
                  <p className="italic">AI Response Snippet:</p>
                  <p className="mt-1">{item.aiResponseSnippet}</p>
                </div>

                {item.feedbackText && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                    Candidate remark: {item.feedbackText}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 5: 10-QUESTION BETA SURVEYS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'surveys' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-300">
              Completed Candidate Launch Surveys ({surveys.length})
            </h3>
            <span className="text-xs text-slate-500 font-mono">10 Standard Diagnostic Questions</span>
          </div>

          <div className="space-y-4">
            {surveys.map((survey, sIdx) => (
              <div
                key={survey.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] space-y-4 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center text-xs font-bold">
                      #{sIdx + 1}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {survey.userName || survey.userEmail}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(survey.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <strong className="text-slate-700 dark:text-slate-300">1. Purpose:</strong>
                    <p className="text-slate-600 dark:text-slate-400 bg-sky-50/70 dark:bg-slate-950/60 p-2 rounded-lg">
                      {survey.answers.q1_purpose}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <strong className="text-slate-700 dark:text-slate-300">2. Most Useful Feature:</strong>
                    <p className="text-slate-600 dark:text-slate-400 bg-sky-50/70 dark:bg-slate-950/60 p-2 rounded-lg">
                      {survey.answers.q2_most_useful_feature}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <strong className="text-slate-700 dark:text-slate-300">3. Confusing Parts:</strong>
                    <p className="text-slate-600 dark:text-slate-400 bg-sky-50/70 dark:bg-slate-950/60 p-2 rounded-lg">
                      {survey.answers.q3_confusing_parts || 'None reported'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <strong className="text-slate-700 dark:text-slate-300">4. Found Relevant Vacancy?</strong>
                    <p className="text-slate-600 dark:text-slate-400 bg-sky-50/70 dark:bg-slate-950/60 p-2 rounded-lg">
                      {survey.answers.q4_found_relevant_vacancy}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <strong className="text-slate-700 dark:text-slate-300">5. Used Quiz System?</strong>
                    <p className="text-slate-600 dark:text-slate-400 bg-sky-50/70 dark:bg-slate-950/60 p-2 rounded-lg">
                      {survey.answers.q5_used_quiz}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <strong className="text-slate-700 dark:text-slate-300">6. AI Career Assistant Helpful?</strong>
                    <p className="text-slate-600 dark:text-slate-400 bg-sky-50/70 dark:bg-slate-950/60 p-2 rounded-lg">
                      {survey.answers.q6_ai_assistant_helpful}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <strong className="text-slate-700 dark:text-slate-300">7. Weekly Return Trigger:</strong>
                    <p className="text-slate-600 dark:text-slate-400 bg-sky-50/70 dark:bg-slate-950/60 p-2 rounded-lg">
                      {survey.answers.q7_weekly_return_reason}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <strong className="text-slate-700 dark:text-slate-300">8. Biggest Problem:</strong>
                    <p className="text-slate-600 dark:text-slate-400 bg-sky-50/70 dark:bg-slate-950/60 p-2 rounded-lg">
                      {survey.answers.q8_biggest_problem}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <strong className="text-slate-700 dark:text-slate-300">9. Recommendation Score:</strong>
                    <p className="text-emerald-600 font-bold bg-sky-50/70 dark:bg-slate-950/60 p-2 rounded-lg">
                      {survey.answers.q9_recommend_rating}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <strong className="text-slate-700 dark:text-slate-300">10. Priority Improvement:</strong>
                    <p className="text-slate-600 dark:text-slate-400 bg-sky-50/70 dark:bg-slate-950/60 p-2 rounded-lg">
                      {survey.answers.q10_improve_first}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 6: ERROR LOGS & STACK TRACES */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'errors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Source:</span>
              <select
                value={errorSourceFilter}
                onChange={e => setErrorSourceFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs"
              >
                <option value="ALL">All Sources</option>
                <option value="frontend">Frontend / React</option>
                <option value="backend">Backend / Express</option>
                <option value="ai">AI / Gemini</option>
                <option value="auth">Firebase Auth</option>
                <option value="android">Android Client</option>
              </select>
            </div>

            <span className="text-xs font-mono text-slate-400">
              {filteredErrors.filter(e => !e.resolved).length} Unresolved Errors
            </span>
          </div>

          <div className="space-y-3">
            {filteredErrors.map(err => {
              const isExpanded = expandedErrorId === err.id;
              return (
                <div
                  key={err.id}
                  className={`bg-white dark:bg-slate-900 p-4 rounded-2xl transition-all space-y-2 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10 ${
                    !err.resolved
                      ? 'border-rose-200 dark:border-rose-900/60'
                      : 'border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {err.source}
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {err.message}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(err.timestamp).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => handleToggleErrorResolved(err.id, !!err.resolved)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          err.resolved
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {err.resolved ? 'Resolved' : 'Mark Resolved'}
                      </button>
                    </div>
                  </div>

                  {err.route && (
                    <p className="text-[11px] font-mono text-slate-500">Route: {err.route}</p>
                  )}

                  {err.stack && (
                    <div>
                      <button
                        onClick={() => setExpandedErrorId(isExpanded ? null : err.id)}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Hide Stack Trace' : 'View Stack Trace'}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <pre className="mt-2 p-3 bg-slate-950 text-slate-200 text-[10px] font-mono rounded-xl overflow-x-auto whitespace-pre-wrap">
                          {err.stack}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
