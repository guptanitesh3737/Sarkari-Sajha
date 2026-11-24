import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  Bookmark,
  Clock,
  Sparkles,
  Award,
  Bell,
  Eye,
  Settings,
  ChevronRight,
  Calendar,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Flame,
  Target,
  TrendingUp,
  Brain,
  Trash2,
  Edit3,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Crown,
  FileText,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Check,
  Sliders,
  Send,
  Zap
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Vacancy,
  UserProfile,
  QuizSet,
  QuizAttempt,
  NotificationLog,
  ApplicationTrack,
  ApplicationStatus,
  Language,
  DashboardSubTab,
  UserSubscription,
  TopicAccuracyStat,
  UserPreparationSummary
} from '../types';
import { t } from '../utils/translations';
import {
  getRecentlyViewed,
  clearRecentlyViewed,
  getClosingSoonVacancies,
  getRecommendedVacanciesForUser,
  getRecommendedQuizzes
} from '../utils/userDashboardUtils';
import {
  calculateUserPreparationSummary,
  toggleSavedVacancyInFirestore,
  updateUserProfileInFirestore
} from '../lib/firestoreService';
import { JobAlertsCenter } from './JobAlertsCenter';

interface DashboardProps {
  userProfile: UserProfile;
  firebaseUser: FirebaseUser | null;
  vacancies: Vacancy[];
  quizSets: QuizSet[];
  quizAttempts?: QuizAttempt[];
  applications: ApplicationTrack[];
  notifications: NotificationLog[];
  subscription?: UserSubscription;
  lang: Language;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenSubscription: () => void;
  onSelectVacancy: (vacancy: Vacancy) => void;
  onToggleBookmark?: (vacancy: Vacancy) => void;
  onToggleSaveVacancy?: (vacancyId: string) => void;
  onOpenSheetsSync?: () => void;
  onUpdateApplicationStatus?: (appId: string, status: ApplicationStatus, notes?: string, feePaid?: boolean) => void;
  onRemoveApplication?: (appId: string) => void;
  onStartQuiz?: (quizSetId: string) => void;
  onNavigateTab?: (tab: string) => void;
  onSendTestNotification?: (channel: 'sms' | 'email' | 'push') => void;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userProfile,
  firebaseUser,
  vacancies,
  quizSets,
  quizAttempts = [],
  applications,
  notifications,
  subscription,
  lang,
  onOpenAuth,
  onOpenProfile,
  onOpenSubscription,
  onSelectVacancy,
  onToggleBookmark,
  onToggleSaveVacancy,
  onUpdateApplicationStatus,
  onRemoveApplication,
  onStartQuiz,
  onNavigateTab,
  onSendTestNotification,
  onUpdateProfile
}) => {
  const [activeSubTab, setActiveSubTab] = useState<DashboardSubTab>('overview');
  const [savedSearchQuery, setSavedSearchQuery] = useState('');
  const [savedStatusFilter, setSavedStatusFilter] = useState<string>('All');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [preferencesSavedMessage, setPreferencesSavedMessage] = useState<string | null>(null);

  // Load recently viewed from localStorage
  useEffect(() => {
    const items = getRecentlyViewed();
    setRecentlyViewedIds(items.map(i => i.vacancyId));
  }, []);

  // Compute Saved Vacancies from applications
  const savedVacanciesMap = useMemo(() => {
    const map = new Map<string, ApplicationTrack>();
    applications.forEach(app => {
      map.set(app.vacancyId, app);
    });
    return map;
  }, [applications]);

  const savedVacanciesList = useMemo(() => {
    return vacancies
      .filter(v => savedVacanciesMap.has(v.id))
      .map(v => ({
        vacancy: v,
        appTrack: savedVacanciesMap.get(v.id)!
      }));
  }, [vacancies, savedVacanciesMap]);

  const filteredSavedVacancies = useMemo(() => {
    return savedVacanciesList.filter(item => {
      if (savedStatusFilter !== 'All' && item.appTrack.status !== savedStatusFilter) {
        return false;
      }
      if (savedSearchQuery.trim()) {
        const q = savedSearchQuery.toLowerCase().trim();
        const matchTitle = item.vacancy.title.toLowerCase().includes(q);
        const matchOrg = (item.vacancy.organization || item.vacancy.org || '').toLowerCase().includes(q);
        const matchNotes = (item.appTrack.notes || '').toLowerCase().includes(q);
        return matchTitle || matchOrg || matchNotes;
      }
      return true;
    });
  }, [savedVacanciesList, savedStatusFilter, savedSearchQuery]);

  // Compute Closing Soon Vacancies
  const closingSoonList = useMemo(() => {
    return getClosingSoonVacancies(vacancies, 30);
  }, [vacancies]);

  // Compute Recommended Vacancies
  const recommendedList = useMemo(() => {
    return getRecommendedVacanciesForUser(vacancies, userProfile);
  }, [vacancies, userProfile]);

  // Compute Preparation Summary (Streak, Accuracy, Weak Subjects)
  const prepSummary: UserPreparationSummary = useMemo(() => {
    return calculateUserPreparationSummary(quizAttempts);
  }, [quizAttempts]);

  // Compute Recommended Quizzes based on weak topics
  const recommendedQuizzesList = useMemo(() => {
    return getRecommendedQuizzes(quizSets, prepSummary.weakTopics, userProfile);
  }, [quizSets, prepSummary.weakTopics, userProfile]);

  // Recently Viewed Vacancies List
  const recentlyViewedVacancies = useMemo(() => {
    return recentlyViewedIds
      .map(id => vacancies.find(v => v.id === id))
      .filter((v): v is Vacancy => !!v);
  }, [recentlyViewedIds, vacancies]);

  const isPro = subscription?.tier === 'pro' || subscription?.tier === 'yearly_pro';

  const handleSaveNotes = (appId: string, currentStatus: ApplicationStatus, feePaid: boolean) => {
    onUpdateApplicationStatus?.(appId, currentStatus, noteDraft, feePaid);
    setEditingNotesId(null);
    setNoteDraft('');
  };

  const handleClearRecent = () => {
    clearRecentlyViewed();
    setRecentlyViewedIds([]);
  };

  const np = lang === 'np';

  // App passes onToggleSaveVacancy; older callers pass onToggleBookmark. Support both.
  const toggleSave = (v: Vacancy) => {
    if (onToggleBookmark) onToggleBookmark(v);
    else onToggleSaveVacancy?.(v.id);
  };

  const card = 'rounded-[2rem] bg-white dark:bg-slate-900 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10';
  const cardHead = 'flex items-center justify-between gap-3';
  const cardTitle = 'font-display text-xl font-semibold text-ink dark:text-white';
  const linkBtn = 'inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink dark:text-slate-400 dark:hover:text-white transition';
  const blackPill =
    'inline-flex items-center justify-center gap-2 rounded-full bg-ink dark:bg-white text-white dark:text-ink font-medium hover:bg-black transition';
  const ghostPill =
    'inline-flex items-center justify-center gap-2 rounded-full ring-1 ring-slate-200 dark:ring-white/15 text-ink dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition';
  const row = 'flex items-center justify-between gap-4 py-4 border-b border-slate-100 dark:border-white/10 last:border-0';
  const empty = 'py-10 text-center text-sm text-ink-soft dark:text-slate-400';

  const metrics = [
    {
      key: 'streak',
      tab: 'preparation' as DashboardSubTab,
      icon: Flame,
      label: np ? 'अभ्यास शृङ्खला' : 'Practice streak',
      value: prepSummary.streakDays,
      unit: np ? 'दिन' : 'days',
      sub: prepSummary.streakDays > 0 ? (np ? 'जारी राख्नुहोस्' : 'Keep it going') : np ? 'आज क्विज दिनुहोस्' : 'Take a quiz today'
    },
    {
      key: 'accuracy',
      tab: 'preparation' as DashboardSubTab,
      icon: Target,
      label: np ? 'क्विज शुद्धता' : 'Quiz accuracy',
      value: `${prepSummary.overallAccuracy}%`,
      unit: '',
      sub: `${prepSummary.totalAttempts} ${np ? 'परीक्षा' : 'attempts'} · ${prepSummary.totalQuestionsAnswered} ${np ? 'प्रश्न' : 'questions'}`
    },
    {
      key: 'saved',
      tab: 'saved' as DashboardSubTab,
      icon: Bookmark,
      label: np ? 'सुरक्षित विज्ञापन' : 'Saved vacancies',
      value: savedVacanciesList.length,
      unit: np ? 'पद' : 'jobs',
      sub: np ? 'निजी ट्र्याकिङ' : 'Private tracking'
    },
    {
      key: 'closing',
      tab: 'closing_soon' as DashboardSubTab,
      icon: Clock,
      label: np ? 'यो हप्ता सकिने' : 'Closing this week',
      value: closingSoonList.filter((c) => c.daysRemaining <= 7).length,
      unit: '',
      sub: `${closingSoonList.length} ${np ? 'यस महिना' : 'this month'}`
    }
  ];

  const subTabs = [
    { id: 'overview' as DashboardSubTab, labelEn: 'Overview', labelNp: 'सारांश' },
    { id: 'saved' as DashboardSubTab, labelEn: 'Saved', labelNp: 'सुरक्षित', count: savedVacanciesList.length },
    { id: 'closing_soon' as DashboardSubTab, labelEn: 'Closing soon', labelNp: 'अन्तिम म्याद', count: closingSoonList.filter((c) => c.isUrgent).length },
    { id: 'recommended' as DashboardSubTab, labelEn: 'For you', labelNp: 'तपाईंका लागि', count: recommendedList.length },
    { id: 'preparation' as DashboardSubTab, labelEn: 'Preparation', labelNp: 'तयारी' },
    { id: 'recent' as DashboardSubTab, labelEn: 'Recently viewed', labelNp: 'भर्खरै हेरिएका', count: recentlyViewedVacancies.length },
    { id: 'preferences' as DashboardSubTab, labelEn: 'Preferences', labelNp: 'प्राथमिकता' },
    { id: 'alerts' as DashboardSubTab, labelEn: 'Alerts', labelNp: 'अलर्ट', count: notifications.length }
  ];

  return (
    <div className="pt-4 sm:pt-8 space-y-8">
      {/* GREETING */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-slate-900 shadow-soft ring-1 ring-black/[0.04] dark:ring-white/10 flex items-center justify-center font-display text-2xl sm:text-3xl font-semibold text-ink dark:text-white">
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'C'}
            </div>
            {firebaseUser && (
              <span
                className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950 inline-flex items-center justify-center"
                title={np ? 'खाता सिंक भएको' : 'Account synced'}
              >
                <Check className="w-3 h-3 text-white" />
              </span>
            )}
          </div>
          <div>
            <p className="text-sm text-ink-soft dark:text-slate-400">{np ? 'नमस्ते,' : 'Namaste,'}</p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink dark:text-white leading-tight">
              {userProfile.name || (np ? 'उम्मेदवार' : 'Candidate')}
            </h1>
            <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">
              {userProfile.qualificationLevel}
              {userProfile.fieldOfStudy ? ` · ${userProfile.fieldOfStudy}` : ''} · {userProfile.province} · {userProfile.age}{' '}
              {np ? 'वर्ष' : 'yrs'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0">
          {isPro ? (
            <span className="h-11 px-4 inline-flex items-center gap-1.5 rounded-full bg-white/70 dark:bg-white/5 ring-1 ring-black/[0.04] dark:ring-white/10 text-sm text-ink dark:text-white">
              <Crown className="w-4 h-4 text-amber-500" />
              Pro
            </span>
          ) : (
            <button onClick={onOpenSubscription} className={`${ghostPill} h-11 px-4 text-sm bg-white/80 dark:bg-white/5 whitespace-nowrap`}>
              <Crown className="w-4 h-4 opacity-70" />
              {np ? 'प्रो लिनुहोस्' : 'Go Pro'}
            </button>
          )}
          {!firebaseUser && (
            <button onClick={onOpenAuth} className={`${ghostPill} h-11 px-4 text-sm bg-white/80 dark:bg-white/5 whitespace-nowrap`}>
              {np ? 'सिंक गर्न लगइन' : 'Sign in to sync'}
            </button>
          )}
          <button onClick={onOpenProfile} className={`${ghostPill} h-11 px-4 text-sm bg-white/80 dark:bg-white/5 whitespace-nowrap`}>
            <Settings className="w-4 h-4 opacity-70" />
            {np ? 'प्रोफाइल' : 'Edit profile'}
          </button>
          {onNavigateTab && (
            <button onClick={() => onNavigateTab('quizzes')} className={`${blackPill} h-11 px-5 text-sm shadow-pill whitespace-nowrap`}>
              <Zap className="w-4 h-4" />
              {np ? 'दैनिक क्विज' : 'Daily quiz'}
            </button>
          )}
        </div>
      </section>

      {/* METRICS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.key}
              onClick={() => setActiveSubTab(m.tab)}
              className={`${card} p-5 sm:p-6 text-left transition hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-soft dark:text-slate-400">{m.label}</span>
                <span className="w-8 h-8 rounded-full bg-sky-100 dark:bg-white/10 inline-flex items-center justify-center">
                  <Icon className="w-4 h-4 text-ink dark:text-white" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-semibold text-ink dark:text-white leading-none">{m.value}</span>
                {m.unit && <span className="text-sm text-ink-soft dark:text-slate-400">{m.unit}</span>}
              </div>
              <p className="mt-2 text-xs text-ink-soft dark:text-slate-400 truncate">{m.sub}</p>
            </button>
          );
        })}
      </section>

      {/* SUB-NAV */}
      <nav className="flex items-center gap-1 p-1.5 rounded-full bg-white/70 dark:bg-white/5 ring-1 ring-black/[0.04] dark:ring-white/10 overflow-x-auto no-scrollbar max-w-full w-fit">
        {subTabs.map((tab) => {
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              aria-current={active ? 'page' : undefined}
              className={`h-10 px-4 rounded-full text-sm whitespace-nowrap inline-flex items-center gap-1.5 transition ${
                active ? 'bg-ink text-white dark:bg-white dark:text-ink' : 'text-ink-soft hover:text-ink dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {np ? tab.labelNp : tab.labelEn}
              {tab.count ? <span className={`text-xs ${active ? 'opacity-70' : 'opacity-60'}`}>{tab.count}</span> : null}
            </button>
          );
        })}
      </nav>

      {/* OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recommended */}
            <section className={`${card} lg:col-span-2 p-6 sm:p-8`}>
              <div className={cardHead}>
                <h2 className={cardTitle}>{np ? 'तपाईंका लागि सिफारिस' : 'Recommended for you'}</h2>
                <button onClick={() => setActiveSubTab('recommended')} className={linkBtn}>
                  {np ? 'सबै' : 'View all'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {recommendedList.length === 0 ? (
                <p className={empty}>{np ? 'अहिले कुनै सिफारिस छैन। प्रोफाइल अपडेट गर्नुहोस्।' : 'No matches yet. Update your profile to get recommendations.'}</p>
              ) : (
                <div className="mt-2">
                  {recommendedList.slice(0, 3).map(({ vacancy, matchScore }) => {
                    const saved = savedVacanciesMap.has(vacancy.id);
                    return (
                      <div key={vacancy.id} className={row}>
                        <button onClick={() => onSelectVacancy(vacancy)} className="min-w-0 text-left group">
                          <div className="flex items-center gap-2 text-xs text-ink-soft dark:text-slate-400">
                            <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-white/10 text-ink dark:text-white">{matchScore}% {np ? 'मेल' : 'match'}</span>
                            <span className="truncate">{vacancy.category}</span>
                          </div>
                          <h3 className="mt-1.5 font-display text-base font-medium text-ink dark:text-white line-clamp-1 group-hover:underline underline-offset-4">
                            {np && vacancy.titleNp ? vacancy.titleNp : vacancy.title}
                          </h3>
                          <p className="mt-0.5 text-sm text-ink-soft dark:text-slate-400 truncate">
                            {vacancy.organization || vacancy.org} · {vacancy.province}
                          </p>
                        </button>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => toggleSave(vacancy)}
                            aria-pressed={saved}
                            title={np ? 'सुरक्षित गर्नुहोस्' : 'Save'}
                            className={`w-10 h-10 rounded-full inline-flex items-center justify-center transition ${
                              saved ? 'bg-ink text-white dark:bg-white dark:text-ink' : 'ring-1 ring-slate-200 dark:ring-white/15 text-ink dark:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                          </button>
                          <button onClick={() => onSelectVacancy(vacancy)} className={`${blackPill} h-10 px-4 text-sm`}>
                            {np ? 'हेर्नुहोस्' : 'View'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Closing soon */}
            <section className={`${card} p-6 sm:p-8`}>
              <div className={cardHead}>
                <h2 className={cardTitle}>{np ? 'छिट्टै सकिने' : 'Closing soon'}</h2>
                <button onClick={() => setActiveSubTab('closing_soon')} className={linkBtn}>
                  {np ? 'सबै' : 'All'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {closingSoonList.length === 0 ? (
                <p className={empty}>{np ? 'तत्काल सकिने विज्ञापन छैन।' : 'No urgent deadlines right now.'}</p>
              ) : (
                <div className="mt-2">
                  {closingSoonList.slice(0, 4).map(({ vacancy, isUrgent, statusLabelEn, statusLabelNp }) => (
                    <button key={vacancy.id} onClick={() => onSelectVacancy(vacancy)} className={`${row} w-full text-left group`}>
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-ink dark:text-white line-clamp-1 group-hover:underline underline-offset-4">{vacancy.title}</h3>
                        <p className="mt-0.5 text-xs text-ink-soft dark:text-slate-400 truncate">{vacancy.organization || vacancy.org}</p>
                      </div>
                      <span
                        className={`shrink-0 text-xs px-2.5 py-1 rounded-full ${
                          isUrgent ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' : 'bg-slate-100 text-ink-soft dark:bg-white/10 dark:text-slate-300'
                        }`}
                      >
                        {np ? statusLabelNp : statusLabelEn}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weak areas */}
            <section className={`${card} p-6 sm:p-8`}>
              <div className={cardHead}>
                <h2 className={cardTitle}>{np ? 'सुधार गर्नुपर्ने विषय' : 'Areas to improve'}</h2>
                <button onClick={() => setActiveSubTab('preparation')} className={linkBtn}>
                  {np ? 'विस्तृत' : 'Details'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {prepSummary.weakTopics.length > 0 ? (
                <div className="mt-2">
                  {prepSummary.weakTopics.slice(0, 3).map((wt) => (
                    <div key={wt.topic} className={row}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-ink dark:text-white truncate">{wt.topic}</span>
                          <span className="text-xs text-ink-soft dark:text-slate-400 shrink-0">
                            {wt.correct}/{wt.totalAnswered}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-sky-400" style={{ width: `${Math.max(4, Math.min(100, wt.accuracy))}%` }} />
                        </div>
                      </div>
                      <button onClick={() => setActiveSubTab('preparation')} className={`${ghostPill} h-9 px-4 text-[13px] shrink-0`}>
                        {np ? 'अभ्यास' : 'Practice'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={empty}>
                  <p>{np ? 'अहिलेसम्म कमजोर विषय पहिचान भएको छैन।' : 'No weak topics yet. A quick quiz will find them.'}</p>
                  {onNavigateTab && (
                    <button onClick={() => onNavigateTab('quizzes')} className={`${blackPill} mt-4 h-10 px-5 text-sm`}>
                      {np ? 'क्विज सुरु गर्नुहोस्' : 'Take a quiz'}
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* Recently saved */}
            <section className={`${card} p-6 sm:p-8`}>
              <div className={cardHead}>
                <h2 className={cardTitle}>{np ? 'भर्खरै सुरक्षित' : 'Recently saved'}</h2>
                <button onClick={() => setActiveSubTab('saved')} className={linkBtn}>
                  {np ? 'सबै' : 'Manage'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {savedVacanciesList.length === 0 ? (
                <div className={empty}>
                  <p>{np ? 'तपाईंले कुनै विज्ञापन सुरक्षित गर्नुभएको छैन।' : 'Nothing saved yet.'}</p>
                  {onNavigateTab && (
                    <button onClick={() => onNavigateTab('vacancies')} className={`${blackPill} mt-4 h-10 px-5 text-sm`}>
                      {np ? 'विज्ञापन हेर्नुहोस्' : 'Browse vacancies'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-2">
                  {savedVacanciesList.slice(0, 3).map(({ vacancy, appTrack }) => (
                    <button key={vacancy.id} onClick={() => onSelectVacancy(vacancy)} className={`${row} w-full text-left group`}>
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-ink dark:text-white line-clamp-1 group-hover:underline underline-offset-4">{vacancy.title}</h3>
                        <p className="mt-0.5 text-xs text-ink-soft dark:text-slate-400 truncate">
                          {vacancy.organization || vacancy.org} · {vacancy.application_deadline || vacancy.deadline}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-sky-100 dark:bg-white/10 text-ink dark:text-white">{appTrack.status}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 2: SAVED VACANCIES (SAVE/UNSAVE SYSTEM) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'saved' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 space-y-6 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Bookmark className="w-5 h-5 fill-indigo-600 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                  {lang === 'np' ? 'सुरक्षित विज्ञापनहरू' : 'Saved Vacancies & Applications'}
                </h2>
                <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-full">
                  {savedVacanciesList.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'np'
                  ? 'तपाईंका सुरक्षित विज्ञापनहरू सुरक्षित रूपमा फायरस्टोरमा भण्डार गरिएका छन्।'
                  : 'Your saved jobs are strictly isolated to your authenticated account.'}
              </p>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === 'np' ? 'सुरक्षितमा खोज्नुहोस्...' : 'Search saved...'}
                  value={savedSearchQuery}
                  onChange={(e) => setSavedSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-full text-xs bg-sky-50/70 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-sky-300 w-44 sm:w-56"
                />
              </div>

              <select
                value={savedStatusFilter}
                onChange={(e) => setSavedStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-full text-xs bg-sky-50/70 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              >
                <option value="All">{lang === 'np' ? 'सबै स्थिति' : 'All Status'}</option>
                <option value="Bookmarked">Bookmarked</option>
                <option value="Applied">Applied</option>
                <option value="Admit Card Issued">Admit Card Issued</option>
                <option value="Exam Attended">Exam Attended</option>
                <option value="Interview">Interview</option>
                <option value="Selected">Selected</option>
              </select>
            </div>
          </div>

          {filteredSavedVacancies.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 mx-auto flex items-center justify-center">
                <Bookmark className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {savedSearchQuery || savedStatusFilter !== 'All'
                  ? (lang === 'np' ? 'कुनै नतिजा फेला परेन।' : 'No saved vacancies match your filter criteria.')
                  : (lang === 'np' ? 'कुनै विज्ञापन सुरक्षित गरिएको छैन।' : 'You have not saved any vacancies yet.')}
              </p>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('vacancies')}
                  className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition"
                >
                  {lang === 'np' ? 'विज्ञापनहरू खोज्नुहोस्' : 'Explore Open Vacancies'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSavedVacancies.map(({ vacancy, appTrack }) => (
                <div
                  key={vacancy.id}
                  className="p-5 rounded-2xl bg-sky-50/70 dark:bg-slate-800/60 space-y-4 hover:shadow-xs transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {appTrack.status}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          {vacancy.category}
                        </span>
                      </div>

                      <h3
                        onClick={() => onSelectVacancy(vacancy)}
                        className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer line-clamp-2"
                      >
                        {vacancy.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {vacancy.organization || vacancy.org}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleSave(vacancy)}
                      className="p-2 rounded-full text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition shrink-0"
                      title={lang === 'np' ? 'हटाउनुहोस् (Unsave)' : 'Unsave Vacancy'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Meta parameters */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {lang === 'np' ? 'अन्तिम म्याद' : 'Deadline'}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {vacancy.application_deadline || vacancy.deadline || 'Ongoing'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {lang === 'np' ? 'दस्तुर (Fee)' : 'Application Fee'}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        NPR {vacancy.application_fee ?? vacancy.fee ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {lang === 'np' ? 'प्रदेश' : 'Province'}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {vacancy.province}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {lang === 'np' ? 'सुरक्षित मिति' : 'Saved Date'}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {appTrack.appliedAt || 'Recently'}
                      </span>
                    </div>
                  </div>

                  {/* Status update & Notes selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {lang === 'np' ? 'आवेदन स्थिति बदल्नुहोस्:' : 'Update Pipeline Status:'}
                      </span>
                      <select
                        value={appTrack.status}
                        onChange={(e) =>
                          onUpdateApplicationStatus?.(
                            appTrack.id,
                            e.target.value as ApplicationStatus,
                            appTrack.notes,
                            appTrack.feePaid
                          )
                        }
                        className="px-2.5 py-1 rounded-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200"
                      >
                        <option value="Bookmarked">Bookmarked</option>
                        <option value="Applied">Applied</option>
                        <option value="Admit Card Issued">Admit Card Issued</option>
                        <option value="Exam Attended">Exam Attended</option>
                        <option value="Interview">Interview</option>
                        <option value="Selected">Selected</option>
                      </select>
                    </div>

                    {/* Candidate Private Notes */}
                    {editingNotesId === appTrack.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder={lang === 'np' ? 'यस विज्ञापन बारे निजी टिपोट (उदा. भौचर नं, तयारी स्थिति)...' : 'Private notes (e.g. Voucher no, exam date, documents)...'}
                          className="w-full text-xs p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          rows={2}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="px-2.5 py-1 rounded text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNotes(appTrack.id, appTrack.status, appTrack.feePaid)}
                            className="px-3 py-1 rounded text-xs font-bold bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setEditingNotesId(appTrack.id);
                          setNoteDraft(appTrack.notes || '');
                        }}
                        className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:border-blue-400 transition flex items-center justify-between"
                      >
                        <span className="truncate italic">
                          {appTrack.notes || (lang === 'np' ? '+ निजी टिपोट थप्नुहोस्...' : '+ Add private notes...')}
                        </span>
                        <Edit3 className="w-3 h-3 text-slate-400 shrink-0 ml-2" />
                      </div>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-700">
                    <button
                      onClick={() => onSelectVacancy(vacancy)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                    >
                      <span>{lang === 'np' ? 'पूर्ण विवरण' : 'Full Notice'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {(vacancy.official_source_url || vacancy.applyUrl) && (
                      <a
                        href={vacancy.official_source_url || vacancy.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-xs bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
                      >
                        <span>{lang === 'np' ? 'फाराम भर्नुहोस्' : 'Apply Online'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 3: CLOSING SOON */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'closing_soon' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 space-y-6 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                {lang === 'np' ? 'अन्तिम म्याद बाँकी रहेका विज्ञापनहरू' : 'Upcoming Application Deadlines (Closing Soon)'}
              </h2>
              <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold px-2 py-0.5 rounded-full">
                {closingSoonList.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'np'
                ? 'म्याद समाप्त हुन लागेका सरकारी तथा बैंकिङ विज्ञापनहरूको प्रत्यक्ष काउन्टडाउन।'
                : 'Live countdown timers for vacancies approaching single-fee and double-fee closing dates.'}
            </p>
          </div>

          {closingSoonList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              {lang === 'np' ? 'अहिले कुनै तत्काल म्याद सकिन लागेको विज्ञापन छैन।' : 'No upcoming deadlines right now.'}
            </div>
          ) : (
            <div className="space-y-3">
              {closingSoonList.map(({ vacancy, daysRemaining, hoursRemaining, isUrgent, isClosingToday, statusLabelEn, statusLabelNp }) => (
                <div
                  key={vacancy.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isUrgent
                      ? 'bg-rose-50/60 dark:bg-rose-950/20'
                      : 'bg-slate-50 dark:bg-slate-800/60'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center space-x-1 ${
                          isUrgent
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{lang === 'np' ? statusLabelNp : statusLabelEn}</span>
                      </span>

                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {vacancy.category} • {vacancy.province}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectVacancy(vacancy)}
                      className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer"
                    >
                      {vacancy.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>{vacancy.organization || vacancy.org}</span>
                      <span>•</span>
                      <span>Single Fee Deadline: <strong className="text-slate-800 dark:text-slate-200">{vacancy.application_deadline || vacancy.deadline}</strong></span>
                      {vacancy.doubleFeeDeadline && (
                        <>
                          <span>•</span>
                          <span>Double Fee: <strong className="text-amber-700 dark:text-amber-400">{vacancy.doubleFeeDeadline}</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 shrink-0">
                    <button
                      onClick={() => toggleSave(vacancy)}
                      className={`p-2.5 rounded-full border text-xs font-bold transition ${
                        savedVacanciesMap.has(vacancy.id)
                          ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                      title="Save / Bookmark"
                    >
                      <Bookmark className={`w-4 h-4 ${savedVacanciesMap.has(vacancy.id) ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                    </button>

                    <button
                      onClick={() => onSelectVacancy(vacancy)}
                      className="px-4 py-2 rounded-full bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold hover:bg-slate-800 transition"
                    >
                      {lang === 'np' ? 'हेर्नुहोस्' : 'View Notice'}
                    </button>

                    {(vacancy.official_source_url || vacancy.applyUrl) && (
                      <a
                        href={vacancy.official_source_url || vacancy.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition shadow-xs bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
                      >
                        <span>{lang === 'np' ? 'फाराम भर्नुहोस्' : 'Apply'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 4: RECOMMENDED FOR YOU */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'recommended' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 space-y-6 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                {lang === 'np' ? 'तपाईंका लागि उपयुक्त सिफारिसहरू' : 'AI & Rule-Based Match Recommendations'}
              </h2>
              <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full">
                {recommendedList.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'np'
                ? `तपाईंको योग्यता (${userProfile.qualificationLevel}), विषय (${userProfile.fieldOfStudy}), प्रदेश (${userProfile.province}) र उमेर अनुसार मिल्ने पदहरू।`
                : `Matched specifically with your qualification (${userProfile.qualificationLevel}), study field (${userProfile.fieldOfStudy}), and province.`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedList.map(({ vacancy, matchScore, matchReasonsEn, matchReasonsNp, isTopMatch }) => (
              <div
                key={vacancy.id}
                className="p-5 rounded-2xl bg-sky-50/70 dark:bg-slate-800/60 space-y-4 hover:border-blue-400/80 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        isTopMatch
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                      }`}
                    >
                      {matchScore}% Match Score
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {vacancy.category}
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectVacancy(vacancy)}
                    className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer line-clamp-2"
                  >
                    {vacancy.title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {vacancy.organization || vacancy.org} • {vacancy.province}
                  </p>

                  {/* Match Rationale Highlights */}
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">
                      {lang === 'np' ? 'किन यो पद सिफारिस गरियो:' : 'Why this matches:'}
                    </span>
                    {(lang === 'np' ? matchReasonsNp : matchReasonsEn).map((reason, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-700">
                  <span className="text-xs text-slate-500">
                    Deadline: <strong className="text-slate-800 dark:text-slate-200">{vacancy.application_deadline || vacancy.deadline}</strong>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleSave(vacancy)}
                      className={`p-2 rounded-full border text-xs font-bold transition ${
                        savedVacanciesMap.has(vacancy.id)
                          ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                      title="Save / Bookmark"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${savedVacanciesMap.has(vacancy.id) ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                    </button>
                    <button
                      onClick={() => onSelectVacancy(vacancy)}
                      className="px-3 py-1.5 rounded-full bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold hover:bg-slate-800 transition"
                    >
                      {lang === 'np' ? 'विवरण' : 'Details'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 5: YOUR PREPARATION (QUIZ ATTEMPTS, STREAK, WEAK SUBJECTS) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'preparation' && (
        <div className="space-y-6">
          {/* Diagnostic Metrics & Streak Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Streak & Cadence Card */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-100">
                  {lang === 'np' ? 'दैनिक अध्ययन शृङ्खला' : 'Daily Practice Streak'}
                </span>
                <Flame className="w-6 h-6 fill-white text-white animate-bounce" />
              </div>
              <div>
                <div className="text-4xl font-semibold">{prepSummary.streakDays} Days</div>
                <p className="text-xs text-orange-100 mt-1">
                  {prepSummary.streakDays > 0
                    ? 'Great dedication! Practice today to keep your streak alive.'
                    : 'Take any quiz today to kick off your streak!'}
                </p>
              </div>
              <div className="pt-2 border-t border-white/20 text-[11px] text-orange-100">
                Last Practiced: {prepSummary.lastPracticeDate || 'None yet'}
              </div>
            </div>

            {/* Overall Accuracy Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] space-y-4 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {lang === 'np' ? 'कुल क्विज शुद्धता' : 'Overall Accuracy'}
                </span>
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-semibold text-slate-900 dark:text-white">
                  {prepSummary.overallAccuracy}%
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${prepSummary.overallAccuracy}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                {prepSummary.totalCorrect} correct out of {prepSummary.totalQuestionsAnswered} total questions answered.
              </p>
            </div>

            {/* Total Attempts Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] space-y-4 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {lang === 'np' ? 'कुल सम्पन्न नमुना परीक्षा' : 'Completed Mock Tests'}
                </span>
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-3xl font-semibold text-slate-900 dark:text-white">
                  {prepSummary.totalAttempts}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Full Lok Sewa standard tests with 20% negative mark scoring applied.
                </p>
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('quizzes')}
                  className="w-full py-2 rounded-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-bold transition"
                >
                  {lang === 'np' ? 'नयाँ परीक्षा दिनुहोस्' : 'Start New Quiz'}
                </button>
              )}
            </div>
          </div>

          {/* Weak Subjects Engine & Recommended Quizzes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weak Subjects Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 space-y-4 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {lang === 'np' ? 'कमजोर विषयहरू (Weak Subjects)' : 'Weak Subjects & Focus Topics'}
                  </h3>
                </div>
              </div>

              {prepSummary.weakTopics.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Topics where your accuracy is below 70%. Focus on revising these concepts:
                  </p>
                  {prepSummary.weakTopics.map(wt => (
                    <div
                      key={wt.topic}
                      className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {wt.topic}
                        </span>
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                          {wt.accuracy}% Accuracy
                        </span>
                      </div>
                      <div className="w-full bg-amber-200/60 dark:bg-amber-900/40 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${wt.accuracy}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{wt.missedCount} questions missed out of {wt.totalAnswered} answered</span>
                        {onNavigateTab && (
                          <button
                            onClick={() => onNavigateTab('quizzes')}
                            className="text-amber-700 dark:text-amber-400 font-bold hover:underline"
                          >
                            Practice Diagnostic &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  {lang === 'np'
                    ? 'अहिले कुनै कमजोर विषय देखिएको छैन। परीक्षा दिएपछि यहाँ विश्लेषण देखिनेछ।'
                    : 'No weak subjects identified yet! Complete more quizzes to view your personalized subject diagnostic.'}
                </div>
              )}
            </div>

            {/* Recommended Quizzes for Preparation */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 space-y-4 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {lang === 'np' ? 'सिफारिस गरिएका नमुना क्विजहरू' : 'Recommended Quizzes for You'}
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {recommendedQuizzesList.map(({ quizSet, rationaleEn, rationaleNp }) => (
                  <div
                    key={quizSet.id}
                    className="p-4 rounded-2xl bg-sky-50/70 dark:bg-slate-800/60 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {quizSet.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {quizSet.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {lang === 'np' ? rationaleNp : rationaleEn}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (onStartQuiz) onStartQuiz(quizSet.id);
                        else if (onNavigateTab) onNavigateTab('quizzes');
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition shadow-xs bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
                    >
                      {lang === 'np' ? 'सुरु गर्नुहोस्' : 'Start'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quiz Attempts History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 space-y-4 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {lang === 'np' ? 'तपाईंका क्विज नतिजाहरू (Attempts History)' : 'Quiz Attempts & Score History'}
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {quizAttempts.length} Records
              </span>
            </div>

            {quizAttempts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                {lang === 'np' ? 'अहिलेसम्म कुनै क्विज प्रयास गरिएको छैन।' : 'No quiz attempts recorded yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-[10px]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Quiz Title</th>
                      <th className="py-2.5 px-3">Net Score</th>
                      <th className="py-2.5 px-3">Accuracy</th>
                      <th className="py-2.5 px-3">Penalty Marks</th>
                      <th className="py-2.5 px-3">Time Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {quizAttempts.map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-medium text-slate-500">
                          {attempt.attemptedAt?.split('T')[0] || 'Recently'}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {attempt.quizTitle || 'Lok Sewa Practice Set'}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                          {attempt.score} / {attempt.totalQuestions}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              attempt.percentage >= 70
                                ? 'bg-emerald-100 text-emerald-800'
                                : attempt.percentage >= 40
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {attempt.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-rose-600 font-bold">
                          -{attempt.negativeMarksDeducted ?? 0}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {Math.floor((attempt.timeTakenSeconds || 60) / 60)}m {(attempt.timeTakenSeconds || 60) % 60}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 6: RECENTLY VIEWED VACANCIES */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'recent' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 space-y-6 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                  {lang === 'np' ? 'भर्खरै हेरिएका विज्ञापनहरू' : 'Recently Viewed Vacancies'}
                </h2>
                <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full">
                  {recentlyViewedVacancies.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'np'
                  ? 'तपाईंले पछिल्लो पटक ब्राउज गर्नुभएका विज्ञापनहरू।'
                  : 'Locally cached vacancies you previously inspected.'}
              </p>
            </div>

            {recentlyViewedVacancies.length > 0 && (
              <button
                onClick={handleClearRecent}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'np' ? 'इतिहास मेटाउनुहोस्' : 'Clear History'}</span>
              </button>
            )}
          </div>

          {recentlyViewedVacancies.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              {lang === 'np' ? 'कुनै भर्खरै हेरिएका विज्ञापन छैनन्।' : 'No recently viewed vacancies yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyViewedVacancies.map((vacancy) => (
                <div
                  key={vacancy.id}
                  className="p-4 rounded-2xl bg-sky-50/70 dark:bg-slate-800/60 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {vacancy.category}
                    </span>
                    <h3
                      onClick={() => onSelectVacancy(vacancy)}
                      className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer line-clamp-2"
                    >
                      {vacancy.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {vacancy.organization || vacancy.org} • {vacancy.province}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-700">
                    <span className="text-[11px] text-slate-500">
                      Deadline: <strong>{vacancy.application_deadline || vacancy.deadline}</strong>
                    </span>
                    <button
                      onClick={() => onSelectVacancy(vacancy)}
                      className="px-2.5 py-1 rounded-full bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold"
                    >
                      {lang === 'np' ? 'हेर्नुहोस्' : 'View'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 7 & 8: JOB ALERTS & PREFERENCES (PHASE 8 ENGINE) */}
      {/* ------------------------------------------------------------- */}
      {(activeSubTab === 'preferences' || activeSubTab === 'alerts') && (
        <div className="space-y-6">
          <JobAlertsCenter
            userProfile={userProfile}
            vacancies={vacancies}
            lang={lang}
            onUpdateProfile={(updated) => {
              if (onUpdateProfile) {
                onUpdateProfile?.(updated);
              } else if (firebaseUser) {
                updateUserProfileInFirestore(firebaseUser.uid, updated);
              }
            }}
            onSelectVacancy={(v) => onSelectVacancy(v)}
          />
        </div>
      )}
    </div>
  );
};
