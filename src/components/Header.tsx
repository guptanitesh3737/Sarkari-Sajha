import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  Sparkles,
  FileText,
  Trophy,
  BookmarkCheck,
  ShieldAlert,
  Crown,
  Download,
  MessageSquarePlus,
  FileSpreadsheet,
  UserRound
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

/** Four-petal brand mark, echoing the reference logo. */
export const BrandMark: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <g fill="#3b8fd6">
      <circle cx="16" cy="8.5" r="6.5" />
      <circle cx="16" cy="23.5" r="6.5" />
      <circle cx="8.5" cy="16" r="6.5" />
      <circle cx="23.5" cy="16" r="6.5" />
    </g>
    <circle cx="16" cy="16" r="3.2" fill="#fff" />
  </svg>
);

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
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.status === 'sent').length + unreadInAppCount;
  const isPro = subscription?.tier === 'pro' || subscription?.tier === 'yearly_pro';
  const canAdmin = isAdmin || (userRole && ['editor', 'admin', 'super_admin'].includes(userRole));

  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [moreOpen]);

  const primary = [
    { id: 'vacancies', label: lang === 'np' ? 'विज्ञापन' : 'Vacancies' },
    { id: 'syllabus', label: lang === 'np' ? 'पाठ्यक्रम' : 'Syllabus' },
    { id: 'quizzes', label: lang === 'np' ? 'क्विज' : 'Quiz' },
    { id: 'ai_assistant', label: lang === 'np' ? 'एआई सहायक' : 'AI Assistant' },
    { id: 'dashboard', label: lang === 'np' ? 'ड्यासबोर्ड' : 'Dashboard' }
  ];

  const secondary = [
    { id: 'tracker', label: t('navTracker', lang), icon: BookmarkCheck },
    { id: 'matcher', label: t('navMatcher', lang), icon: Sparkles },
    { id: 'subjective', label: t('navSubjective', lang), icon: FileText },
    { id: 'leaderboard', label: t('navLeaderboard', lang), icon: Trophy },
    { id: 'alerts', label: t('navAlerts', lang), icon: Bell },
    ...(canAdmin ? [{ id: 'admin', label: t('navAdmin', lang), icon: ShieldAlert }] : [])
  ];

  const utilities = [
    onOpenSubscription && {
      label: isPro ? (lang === 'np' ? 'प्रो सदस्य' : 'Pro membership') : lang === 'np' ? 'प्रो सदस्यता' : 'Upgrade to Pro',
      icon: Crown,
      onClick: onOpenSubscription
    },
    onOpenInstallPrompt && { label: lang === 'np' ? 'एप इन्स्टल' : 'Install app', icon: Download, onClick: onOpenInstallPrompt },
    onOpenSheetsModal && { label: 'Google Sheets sync', icon: FileSpreadsheet, onClick: onOpenSheetsModal },
    onOpenBetaFeedback && {
      label: lang === 'np' ? 'प्रतिक्रिया' : 'Send feedback',
      icon: MessageSquarePlus,
      onClick: onOpenBetaFeedback
    },
    firebaseUser && { label: lang === 'np' ? 'खाता' : 'Account & sign-in', icon: UserRound, onClick: onOpenAuth }
  ].filter(Boolean) as { label: string; icon: React.ElementType; onClick: () => void }[];

  const secondaryActive = secondary.some((s) => s.id === activeTab);
  const initial = (userProfile.name || firebaseUser?.displayName || firebaseUser?.email || 'U').trim().charAt(0).toUpperCase();

  // No `display` here so callers can choose `inline-flex` or `hidden sm:inline-flex` without a conflict.
  const iconBtn =
    'relative w-9 h-9 items-center justify-center rounded-full text-ink-soft hover:text-ink hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 transition';

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 sm:pt-4">
      <div className="max-w-6xl mx-auto h-14 sm:h-16 pl-4 sm:pl-5 pr-2 flex items-center justify-between gap-3 rounded-full bg-white/90 dark:bg-slate-900/85 backdrop-blur-md shadow-soft ring-1 ring-black/[0.04] dark:ring-white/10">
        {/* Brand */}
        <button
          onClick={() => setActiveTab('vacancies')}
          className="flex items-center gap-2 shrink-0"
          aria-label="SarkariSajha home"
        >
          <BrandMark />
          <span className="font-display text-lg sm:text-xl font-semibold tracking-tight text-ink dark:text-white">
            {lang === 'np' ? 'सरकारी साझा' : 'SarkariSajha'}
          </span>
        </button>

        {/* Primary nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
          {primary.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`px-3 xl:px-3.5 py-2 rounded-full text-[15px] whitespace-nowrap transition ${
                  active
                    ? 'text-ink dark:text-white font-medium'
                    : 'text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              className={`px-3 xl:px-3.5 py-2 rounded-full text-[15px] whitespace-nowrap inline-flex items-center gap-1 transition ${
                secondaryActive
                  ? 'text-ink dark:text-white font-medium'
                  : 'text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {lang === 'np' ? 'थप' : 'More'}
              <ChevronDown className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreOpen && (
              <div className="absolute right-0 mt-3 w-64 p-2 rounded-3xl bg-white dark:bg-slate-900 shadow-soft ring-1 ring-black/5 dark:ring-white/10">
                {secondary.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMoreOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-left transition ${
                        active
                          ? 'bg-sky-100 text-ink dark:bg-white/10 dark:text-white'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 opacity-70" />
                      <span className="flex-1">{item.label}</span>
                      {item.id === 'alerts' && unreadCount > 0 && (
                        <span className="text-[11px] font-medium text-ink-soft dark:text-slate-400">{unreadCount}</span>
                      )}
                    </button>
                  );
                })}
                {utilities.length > 0 && <div className="my-2 h-px bg-slate-100 dark:bg-white/10" />}
                {utilities.map((u) => {
                  const Icon = u.icon;
                  return (
                    <button
                      key={u.label}
                      onClick={() => {
                        u.onClick();
                        setMoreOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-left text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5 transition"
                    >
                      <Icon className="w-4 h-4 opacity-70" />
                      <span>{u.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setLang(lang === 'en' ? 'np' : 'en')}
            className={`${iconBtn} hidden sm:inline-flex lg:hidden xl:inline-flex text-[13px] font-medium`}
            title={lang === 'en' ? 'नेपालीमा हेर्नुहोस्' : 'View in English'}
          >
            {lang === 'en' ? 'ने' : 'EN'}
          </button>
          {onOpenNotificationCenter && (
            <button onClick={onOpenNotificationCenter} className={`${iconBtn} inline-flex`} title={lang === 'np' ? 'सूचनाहरू' : 'Notifications'}>
              <Bell className="w-[18px] h-[18px]" />
              {unreadInAppCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          )}

          {firebaseUser ? (
            <button
              onClick={onOpenProfile}
              className="ml-1 w-10 h-10 rounded-full bg-ink dark:bg-white text-white dark:text-ink font-display font-semibold inline-flex items-center justify-center shadow-pill"
              title={firebaseUser.email || firebaseUser.phoneNumber || 'Profile'}
            >
              {initial}
            </button>
          ) : (
            <>
              <button
                onClick={onOpenAuth}
                className="hidden sm:inline-flex lg:hidden xl:inline-flex px-3 py-2 text-[15px] whitespace-nowrap text-ink dark:text-white hover:opacity-70 transition"
              >
                {lang === 'np' ? 'लगइन' : 'Login'}
              </button>
              <button
                onClick={onOpenAuth}
                className="ml-1 whitespace-nowrap px-4 sm:px-5 h-10 sm:h-11 rounded-full bg-ink dark:bg-white text-white dark:text-ink text-sm sm:text-[15px] font-medium shadow-pill hover:bg-black transition"
              >
                {lang === 'np' ? 'सुरु गर्नुहोस्' : 'Get started'}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
