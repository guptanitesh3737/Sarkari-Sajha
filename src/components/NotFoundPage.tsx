import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Briefcase,
  GraduationCap,
  Award,
  Bot,
  HelpCircle,
  Home,
  Sparkles
} from 'lucide-react';
import { Language } from '../types';

interface NotFoundPageProps {
  lang: Language;
  onNavigateHome: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ lang, onNavigateHome, onNavigateTab }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateTab('vacancies');
  };

  const quickLinks = [
    {
      id: 'vacancies',
      title: lang === 'np' ? 'खुला विज्ञापनहरू' : 'Open Vacancies',
      desc: lang === 'np' ? 'लोक सेवा तथा बैंकिङ विज्ञापन' : 'Lok Sewa, TSC & Banking jobs',
      icon: Briefcase,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60'
    },
    {
      id: 'syllabus',
      title: lang === 'np' ? 'पाठ्यक्रम तथा नोट्स' : 'Exam Syllabus',
      desc: lang === 'np' ? 'अधिकृत, नासु, खरिदार पाठ्यक्रम' : 'PSC chapter outlines & notes',
      icon: GraduationCap,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'quizzes',
      title: lang === 'np' ? 'नमुना परीक्षा क्विज' : 'Mock Test Lab',
      desc: lang === 'np' ? 'दैनिक सामान्य ज्ञान व आइक्यू' : 'Daily GK & IQ timed practice',
      icon: Award,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
    },
    {
      id: 'ai_assistant',
      title: lang === 'np' ? 'एआई करियर सहायक' : 'AI Assistant',
      desc: lang === 'np' ? 'योग्यता तथा तयारी सल्लाह' : 'Eligibility & study blueprints',
      icon: Bot,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 text-center">
      {/* 404 Visual badge */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-black text-3xl mb-6 shadow-sm">
        404
      </div>

      <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
        {lang === 'np' ? 'पृष्ठ फेला परेन (Page Not Found)' : 'Page Not Found'}
      </h1>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        {lang === 'np'
          ? 'तपाईंले खोज्नुभएको पृष्ठ हटाइएको, नाम परिवर्तन गरिएको वा अस्थायी रूपमा अनुपलब्ध हुन सक्छ।'
          : 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'}
      </p>

      {/* Quick Search Bar */}
      <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'np' ? 'सरकारी पद वा विज्ञापन खोज्नुहोस्...' : 'Search vacancies, syllabus, or quizzes...'}
            className="w-full pl-10 pr-24 py-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-300 shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 text-xs font-bold rounded-full transition cursor-pointer bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
          >
            {lang === 'np' ? 'खोज्नुहोस्' : 'Search'}
          </button>
        </div>
      </form>

      {/* Navigation Quick Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigateTab(item.id)}
              className="p-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition flex items-center gap-3.5 group cursor-pointer text-left"
            >
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Return Home Button */}
      <button
        onClick={onNavigateHome}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition cursor-pointer"
      >
        <Home className="w-4 h-4" />
        <span>{lang === 'np' ? 'गृहपृष्ठमा फर्कनुहोस्' : 'Return to Home'}</span>
      </button>
    </div>
  );
};
