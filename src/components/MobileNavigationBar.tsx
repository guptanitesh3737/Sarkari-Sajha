import React from 'react';
import {
  Briefcase,
  GraduationCap,
  Award,
  Bot,
  Menu
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
      label: lang === 'np' ? 'क्विज' : 'Quiz',
      icon: Award
    },
    {
      id: 'ai_assistant',
      label: lang === 'np' ? 'एआई' : 'AI',
      icon: Bot
    }
  ];

  const isMoreTabActive = !primaryTabs.some(t => t.id === activeTab);

  const tabClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 h-12 rounded-full transition select-none ${
      active
        ? 'bg-ink text-white dark:bg-white dark:text-ink'
        : 'text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white'
    }`;

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pointer-events-none"
    >
      <div className="pointer-events-auto max-w-md mx-auto grid grid-cols-5 gap-1 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-soft ring-1 ring-black/[0.05] dark:ring-white/10">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={tabClass(isActive)} aria-current={isActive ? 'page' : undefined}>
              <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[10px] leading-none">{tab.label}</span>
            </button>
          );
        })}

        <button onClick={onOpenMoreDrawer} className={tabClass(isMoreTabActive)}>
          <span className="relative">
            <Menu className="w-[18px] h-[18px]" strokeWidth={isMoreTabActive ? 2.2 : 1.8} />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-rose-500" />}
          </span>
          <span className="text-[10px] leading-none">{lang === 'np' ? 'थप' : 'More'}</span>
        </button>
      </div>
    </nav>
  );
};
