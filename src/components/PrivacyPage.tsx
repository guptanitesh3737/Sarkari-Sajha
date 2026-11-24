import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Server, RefreshCw } from 'lucide-react';
import { Language } from '../types';

interface PrivacyPageProps {
  lang: Language;
  onNavigateHome: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ lang, onNavigateHome }) => {
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
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-blue-400">
              {lang === 'np' ? 'गोपनीयता नीति' : 'User Privacy & Data Protection'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-0.5">
              {lang === 'np' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}
            </h1>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Effective Date: August 2026 | Compliant with Nepal Privacy Act 2075 & International Data Protection Standards
        </p>
      </div>

      {/* Policy Sections */}
      <div className="space-y-6">
        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 space-y-3 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-500" />
            1. Information We Collect & Voluntary Candidate Data
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            We collect information provided directly by you when creating an account or updating your candidate profile. Providing profile information is entirely voluntary and is used to maximize the accuracy of government job matching and syllabus tracking:
          </p>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-5">
            <li><strong>Personal Identity:</strong> Full Name, Email Address, Phone Number (optional for SMS vacancy alerts), Date of Birth, Age, and optional Profile Avatar.</li>
            <li><strong>Geographic & Electoral Residence:</strong> Province (Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, Sudurpashchim), District, Municipality, and Ward number for localized provincial Lok Sewa quota matching.</li>
            <li><strong>Educational Background:</strong> Highest qualification level (SEE/SLC, +2 High School, Bachelor Degree, Master Degree, MPhil/PhD), field/stream of study, board/university, and year of graduation.</li>
            <li><strong>Target Exam Profile & Preferences:</strong> Exam aspirations (Gazetted Section Officer, Nayab Subba, Kharidar, Banking, TSC, Nepal Police, IT), preferred government ministries, and syllabus alert preferences.</li>
            <li><strong>Practice & Activity Records:</strong> Timed quiz submissions, accuracy rates, streak records, saved vacancy bookmarks, and user-initiated notes in the application tracker.</li>
          </ul>
        </div>

        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 space-y-3 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            2. How We Use Candidate Information
          </h2>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-5">
            <li><strong>Precision Job Matching:</strong> To match open vacancies against your specific qualification level, minimum age requirements, and home province quotas.</li>
            <li><strong>Deadline Radar & Alerts:</strong> To calculate days remaining before single-fee and double-fee closing dates and trigger timely alerts before deadlines expire.</li>
            <li><strong>Performance Analytics & AI Coaching:</strong> To generate personalized study plans, weakness diagnosis, and syllabus revision quizzes based on past attempts.</li>
            <li><strong>Zero Commercial Data Selling:</strong> We <strong>never</strong> sell, rent, monetize, or trade candidate personal data or phone numbers to third parties, private coaching centers, or marketing agencies.</li>
          </ul>
        </div>

        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 space-y-3 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-500" />
            3. Security, Payment Safeguards & Cloud Storage
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              All data is encrypted in transit using TLS 1.3 and at rest on Google Cloud Firestore with Attribute-Based Access Control (ABAC) and role-based security rules.
            </p>
            <p>
              <strong>Zero Financial Credential Storage:</strong> SarkariSajha <strong>never</strong> collects, processes, or stores your bank account numbers, debit/credit card details, PINs, or digital wallet passwords. All subscription payments are processed directly through authorized Nepal payment networks (eSewa, Khalti, ConnectIPS, Fonepay QR). We only store the transaction reference ID for billing verification.
            </p>
            <p>
              <strong>Administrative Access Controls & PII Isolation:</strong> General administrators and content editors have zero access to candidate personally identifiable information (PII). Access is restricted strictly to verified Super Administrators under tamper-evident audit logging.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 space-y-3 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-500" />
            4. Candidate Data Rights, Export & Account Deletion
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            In strict accordance with Nepal's Privacy Act 2075 (वैयक्तिक गोपनीयता सम्बन्धी ऐन, २०७५), candidates retain full autonomy over their digital identity:
          </p>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-5">
            <li><strong>Right to Access & Rectify:</strong> You can review, update, or edit any profile information at any time from your candidate profile console.</li>
            <li><strong>Right to Data Portability:</strong> You can download your mock test history and saved vacancies directly.</li>
            <li><strong>Right to Permanent Deletion:</strong> You can request immediate, permanent deletion of your account and personal profile data at any time by navigating to <em>Profile → Delete Account</em> or submitting a request to <span className="font-semibold text-blue-600 dark:text-blue-400">privacy@sarkarisajha.com</span>. Upon confirmation, all personal identifiers, phone numbers, and resumes are irreversibly purged from our production Firestore database.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
