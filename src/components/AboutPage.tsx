import React from 'react';
import { ArrowLeft, Target, Users, BookOpen, Sparkles, ShieldCheck, Award, HeartHandshake } from 'lucide-react';
import { Language } from '../types';

interface AboutPageProps {
  lang: Language;
  onNavigateHome: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ lang, onNavigateHome, onNavigateTab }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Back button */}
      <button
        onClick={onNavigateHome}
        className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-6 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        {lang === 'np' ? 'गृहपृष्ठमा फर्कनुहोस्' : 'Back to Home'}
      </button>

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 text-white p-6 sm:p-10 mb-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wide uppercase mb-3">
          {lang === 'np' ? 'हाम्रो बारेमा' : 'About SarkariSajha'}
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          {lang === 'np'
            ? 'नेपालको सार्वजनिक सेवा तयारी तथा रोजगारी सूचना मञ्च'
            : 'Empowering Nepal’s Public Service Aspirants'}
        </h1>
        <p className="text-sm sm:text-base text-blue-100 mt-3 max-w-2xl leading-relaxed">
          SarkariSajha is dedicated to democratizing access to government job information, comprehensive syllabus guides, and AI-assisted exam preparation for candidates across all 7 provinces of Nepal.
        </p>
      </div>

      {/* Core Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {lang === 'np' ? 'हाम्रो लक्ष्य (Our Mission)' : 'Our Mission'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            To eliminate the information asymmetry faced by rural and provincial job seekers by delivering verified, real-time vacancy alerts, clear eligibility criteria breakdown, and modern digital study tools.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {lang === 'np' ? 'हाम्रो दृष्टिकोण (Our Vision)' : 'Our Vision'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            To be Nepal’s most trusted, candidate-first digital companion for Lok Sewa Aayog, Shikshak Sewa Aayog, Banking, and Provincial public sector careers.
          </p>
        </div>
      </div>

      {/* Platform Pillars */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-10 space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {lang === 'np' ? 'हामी के सेवाहरू प्रदान गर्दछौं?' : 'What We Provide to Candidates'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Verified Gazette Notices</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Cleanly parsed quota splits, fee schedules, and direct PDF downloads.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <Award className="w-5 h-5 text-emerald-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Daily Mock Quizzes</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Timed GK & IQ tests matching official negative marking schemes (20%).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Career Intelligence</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Instant degree eligibility matching and subjective answer evaluation.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action CTAs */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => onNavigateTab('vacancies')}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
        >
          {lang === 'np' ? 'हाल खुलेका विज्ञापनहरू हेर्नुहोस्' : 'Explore Open Vacancies'}
        </button>
        <button
          onClick={() => onNavigateTab('quizzes')}
          className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition"
        >
          {lang === 'np' ? 'नमुना परीक्षा अभ्यास गर्नुहोस्' : 'Practice Mock Test'}
        </button>
      </div>
    </div>
  );
};
