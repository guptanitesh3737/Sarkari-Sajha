import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Send,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Building2,
  FileWarning
} from 'lucide-react';
import { Language, VacancyReportType, Vacancy } from '../types';

interface VacancyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  vacancy: Vacancy | null;
  userEmail?: string;
  userId?: string;
}

export const VacancyReportModal: React.FC<VacancyReportModalProps> = ({
  isOpen,
  onClose,
  lang,
  vacancy,
  userEmail = '',
  userId = ''
}) => {
  const [reportType, setReportType] = useState<VacancyReportType>('incorrect_info');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !vacancy) return null;

  const reportReasons: { type: VacancyReportType; labelEn: string; labelNp: string }[] = [
    { type: 'incorrect_info', labelEn: 'Incorrect Information', labelNp: 'गलत विवरण' },
    { type: 'wrong_deadline', labelEn: 'Wrong Deadline Date', labelNp: 'गलत म्याद मिति' },
    { type: 'wrong_qualification', labelEn: 'Wrong Qualification Level', labelNp: 'गलत योग्यता तह' },
    { type: 'broken_official_link', labelEn: 'Broken Official Application Link', labelNp: 'आधिकारिक फाराम लिङ्क नखुलेको' },
    { type: 'expired_vacancy', labelEn: 'Expired Vacancy Still Marked Active', labelNp: 'म्याद सकिएको विज्ञापन' },
    { type: 'duplicate_vacancy', labelEn: 'Duplicate Notice', labelNp: 'दोहोरिएको विज्ञापन' },
    { type: 'other', labelEn: 'Other Discrepancy', labelNp: 'अन्य समस्या' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/vacancies/${vacancy.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          description,
          userEmail,
          userId
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setDescription('');
          onClose();
        }, 2200);
      }
    } catch (err) {
      console.error('Vacancy report error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-lg overflow-hidden transition-all shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between bg-rose-50/40 dark:bg-rose-950/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-xs">
              <FileWarning className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {lang === 'np' ? 'विज्ञापन विवरण समस्या रिपोर्ट' : 'Report Vacancy Notice Issue'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'np' ? 'आधिकारिक राजपत्र अनुसार प्रमाणीकरण गरिनेछ' : 'Will be audited against official Nepal Gazette'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'np' ? 'रिपोर्ट सफलतापूर्वक दर्ता भयो' : 'Verification Report Submitted'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {lang === 'np'
                  ? 'हाम्रो सम्पादक मण्डलले मूल सूचना रुजु गरी त्रुटि भए तत्काल सच्याउनेछ।'
                  : 'Our editorial board will verify the primary notice and correct any inaccuracies immediately.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Notice Brief Card */}
              <div className="p-3 bg-sky-50/70 dark:bg-slate-950/60 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{vacancy.organization || vacancy.org || 'Official Authority'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate mt-0.5">
                  {vacancy.title}
                </p>
              </div>

              {/* Issue Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {lang === 'np' ? 'समस्याको प्रकार छान्नुहोस्:' : 'Issue Category:'}
                </label>
                <div className="space-y-1.5">
                  {reportReasons.map((reason) => (
                    <label
                      key={reason.type}
                      className={`flex items-center p-2.5 rounded-xl border cursor-pointer transition text-xs font-medium ${
                        reportType === reason.type
                          ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason.type}
                        checked={reportType === reason.type}
                        onChange={() => setReportType(reason.type)}
                        className="mr-2.5 text-rose-600 focus:ring-sky-300"
                      />
                      <span>{lang === 'np' ? reason.labelNp : reason.labelEn}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Explanation Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'np' ? 'विस्तृत कारण / आधिकारिक स्रोतको सन्दर्भ:' : 'Details & Official Citation:'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    lang === 'np'
                      ? 'जस्तै: आधिकारिक सूचनामा अन्तिम मिति २०८३/०५/१५ छ तर यहाँ २०८३/०५/१० देखाइएको छ...'
                      : 'e.g. Official gazette states single-fee deadline is 2026-08-25, but notice lists 2026-08-20...'
                  }
                  className="w-full px-3.5 py-2.5 bg-sky-50/70 dark:bg-slate-950 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Public Gazette Integrity</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition"
                  >
                    {lang === 'np' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || !description.trim()}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-full transition flex items-center gap-2 shadow-xs"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{lang === 'np' ? 'रिपोर्ट पेश गर्नुहोस्' : 'Submit Report'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
