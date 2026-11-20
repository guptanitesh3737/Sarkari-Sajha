import React from 'react';
import {
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  ShieldAlert,
  FileText,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Bot,
  Trophy,
  BookmarkCheck,
  Globe,
  Sun,
  Moon,
  Smartphone,
  Heart
} from 'lucide-react';
import { Language, Theme } from '../types';

interface FooterProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenInstallPrompt?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  activeTab,
  setActiveTab,
  onOpenInstallPrompt
}) => {
  return (
    <footer className="mt-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 transition-colors duration-200">
      {/* Top Disclaimer Highlight Banner */}
      <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-300/60 dark:border-amber-800/60 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-amber-200/90 leading-relaxed">
              <span className="font-bold text-amber-900 dark:text-amber-300 mr-1">
                {lang === 'np' ? 'आधिकारिक अस्वीकरण:' : 'Official Disclaimer:'}
              </span>
              "SarkariSajha is an independent information and exam-preparation platform. It is not an official government website. Users should verify vacancy information, eligibility, deadlines and application procedures through the relevant official government authority."
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                <span>SS</span>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                Sarkari<span className="text-blue-600 dark:text-blue-400">Sajha</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                v2.4
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              {lang === 'np'
                ? 'नेपाल सरकार, लोक सेवा आयोग, शिक्षक सेवा आयोग, बैंकिङ तथा प्रादेशिक विज्ञापनहरूको विश्वसनीय सूचना तथा एआई आधारित परीक्षा तयारी पोर्टल।'
                : 'Nepal’s trusted public service job aggregator & AI-driven exam preparation portal. Curating verified gazette notices, syllabus outlines, and daily practice tests.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setLang(lang === 'en' ? 'np' : 'en')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>{lang === 'en' ? 'नेपाली भाषा' : 'English Mode'}</span>
              </button>

              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition cursor-pointer"
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-indigo-500" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>

              {onOpenInstallPrompt && (
                <button
                  onClick={onOpenInstallPrompt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
              )}
            </div>
          </div>

          {/* Exam Prep & Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {lang === 'np' ? 'तयारी तथा उपकरण' : 'Preparation Tools'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('vacancies')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  {lang === 'np' ? 'खुला विज्ञापनहरू' : 'All Vacancies'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('quizzes')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  {lang === 'np' ? 'दैनिक नमुना क्विज' : 'Mock Test Quizzes'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('syllabus')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  {lang === 'np' ? 'पाठ्यक्रम तथा नोट्स' : 'Syllabus Browser'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('ai_assistant')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  {lang === 'np' ? 'एआई करियर सहायक' : 'AI Career Assistant'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('subjective')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  {lang === 'np' ? 'लिखित उत्तर मूल्याङ्कन' : 'Subjective Evaluator'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  {lang === 'np' ? 'राष्ट्रिय लिडरबोर्ड' : 'National Leaderboard'}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Company Pages */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {lang === 'np' ? 'संस्थागत तथा कानुनी' : 'Company & Legal'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer ${activeTab === 'about' ? 'text-blue-600 font-bold' : ''}`}
                >
                  {lang === 'np' ? 'हाम्रो बारेमा (About Us)' : 'About Us'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('disclaimer')}
                  className={`hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer ${activeTab === 'disclaimer' ? 'text-blue-600 font-bold' : ''}`}
                >
                  {lang === 'np' ? 'अस्वीकरण (Disclaimer)' : 'Legal Disclaimer'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer ${activeTab === 'privacy' ? 'text-blue-600 font-bold' : ''}`}
                >
                  {lang === 'np' ? 'गोपनीयता नीति (Privacy)' : 'Privacy Policy'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('terms')}
                  className={`hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer ${activeTab === 'terms' ? 'text-blue-600 font-bold' : ''}`}
                >
                  {lang === 'np' ? 'सेवाका सर्तहरू (Terms)' : 'Terms of Service'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer ${activeTab === 'contact' ? 'text-blue-600 font-bold' : ''}`}
                >
                  {lang === 'np' ? 'सम्पर्क तथा सहायता' : 'Contact & Support'}
                </button>
              </li>
            </ul>
          </div>

          {/* Official Government Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {lang === 'np' ? 'आधिकारिक निकायहरू' : 'Official Portals'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://pps.psc.gov.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <span>Lok Sewa (PSC Online)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://online.tsc.gov.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <span>TSC Online Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://psc.gov.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <span>PSC Central Gazette</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://nrb.org.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <span>Nepal Rastra Bank</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Status Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <div>
            © {new Date().getFullYear()} SarkariSajha. All rights reserved. Kathmandu, Nepal.
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Services Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
