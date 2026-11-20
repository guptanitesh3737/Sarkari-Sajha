import React from 'react';
import {
  Briefcase,
  GraduationCap,
  Award,
  Bot,
  Menu,
  Sparkles
} from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';

interface MobileNavigationBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  onOpenMoreDrawer: () => void;
  unreadCount?: number;
}

export const MobileNavigationBar: React.FC<MobileNavigationBarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  onOpenMoreDrawer,
  unreadCount = 0
}) => {
  // Main 4 thumb tabs + More Drawer toggle
  const primaryTabs = [
    {
      id: 'vacancies',
      label: lang === 'np' ? 'विज्ञापन' : 'Vacancies',
      icon: Briefcase
    },
    {
      id: 'syllabus',
      label: lang === 'np' ? 'पाठ्यक्रम' : 'Syllabus',
      icon: GraduationCap
    },
    {
      id: 'quizzes',
      label: lang === 'np' ? 'क्विज' : 'Quiz Lab',
      icon: Award
    },
    {
      id: 'ai_assistant',
      label: lang === 'np' ? 'एआई सहायक' : 'AI Career',
      icon: Bot,
      isAi: true
    }
  ];

  const isMoreTabActive = !primaryTabs.some(t => t.id === activeTab);

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 lg:hidden shadow-lg pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full relative transition-all cursor-pointer select-none ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {/* Active top indicator pill */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-blue-600 dark:bg-blue-500 rounded-b-full shadow-xs" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-blue-600 dark:text-blue-400' : ''}`} />
                {tab.isAi && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                )}
              </div>

              <span className="text-[10px] mt-1 leading-tight tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* 5th Tab: More / Menu Drawer */}
        <button
          onClick={onOpenMoreDrawer}
          className={`flex flex-col items-center justify-center h-full relative transition-all cursor-pointer select-none ${
            isMoreTabActive
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {isMoreTabActive && (
            <span className="absolute top-0 w-8 h-1 bg-blue-600 dark:bg-blue-500 rounded-b-full shadow-xs" />
          )}

          <div className="relative">
            <Menu className={`w-5 h-5 transition-transform ${isMoreTabActive ? 'scale-110 text-blue-600 dark:text-blue-400' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white font-black text-[9px] px-1 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>

          <span className="text-[10px] mt-1 leading-tight tracking-tight">
            {lang === 'np' ? 'थप' : 'More'}
          </span>
        </button>
      </div>
    </nav>
  );
};
