import React from 'react';
import {
  Briefcase,
  LayoutDashboard,
  Sparkles,
  Award,
  Bell,
  BookmarkCheck,
  ShieldAlert,
  Globe,
  User,
  CheckCircle2,
  Lock,
  Phone,
  ShieldCheck,
  FileSpreadsheet,
  Sun,
  Moon,
  GraduationCap,
  FileText,
  Trophy,
  Crown,
  Bot,
  Download,
  MessageSquarePlus
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { Language, UserProfile, NotificationLog, Theme, UserSubscription } from '../types';
import { t } from '../utils/translations';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  notifications: NotificationLog[];
  firebaseUser: FirebaseUser | null;
  isAdmin?: boolean;
  userRole?: string;
  onOpenAuth: () => void;
  onOpenSheetsModal?: () => void;
  onOpenSubscription?: () => void;
  onOpenNotificationCenter?: () => void;
  onOpenInstallPrompt?: () => void;
  onOpenBetaFeedback?: () => void;
  unreadInAppCount?: number;
  subscription?: UserSubscription;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  theme,
  setTheme,
  userProfile,
  onOpenProfile,
  notifications,
  firebaseUser,
  isAdmin,
  userRole,
  onOpenAuth,
  onOpenSheetsModal,
  onOpenSubscription,
  onOpenNotificationCenter,
  onOpenInstallPrompt,
  onOpenBetaFeedback,
  unreadInAppCount = 0,
  subscription
}) => {
  const unreadCount = (notifications.filter(n => n.status === 'sent').length) + unreadInAppCount;
  const isPro = subscription?.tier === 'pro' || subscription?.tier === 'yearly_pro';

  const navItems = [
    { id: 'vacancies', label: t('navVacancies', lang), icon: Briefcase },
    { id: 'dashboard', label: t('navDashboard', lang), icon: LayoutDashboard },
    { id: 'syllabus', label: t('navSyllabus', lang), icon: GraduationCap },
    { id: 'ai_assistant', label: t('navAiAssistant', lang), icon: Bot, badge: 'AI Bot' },
    { id: 'subjective', label: t('navSubjective', lang), icon: FileText, badge: 'Phase 2' },
    { id: 'matcher', label: t('navMatcher', lang), icon: Sparkles, badge: 'AI' },
    { id: 'quizzes', label: t('navQuiz', lang), icon: Award },
    { id: 'leaderboard', label: t('navLeaderboard', lang), icon: Trophy },
    { id: 'alerts', label: t('navAlerts', lang), icon: Bell, count: unreadCount },
    { id: 'tracker', label: t('navTracker', lang), icon: BookmarkCheck }
  ];

  // Only show Admin Control Panel link if user is verified editor/admin/super_admin
  if (isAdmin || (userRole && ['editor', 'admin', 'super_admin'].includes(userRole))) {
    navItems.push({ id: 'admin', label: t('navAdmin', lang), icon: ShieldAlert });
  }

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
            Live Updates (२०८३/२०८४)
          </span>
          <span className="hidden md:inline text-slate-500 dark:text-slate-400">
            Lok Sewa Aayog, TSC, Banking, Security & Provincial Vacancies
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-2.5 flex-wrap gap-y-1">
          {/* SarkariSajha Pro Membership Button */}
          {onOpenSubscription && (
            <button
              onClick={onOpenSubscription}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition border shadow-xs ${
                isPro
                  ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 border-amber-400'
              }`}
            >
              <Crown className={`w-3.5 h-3.5 ${isPro ? 'text-amber-500' : 'text-slate-950'}`} />
              <span>{isPro ? (lang === 'np' ? 'प्रो सदस्य' : 'Pro Active') : (lang === 'np' ? 'प्रो सदस्यता' : 'Upgrade Pro')}</span>
            </button>
          )}

          {/* PWA Install Button */}
          {onOpenInstallPrompt && (
            <button
              onClick={onOpenInstallPrompt}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 transition text-xs font-bold border border-blue-200 dark:border-blue-800/80 shadow-xs"
              title="Install SarkariSajha App to Home Screen"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">{lang === 'np' ? 'एप इन्स्टल' : 'Install App'}</span>
            </button>
          )}

          {/* Beta Feedback & Bug Report Button */}
          {onOpenBetaFeedback && (
            <button
              onClick={onOpenBetaFeedback}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 transition text-xs font-bold border border-rose-200 dark:border-rose-800/80 shadow-xs"
              title="Report an issue or submit beta feedback"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span className="hidden sm:inline">{lang === 'np' ? 'प्रतिक्रिया' : 'Beta Feedback'}</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-xs font-medium border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
            title={theme === 'dark' ? t('themeLight', lang) : t('themeDark', lang)}
            aria-label={t('themeToggle', lang)}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-semibold">{lang === 'np' ? 'लाइट' : 'Light'}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px] font-semibold">{lang === 'np' ? 'डार्क' : 'Dark'}</span>
              </>
            )}
          </button>

          {onOpenSheetsModal && (
            <button
              onClick={onOpenSheetsModal}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 transition text-xs font-bold border border-emerald-200 dark:border-emerald-800/80 shadow-xs"
              title="Sync vacancies and application tracker with Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Google Sheets</span>
            </button>
          )}

          <button
            onClick={onOpenAuth}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition text-xs font-bold border shadow-xs ${
              firebaseUser
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
            }`}
            title={firebaseUser ? `Logged in as ${firebaseUser.phoneNumber || firebaseUser.email || 'Firebase User'}` : 'Sign in with Phone / OTP or Email'}
          >
            {firebaseUser ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate max-w-[100px]">
                  {firebaseUser.phoneNumber || firebaseUser.email?.split('@')[0] || (lang === 'np' ? 'लगइन भएको' : 'Logged In')}
                </span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>{lang === 'np' ? 'फोन / इमेल लगइन' : 'Sign In / OTP'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => setLang(lang === 'en' ? 'np' : 'en')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-xs font-medium border border-slate-200 dark:border-slate-700 shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t('languageToggle', lang)}</span>
          </button>

          {/* Notification Center Trigger */}
          {onOpenNotificationCenter && (
            <button
              onClick={onOpenNotificationCenter}
              className="relative flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
              title="Open Notification Center"
            >
              <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">{lang === 'np' ? 'सूचनाहरू' : 'Notices'}</span>
              {unreadInAppCount > 0 && (
                <span className="ml-1 bg-rose-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full animate-pulse">
                  {unreadInAppCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenProfile}
            className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-xs font-medium border border-slate-200 dark:border-slate-700 shadow-xs"
          >
            <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="truncate max-w-[120px] font-semibold">{userProfile.name}</span>
            <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] text-slate-700 dark:text-slate-300 font-mono">
              {userProfile.province}
            </span>
          </button>
        </div>
      </div>

      {/* Main Header Brand & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('vacancies')}>
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-600 p-0.5 flex items-center justify-center shadow-sm">
              <span className="text-lg font-black text-white tracking-wider">
                SS
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-sans">
                  {lang === 'np' ? 'सरकारी साझा' : 'SarkariSajha'}
                </h1>
                <span className="bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/80 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                  NEPAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t('tagline', lang)}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-[9px] px-1.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span className="ml-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

