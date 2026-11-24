import React from 'react';
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, Scale, ShieldAlert } from 'lucide-react';
import { Language } from '../types';

interface TermsPageProps {
  lang: Language;
  onNavigateHome: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ lang, onNavigateHome }) => {
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
      <div className="hero-panel p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-indigo-400">
              {lang === 'np' ? 'सेवाका सर्तहरू' : 'Terms of Service'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-0.5">
              {lang === 'np' ? 'सेवाका सर्तहरू (Terms of Service)' : 'Terms of Service'}
            </h1>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Last Revised: August 2026 | Governing Law: Federal Democratic Republic of Nepal
        </p>
      </div>

      {/* Content Cards */}
      <div className="space-y-6">
        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 space-y-3 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            1. Acceptance of Terms
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            By accessing or using SarkariSajha website, mobile web application, or API services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </div>

        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 space-y-3 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            2. Platform Role & Non-Government Disclaimer
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            SarkariSajha is an independent educational and informative web portal. It is not an official government agency and does not process official government job applications or collect official examination fees. All formal job applications must be submitted through the designated official government portals (e.g. pps.psc.gov.np).
          </p>
        </div>

        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 space-y-3 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-500" />
            3. Intellectual Property & Study Materials
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            All proprietary mock tests, AI evaluation algorithms, UI design systems, and curated explanations are the intellectual property of SarkariSajha. Official government syllabus outlines, gazette notices, and constitutional texts belong to the respective Government of Nepal bodies and are referenced under fair use and public information dissemination rights.
          </p>
        </div>

        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 space-y-3 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            4. Limitation of Liability
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            SarkariSajha strives for 100% accuracy in date calculations, quota numbers, and syllabus changes. However, SarkariSajha and its editorial team shall not be held liable for any missed application deadlines, changes in recruitment schedules by public commissions, or technical errors resulting from external disruptions.
          </p>
        </div>
      </div>
    </div>
  );
};
