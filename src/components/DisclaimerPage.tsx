import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, ExternalLink, ArrowLeft, Building2 } from 'lucide-react';
import { Language } from '../types';

interface DisclaimerPageProps {
  lang: Language;
  onNavigateHome: () => void;
}

export const DisclaimerPage: React.FC<DisclaimerPageProps> = ({ lang, onNavigateHome }) => {
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
      <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-700/60 p-6 sm:p-8 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-md border border-amber-300/60">
              {lang === 'np' ? 'आधिकारिक अस्वीकरण' : 'Official Platform Disclaimer'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {lang === 'np' ? 'अस्वीकरण तथा प्रयोगका सर्तहरू' : 'Legal & Public Disclaimer'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Last Updated: August 2026 | SarkariSajha Public Notice
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Required Disclaimer Box */}
      <div className="rounded-2xl bg-amber-500/15 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-amber-900 dark:text-amber-200 mb-2">
              {lang === 'np' ? 'अनिवार्य सूचना तथा अस्वीकरण' : 'Core Statutory Notice'}
            </h2>
            <blockquote className="text-sm sm:text-base font-semibold text-slate-900 dark:text-amber-100 leading-relaxed italic border-l-4 border-amber-500 pl-4 py-1">
              "SarkariSajha is an independent information and exam-preparation platform. It is not an official government website. Users should verify vacancy information, eligibility, deadlines and application procedures through the relevant official government authority."
            </blockquote>
            {lang === 'np' && (
              <p className="text-xs sm:text-sm text-slate-700 dark:text-amber-200/90 mt-3 border-l-4 border-amber-400 pl-4">
                "सरकारीसाझा एक स्वतन्त्र सूचना तथा परीक्षा तयारी मञ्च हो। यो कुनै आधिकारिक सरकारी वेबसाइट होइन। प्रयोगकर्ताहरूले विज्ञापन सम्बन्धी सम्पूर्ण विवरण, योग्यता, म्याद र आवेदन प्रक्रिया सम्बन्धित आधिकारिक सरकारी निकायबाट अनिवार्य रूपमा रुजु गर्नुपर्दछ।"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Key Clarifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Building2 className="w-4 h-4 text-blue-500" />
            {lang === 'np' ? '१. स्वतन्त्र संस्थागत स्वरूप' : '1. Independent Entity Status'}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            SarkariSajha operates independently to aggregate, organize, and summarize public gazette notices, recruitment bulletins, and syllabus guidelines. We are not affiliated with, endorsed by, or representing the Public Service Commission (Lok Sewa Aayog), Teachers Service Commission (TSC), or any Government of Nepal Ministry.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {lang === 'np' ? '२. सूचनाको प्रमाणीकरण' : '2. Verification Responsibility'}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            While our editorial team rigorously audits every posted notice against official publications (Nepal Rajpatra), candidates are solely responsible for verifying final application deadlines, fee voucher details, and quota eligibilities directly on the issuing authority's online portal (e.g. pps.psc.gov.np, tsc.gov.np).
          </p>
        </div>
      </div>

      {/* Official Government Portals Directory */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>{lang === 'np' ? 'आधिकारिक सरकारी अनलाइन आवेदन पोर्टलहरू' : 'Official Government Application Portals'}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a
            href="https://pps.psc.gov.np"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
          >
            <span>Lok Sewa Aayog (PSC Online Application)</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
          </a>
          <a
            href="https://online.tsc.gov.np"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
          >
            <span>Teacher Service Commission (TSC Portal)</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
          </a>
          <a
            href="https://psc.gov.np"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
          >
            <span>Public Service Commission Central Gazette</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
          </a>
          <a
            href="https://nrb.org.np"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
          >
            <span>Nepal Rastra Bank Career Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
          </a>
        </div>
      </div>
    </div>
  );
};
