import React from 'react';
import {
  X,
  LayoutDashboard,
  Sparkles,
  Award,
  Bell,
  BookmarkCheck,
  ShieldAlert,
  FileSpreadsheet,
  Sun,
  Moon,
  Globe,
  Crown,
  Trophy,
  FileText,
  Download,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  MessageSquarePlus
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { Language, UserProfile, Theme, UserSubscription } from '../types';
import { t } from '../utils/translations';
import { isPwaInstalled } from '../lib/pwa';

interface MobileMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  firebaseUser: FirebaseUser | null;
  isAdmin?: boolean;
  userRole?: string;
  onOpenAuth: () => void;
  onOpenSheetsModal?: () => void;
  onOpenSubscription?: () => void;
  onOpenInstallPrompt?: () => void;
  onOpenBetaFeedback?: () => void;
  unreadInAppCount?: number;
  subscription?: UserSubscription;
}

export const MobileMoreDrawer: React.FC<MobileMoreDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  lang,
  setLang,
  theme,
  setTheme,
  userProfile,
  onOpenProfile,
  firebaseUser,
  isAdmin,
  userRole,
  onOpenAuth,
  onOpenSheetsModal,
  onOpenSubscription,
  onOpenInstallPrompt,
  onOpenBetaFeedback,
  unreadInAppCount = 0,
  subscription
}) => {
  if (!isOpen) return null;

  const isPro = subscription?.tier === 'pro' || subscription?.tier === 'yearly_pro';
  const isInstalled = isPwaInstalled();

  const handleSelectNav = (tabId: string) => {
    setActiveTab(tabId);
    onClose();
  };

  const navMenuItems = [
    {
      id: 'dashboard',
      label: t('navDashboard', lang),
      description: lang === 'np' ? 'दैनिक प्रगति, सेभ गरिएका पद तथा प्रोफाइल' : 'Daily progress, saved posts & stats',
      icon: LayoutDashboard,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800'
    },
    {
      id: 'matcher',
      label: t('navMatcher', lang),
      description: lang === 'np' ? 'योग्यता अनुसार सिफारिस गरिएका पदहरू' : 'Instant AI qualification matching',
      icon: Sparkles,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/80 border-purple-200 dark:border-purple-800',
      badge: 'AI'
    },
    {
      id: 'subjective',
      label: t('navSubjective', lang),
      description: lang === 'np' ? 'दोस्रो चरण लिखित उत्तर मूल्यांकन' : 'Subjective Phase 2 written grading',
      icon: FileText,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800',
      badge: 'Phase 2'
    },
    {
      id: 'tracker',
      label: t('navTracker', lang),
      description: lang === 'np' ? 'आवेदन फारम, म्याद र रोल नम्बर' : 'Track deadlines & exam roll numbers',
      icon: BookmarkCheck,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'leaderboard',
      label: t('navLeaderboard', lang),
      description: lang === 'np' ? 'राष्ट्रिय स्तरको प्रतिस्पर्धा र श्रेणी' : 'National rank & performance rankings',
      icon: Trophy,
      color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/80 border-yellow-200 dark:border-yellow-800'
    },
    {
      id: 'alerts',
      label: t('navAlerts', lang),
      description: lang === 'np' ? 'प्रशासनिक सूचना तथा म्याद चेतावनी' : 'Official notice alerts & push notices',
      icon: Bell,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800',
      count: unreadInAppCount
    }
  ];

  // Admin section
  if (isAdmin || (userRole && ['editor', 'admin', 'super_admin'].includes(userRole))) {
    navMenuItems.push({
      id: 'admin',
      label: t('navAdmin', lang),
      description: lang === 'np' ? 'प्रशासन प्यानल, एआई एक्स्ट्र्याक्टर र प्रश्न बैंक' : 'Admin portal, AI vacancy extractor & editor',
      icon: ShieldAlert,
      color: 'text-red-500 bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-800',
      badge: 'Admin'
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-up Sheet */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-200">
        {/* Top Drag Pill & Header */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mb-3" />
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                SS
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {lang === 'np' ? 'थप सुविधाहरू' : 'More Features & Tools'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {lang === 'np' ? 'सरकारी साझा मोबाइल हब' : 'SarkariSajha Navigation Center'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Candidate Profile Snapshot Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-base border border-amber-200 dark:border-amber-800">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{userProfile.name}</span>
                {firebaseUser && (
                  <span title="Authenticated Account">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {userProfile.qualificationLevel} • {userProfile.province}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenProfile();
              }}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition shadow-xs"
            >
              {lang === 'np' ? 'प्रोफाइल' : 'Profile'}
            </button>
          </div>
        </div>

        {/* Pro Membership Banner */}
        {onOpenSubscription && (
          <div
            onClick={() => {
              onClose();
              onOpenSubscription();
            }}
            className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition shadow-xs ${
              isPro
                ? 'bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-amber-500/10 border-amber-300 dark:border-amber-700'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPro ? 'bg-amber-100 dark:bg-amber-900 text-amber-600' : 'bg-slate-950 text-amber-400'}`}>
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-xs font-black ${isPro ? 'text-amber-900 dark:text-amber-200' : 'text-slate-950'}`}>
                  {isPro
                    ? (lang === 'np' ? 'SarkariSajha प्रो सक्रिय' : 'SarkariSajha Pro Active')
                    : (lang === 'np' ? 'SarkariSajha प्रो सदस्यता' : 'Upgrade to SarkariSajha Pro')}
                </h4>
                <p className={`text-[11px] ${isPro ? 'text-amber-800 dark:text-amber-300' : 'text-slate-900'}`}>
                  {lang === 'np'
                    ? 'असीमित एआई मूल्यांकन, सिमुलेटर तथा अफलाइन मोडल'
                    : 'Unlimited AI subjective evaluations & custom drills'}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${isPro ? 'text-amber-700 dark:text-amber-300' : 'text-slate-950'}`} />
          </div>
        )}

        {/* Quick Utility Toggles (Theme, Language, Google Sheets, PWA Install) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Mode (लाइट)</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Dark Mode (डार्क)</span>
              </>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'np' : 'en')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{lang === 'en' ? 'नेपालीमा स्विच' : 'Switch English'}</span>
          </button>

          {/* Google Sheets Sync */}
          {onOpenSheetsModal && (
            <button
              onClick={() => {
                onClose();
                onOpenSheetsModal();
              }}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition hover:bg-emerald-100"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Google Sheets</span>
            </button>
          )}

          {/* Install App (PWA) Button */}
          {onOpenInstallPrompt && (
            <button
              onClick={() => {
                onClose();
                onOpenInstallPrompt();
              }}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold transition hover:bg-blue-100"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>{isInstalled ? 'App Settings' : (lang === 'np' ? 'एप इन्स्टल' : 'Install App')}</span>
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="space-y-2 pt-1">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            {lang === 'np' ? 'मुख्य पृष्ठहरू' : 'All Application Modules'}
          </h4>

          <div className="grid grid-cols-1 gap-2">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-200 shadow-xs'
                      : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{item.label}</span>
                        {item.badge && (
                          <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded font-mono">
                            {item.badge}
                          </span>
                        )}
                        {item.count !== undefined && item.count > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                            {item.count}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Legal & Policies */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-slate-500 dark:text-slate-400">
            <button
              onClick={() => handleSelectNav('about')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              {lang === 'np' ? 'हाम्रो बारेमा' : 'About Us'}
            </button>
            <span>•</span>
            <button
              onClick={() => handleSelectNav('disclaimer')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              {lang === 'np' ? 'अस्वीकरण' : 'Disclaimer'}
            </button>
            <span>•</span>
            <button
              onClick={() => handleSelectNav('privacy')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              {lang === 'np' ? 'गोपनीयता' : 'Privacy'}
            </button>
            <span>•</span>
            <button
              onClick={() => handleSelectNav('terms')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              {lang === 'np' ? 'सर्तहरू' : 'Terms'}
            </button>
            <span>•</span>
            <button
              onClick={() => handleSelectNav('contact')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              {lang === 'np' ? 'सम्पर्क' : 'Contact'}
            </button>
          </div>
        </div>

        {/* Beta Feedback & Survey */}
        {onOpenBetaFeedback && (
          <div className="pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenBetaFeedback();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition shadow-xs hover:bg-rose-100"
            >
              <MessageSquarePlus className="w-4 h-4 text-rose-600" />
              <span>{lang === 'np' ? 'प्रतिक्रिया तथा सर्वेक्षण' : 'Beta Feedback & Survey'}</span>
            </button>
          </div>
        )}

        {/* Authentication Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
              firebaseUser
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-md'
            }`}
          >
            {firebaseUser ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{lang === 'np' ? 'खाता व्यवस्थापन / स्विच' : 'Manage / Switch Account'}</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                <span>{lang === 'np' ? 'लगइन / साइन अप गर्नुहोस्' : 'Sign In / Register'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
