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
    onUpdateApplicationStatus(appId, currentStatus, noteDraft, feePaid);
    setEditingNotesId(null);
    setNoteDraft('');
  };

  const handleClearRecent = () => {
    clearRecentlyViewed();
    setRecentlyViewedIds([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP PROFILE & SUMMARY BANNER */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs relative overflow-hidden transition-all">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* User Avatar & Info */}
          <div className="flex items-start sm:items-center space-x-4 sm:space-x-5">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 dark:from-blue-600 dark:to-indigo-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border-2 border-white dark:border-slate-800">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'C'}
              </div>
              {firebaseUser && (
                <div
                  className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900"
                  title="Verified Firebase Account"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {userProfile.name || (lang === 'np' ? 'उम्मेदवार ड्यासबोर्ड' : 'Candidate Dashboard')}
                </h1>

                {isPro ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    <Crown className="w-3 h-3 mr-1 text-amber-500" />
                    PRO
                  </span>
                ) : (
                  <button
                    onClick={onOpenSubscription}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition"
                  >
                    <Crown className="w-3 h-3 mr-1 text-amber-600" />
                    {lang === 'np' ? 'अपग्रेड प्रो' : 'Upgrade Pro'}
                  </button>
                )}

                {firebaseUser ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    {lang === 'np' ? 'सुरक्षित सिंक' : 'Cloud Synced'}
                  </span>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition"
                  >
                    <User className="w-3 h-3 mr-1" />
                    {lang === 'np' ? 'लगइन गर्नुहोस्' : 'Sign in to Sync'}
                  </button>
                )}
              </div>

              {/* Education & Location details */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {userProfile.qualificationLevel} ({userProfile.fieldOfStudy})
                </span>
                <span className="inline-flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {userProfile.province} Province
                </span>
                <span className="inline-flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Age: {userProfile.age} yrs
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenProfile}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-slate-700 shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{lang === 'np' ? 'प्रोफाइल / प्राथमिकता' : 'Edit Preferences'}</span>
            </button>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('quizzes')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{lang === 'np' ? 'दैनिक क्विज' : 'Daily Quiz'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. KEY METRICS BAR (4 CARDS) */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          {/* Card 1: Preparation Streak */}
          <div
            onClick={() => setActiveSubTab('preparation')}
            className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 cursor-pointer hover:border-orange-300 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-700 dark:text-orange-400">
                {lang === 'np' ? 'तयारी शृङ्खला' : 'Preparation Streak'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {prepSummary.streakDays}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {lang === 'np' ? 'दिन' : 'Days'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {prepSummary.streakDays > 0
                ? (lang === 'np' ? 'सक्रिय अभ्यास जारी छ 🔥' : 'Active streak ongoing 🔥')
                : (lang === 'np' ? 'आजै क्विज दिएर सुरु गर्नुहोस्' : 'Take a quiz to start streak')}
            </p>
          </div>

          {/* Card 2: Quiz Accuracy */}
          <div
            onClick={() => setActiveSubTab('preparation')}
            className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 cursor-pointer hover:border-blue-300 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                {lang === 'np' ? 'क्विज शुद्धता' : 'Quiz Accuracy'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {prepSummary.overallAccuracy}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                ({prepSummary.totalQuestionsAnswered} Qs)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {prepSummary.totalAttempts} {lang === 'np' ? 'वटा परीक्षा सम्पन्न' : 'mock attempts total'}
            </p>
          </div>

          {/* Card 3: Saved Vacancies */}
          <div
            onClick={() => setActiveSubTab('saved')}
            className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 cursor-pointer hover:border-indigo-300 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                {lang === 'np' ? 'सुरक्षित विज्ञापन' : 'Saved Vacancies'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Bookmark className="w-4 h-4 fill-indigo-500 text-indigo-500" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {savedVacanciesList.length}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {lang === 'np' ? 'पदहरू' : 'Jobs'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {lang === 'np' ? 'तपाईंको निजी ट्र्याकिङ' : 'Private & safe tracking'}
            </p>
          </div>

          {/* Card 4: Closing Soon */}
          <div
            onClick={() => setActiveSubTab('closing_soon')}
            className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 cursor-pointer hover:border-rose-300 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
                {lang === 'np' ? 'म्याद सकिन लागेका' : 'Closing Soon'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {closingSoonList.filter(c => c.daysRemaining <= 7).length}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {lang === 'np' ? 'यो हप्ता' : 'This week'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {closingSoonList.length} {lang === 'np' ? 'विज्ञापन यस महिना सकिने' : 'active deadlines total'}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. DASHBOARD SUB-NAVIGATION TABS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview' as DashboardSubTab, labelEn: 'Overview', labelNp: 'सारांश', icon: Sparkles },
          {
            id: 'saved' as DashboardSubTab,
            labelEn: 'Saved Vacancies',
            labelNp: 'सुरक्षित विज्ञापन',
            icon: Bookmark,
            badge: savedVacanciesList.length
          },
          {
            id: 'closing_soon' as DashboardSubTab,
            labelEn: 'Closing Soon',
            labelNp: 'अन्तिम म्याद',
            icon: Clock,
            badge: closingSoonList.filter(c => c.isUrgent).length || undefined,
            badgeColor: 'bg-rose-500 text-white'
          },
          {
            id: 'recommended' as DashboardSubTab,
            labelEn: 'Recommended for You',
            labelNp: 'तपाईंका लागि उपयुक्त',
            icon: Sparkles,
            badge: recommendedList.length
          },
          {
            id: 'preparation' as DashboardSubTab,
            labelEn: 'Your Preparation',
            labelNp: 'तपाईंको तयारी',
            icon: Award
          },
          {
            id: 'recent' as DashboardSubTab,
            labelEn: 'Recently Viewed',
            labelNp: 'भर्खरै हेरिएका',
            icon: Eye,
            badge: recentlyViewedVacancies.length
          },
          {
            id: 'preferences' as DashboardSubTab,
            labelEn: 'Job Preferences',
            labelNp: 'रोजाइ प्राथमिकता',
            icon: Sliders
          },
          {
            id: 'alerts' as DashboardSubTab,
            labelEn: 'Job Alerts',
            labelNp: 'सूचना तथा अलर्ट',
            icon: Bell,
            badge: notifications.length
          }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{lang === 'np' ? tab.labelNp : tab.labelEn}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    tab.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200')
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. TAB CONTENTS */}
      {/* ------------------------------------------------------------- */}

      {/* SUB-TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Grid: Closing Soon Highlight & Recommended Quick View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col (2 cols): Recommended For You Highlights */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                    {lang === 'np' ? 'तपाईंको प्रोफाइल अनुसार सिफारिस गरिएका पदहरू' : 'Recommended for You'}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveSubTab('recommended')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                >
                  <span>{lang === 'np' ? 'सबै हेर्नुहोस्' : 'View all'}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {recommendedList.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  {lang === 'np' ? 'अहिले कुनै सिफारिस फेला परेन। प्रोफाइल अपडेट गर्नुहोस्।' : 'No matches found yet. Update your profile preferences.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendedList.slice(0, 3).map(({ vacancy, matchScore, matchReasonsEn, matchReasonsNp }) => (
                    <div
                      key={vacancy.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-400/60 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {matchScore}% Match
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {vacancy.category}
                          </span>
                        </div>
                        <h3
                          onClick={() => onSelectVacancy(vacancy)}
                          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-1"
                        >
                          {vacancy.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                          <span>{vacancy.organization || vacancy.org}</span>
                          <span>•</span>
                          <span>{vacancy.province}</span>
                          <span>•</span>
                          <span>Fee: NPR {vacancy.application_fee ?? vacancy.fee ?? 0}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => onToggleBookmark(vacancy)}
                          className={`p-2 rounded-xl text-xs font-bold border transition ${
                            savedVacanciesMap.has(vacancy.id)
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                          title="Save / Unsave Vacancy"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${savedVacanciesMap.has(vacancy.id) ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                        </button>
                        <button
                          onClick={() => onSelectVacancy(vacancy)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-blue-500 transition"
                        >
                          {lang === 'np' ? 'विवरण' : 'Details'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Col (1 col): Urgent Deadlines Widget */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                    {lang === 'np' ? 'अन्तिम म्याद सूचना' : 'Closing Soon'}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveSubTab('closing_soon')}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center space-x-1"
                >
                  <span>{lang === 'np' ? 'सबै' : 'View all'}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {closingSoonList.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  {lang === 'np' ? 'कुनै तत्काल सकिन लागेको विज्ञापन छैन।' : 'No urgent deadlines right now.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {closingSoonList.slice(0, 4).map(({ vacancy, daysRemaining, hoursRemaining, isUrgent, statusLabelEn, statusLabelNp }) => (
                    <div
                      key={vacancy.id}
                      onClick={() => onSelectVacancy(vacancy)}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-rose-400/60 transition cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            isUrgent
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-pulse'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {lang === 'np' ? statusLabelNp : statusLabelEn}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          {vacancy.application_deadline || vacancy.deadline}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {vacancy.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {vacancy.organization || vacancy.org}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Grid: Preparation & Saved Vacancies Quick Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preparation Insights */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                    {lang === 'np' ? 'तपाईंको तयारी विश्लेषण' : 'Preparation & Weak Areas'}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveSubTab('preparation')}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1"
                >
                  <span>{lang === 'np' ? 'विस्तृत' : 'Details'}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {prepSummary.weakTopics.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-500">
                    {lang === 'np'
                      ? 'सुधार गर्नुपर्ने मुख्य कमजोर विषयहरू:'
                      : 'Key focus areas needing reinforcement:'}
                  </p>
                  {prepSummary.weakTopics.slice(0, 3).map((wt) => (
                    <div
                      key={wt.topic}
                      className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {wt.topic}
                        </span>
                        <p className="text-[10px] text-slate-500">
                          Accuracy: {wt.accuracy}% ({wt.correct}/{wt.totalAnswered} correct)
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveSubTab('preparation');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition"
                      >
                        {lang === 'np' ? 'अभ्यास' : 'Practice'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-500 space-y-2">
                  <p>{lang === 'np' ? 'अहिलेसम्म कुनै कमजोर विषय पहिचान भएको छैन।' : 'No weak topics identified yet.'}</p>
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('quizzes')}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                    >
                      {lang === 'np' ? 'क्विज अभ्यास सुरु गर्नुहोस्' : 'Take a Diagnostic Quiz'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Saved Vacancies Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                    {lang === 'np' ? 'हालसालै सुरक्षित गरिएका पदहरू' : 'Recently Saved Jobs'}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveSubTab('saved')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                >
                  <span>{lang === 'np' ? 'सबै हेर्नुहोस्' : 'Manage all'}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {savedVacanciesList.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 space-y-2">
                  <p>{lang === 'np' ? 'तपाईंले कुनै विज्ञापन सुरक्षित गर्नुभएको छैन।' : 'You have no saved vacancies yet.'}</p>
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('vacancies')}
                      className="px-3 py-1.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-bold"
                    >
                      {lang === 'np' ? 'विज्ञापनहरू खोज्नुहोस्' : 'Browse Vacancies'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedVacanciesList.slice(0, 3).map(({ vacancy, appTrack }) => (
                    <div
                      key={vacancy.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {appTrack.status}
                        </span>
                        <h4
                          onClick={() => onSelectVacancy(vacancy)}
                          className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-blue-600 cursor-pointer"
                        >
                          {vacancy.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate">
                          {vacancy.organization || vacancy.org} • Deadline: {vacancy.application_deadline || vacancy.deadline}
                        </p>
                      </div>

                      <button
                        onClick={() => onSelectVacancy(vacancy)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-blue-600 text-white text-[11px] font-bold hover:bg-slate-800 shrink-0"
                      >
                        {lang === 'np' ? 'हेर्नुहोस्' : 'View'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 2: SAVED VACANCIES (SAVE/UNSAVE SYSTEM) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'saved' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Bookmark className="w-5 h-5 fill-indigo-600 text-indigo-600" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
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
                  className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-44 sm:w-56"
                />
              </div>

              <select
                value={savedStatusFilter}
                onChange={(e) => setSavedStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
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
                  className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
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
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4 hover:shadow-xs transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
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
                      onClick={() => onToggleBookmark(vacancy)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition shrink-0"
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
                          onUpdateApplicationStatus(
                            appTrack.id,
                            e.target.value as ApplicationStatus,
                            appTrack.notes,
                            appTrack.feePaid
                          )
                        }
                        className="px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200"
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
                          className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
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
                            className="px-3 py-1 rounded text-xs bg-blue-600 text-white font-bold"
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
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
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
                      ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
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
                      onClick={() => onToggleBookmark(vacancy)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        savedVacanciesMap.has(vacancy.id)
                          ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                      title="Save / Bookmark"
                    >
                      <Bookmark className={`w-4 h-4 ${savedVacanciesMap.has(vacancy.id) ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                    </button>

                    <button
                      onClick={() => onSelectVacancy(vacancy)}
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold hover:bg-slate-800 transition"
                    >
                      {lang === 'np' ? 'हेर्नुहोस्' : 'View Notice'}
                    </button>

                    {(vacancy.official_source_url || vacancy.applyUrl) && (
                      <a
                        href={vacancy.official_source_url || vacancy.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
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
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4 hover:border-blue-400/80 transition flex flex-col justify-between"
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
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
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
                      onClick={() => onToggleBookmark(vacancy)}
                      className={`p-2 rounded-xl border text-xs font-bold transition ${
                        savedVacanciesMap.has(vacancy.id)
                          ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                      title="Save / Bookmark"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${savedVacanciesMap.has(vacancy.id) ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                    </button>
                    <button
                      onClick={() => onSelectVacancy(vacancy)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold hover:bg-slate-800 transition"
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
                <span className="text-xs font-bold text-orange-100 uppercase tracking-wider">
                  {lang === 'np' ? 'दैनिक अध्ययन शृङ्खला' : 'Daily Practice Streak'}
                </span>
                <Flame className="w-6 h-6 fill-white text-white animate-bounce" />
              </div>
              <div>
                <div className="text-4xl font-black">{prepSummary.streakDays} Days</div>
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
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'np' ? 'कुल क्विज शुद्धता' : 'Overall Accuracy'}
                </span>
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">
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
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'np' ? 'कुल सम्पन्न नमुना परीक्षा' : 'Completed Mock Tests'}
                </span>
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {prepSummary.totalAttempts}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Full Lok Sewa standard tests with 20% negative mark scoring applied.
                </p>
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('quizzes')}
                  className="w-full py-2 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-bold transition"
                >
                  {lang === 'np' ? 'नयाँ परीक्षा दिनुहोस्' : 'Start New Quiz'}
                </button>
              )}
            </div>
          </div>

          {/* Weak Subjects Engine & Recommended Quizzes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weak Subjects Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
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
                      className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {wt.topic}
                        </span>
                        <span className="text-xs font-black text-amber-700 dark:text-amber-400">
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
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {lang === 'np' ? 'सिफारिस गरिएका नमुना क्विजहरू' : 'Recommended Quizzes for You'}
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {recommendedQuizzesList.map(({ quizSet, rationaleEn, rationaleNp }) => (
                  <div
                    key={quizSet.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
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
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition shadow-xs"
                    >
                      {lang === 'np' ? 'सुरु गर्नुहोस्' : 'Start'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quiz Attempts History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
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
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
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
                        <td className="py-3 px-3 font-black text-slate-900 dark:text-white">
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
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
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 flex flex-col justify-between"
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
                      className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold"
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
                onUpdateProfile(updated);
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
