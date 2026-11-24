import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Calendar,
  DollarSign,
  Users,
  ShieldCheck,
  Building
} from 'lucide-react';
import { PdfParsedNoticeResult, Vacancy, Language } from '../types';
import { normalizeVacancy } from '../utils/vacancyUtils';

interface AdminPdfParserModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedVacancy?: (parsed: Partial<Vacancy>) => void;
  onPublishSuccess?: (newVacancy: Vacancy) => void;
}

const SAMPLE_GAZETTE_NOTICE_TEXT = `
लोक सेवा आयोग, केन्द्रीय कार्यालय
सूचना तथा विज्ञापन शाखा, कमलपोखरी, काठमाडौँ
सूचना नं. ५४२/०८१-८२, विज्ञापन नं. १७२०१-१७२०७/०८१-८२
पद: शाखा अधिकृत (रा.प.तृतीय श्रेणी, अप्राविधिक)
सेवा, समूह: नेपाल प्रशासन सेवा, सामान्य प्रशासन तथा परराष्ट्र सेवा
खुला तथा समावेशी पद सङ्ख्या:
- खुला: २६ पद
- महिला: ०७ पद
- आदिवासी जनजाति: ०६ पद
- मधेसी: ०५ पद
- दलित: ०२ पद
- अपाङ्ग: ०१ पद
- पिछडिएको क्षेत्र: ०१ पद
जम्मा माग पद सङ्ख्या: ४८ (अठचालीस) पद
दरखास्त दिने अन्तिम मिति: २०८३/०५/३१ (Single Fee) र दोब्बर दस्तुर तिरी २०८३/०६/०७ सम्म।
परीक्षा दस्तुर: रु. १,२००/- (प्रत्येक समावेशी समूहका लागि थप रु. ४००/-)
उमेरको हद: २१ वर्ष पूरा भई ३५ वर्ष ननाघेको (महिला तथा अपाङ्ग उम्मेदवारको हकमा ४० वर्ष ननाघेको)।
न्यूनतम शैक्षिक योग्यता: मान्यता प्राप्त शिक्षण संस्थाबाट कुनै पनि विषयमा स्नातक (Bachelor's Degree) तह उत्तीर्ण गरेको।
प्रथम चरणको लिखित परीक्षा मिति: २०८३/०७/१० बिहान ११:०० बजे।
अनलाइन दरखास्त पोर्टल: https://psconline.psc.gov.np
`;

export function AdminPdfParserModal({
  lang,
  isOpen,
  onClose,
  onApplyParsedVacancy,
  onPublishSuccess
}: AdminPdfParserModalProps) {
  const [noticeText, setNoticeText] = useState<string>(SAMPLE_GAZETTE_NOTICE_TEXT);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsedResult, setParsedResult] = useState<PdfParsedNoticeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!noticeText.trim() || noticeText.trim().length < 30) {
      setError('Please provide sufficient official notice text (at least 30 characters).');
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/parse-pdf-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticeText })
      });

      const data = await res.json();
      if (res.ok) {
        setParsedResult(data);
      } else {
        setError(data.error || 'Failed to parse official PDF notice.');
      }
    } catch (err) {
      console.error('PDF parsing error:', err);
      setError('Network error while processing PDF notice text.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleImportToVacancy = () => {
    if (!parsedResult) return;

    const rawData = {
      id: `vac_pdf_${Date.now()}`,
      title: parsedResult.title,
      titleNp: parsedResult.titleNp,
      org: parsedResult.org,
      shortOrg: parsedResult.shortOrg || 'Lok Sewa Aayog',
      category: (parsedResult.category as any) || 'Lok Sewa (PSC)',
      province: 'All Nepal',
      level: parsedResult.level || 'Gazetted Class III (Officer Level 7)',
      posts: parsedResult.totalPosts || 1,
      quotaBreakdown: parsedResult.quotaBreakdown,
      singleFeeDeadline: parsedResult.singleFeeDeadline,
      doubleFeeDeadline: parsedResult.doubleFeeDeadline,
      deadline: parsedResult.singleFeeDeadline || '2026-09-30',
      examDate: parsedResult.examDate,
      fee: parsedResult.fee || 1200,
      minQualification: (parsedResult.minQualification as any) || 'Bachelor Degree',
      eligibleFields: parsedResult.eligibleFields,
      ageLimits: parsedResult.ageLimits,
      applyUrl: parsedResult.applyUrl || 'https://psconline.psc.gov.np',
      officialNoticeUrl: parsedResult.applyUrl,
      syllabusSummary: parsedResult.syllabusSummary,
      noticeNumber: parsedResult.noticeNumber || '542/081-82',
      status: 'published',
      syllabusPoints: parsedResult.syllabusSummary || ['GK & GMAT', 'Written Subjective', 'Interview'],
      qualifications: {
        minLevel: (parsedResult.minQualification as any) || 'Bachelor Degree',
        fields: parsedResult.eligibleFields || ['All Recognized Degrees'],
        minAge: parsedResult.ageLimits?.min || 21,
        maxAge: parsedResult.ageLimits?.maxMale || 35
      },
      description: `Official vacancy published by ${parsedResult.org}. Notice No: ${parsedResult.noticeNumber}`,
      createdAt: new Date().toISOString()
    };

    const fullVacancy = normalizeVacancy(rawData);

    if (onPublishSuccess) {
      onPublishSuccess(fullVacancy);
    }
    if (onApplyParsedVacancy) {
      onApplyParsedVacancy(fullVacancy);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-ink/30 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] max-w-3xl w-full p-6 sm:p-8 space-y-6 my-8 animate-scale-up shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Automated Gazette Notice Parser</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {lang === 'np' ? 'आधिकारिक विज्ञापन PDF/पाठ स्वतः इन्जेसन' : 'Official PSC PDF Notice Parser'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste or upload raw text from Nepal Gazette / Lok Sewa advertisement notices to extract quota counts, fee deadlines, age eligibility, and syllabus fields instantly.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Input Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Official Gazette / Notice Text (नेपाली वा अंग्रेजी सूचना)
            </label>
            <button
              type="button"
              onClick={() => setNoticeText(SAMPLE_GAZETTE_NOTICE_TEXT)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Load Official PSC Sample
            </button>
          </div>

          <textarea
            value={noticeText}
            onChange={(e) => setNoticeText(e.target.value)}
            rows={7}
            placeholder="Paste raw text from PDF notice or scanned OCR..."
            className="w-full p-4 rounded-2xl bg-sky-50/70 dark:bg-white/5 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-300"
          />

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleParse}
            disabled={isParsing}
            className={`w-full py-3 rounded-full font-bold text-xs transition flex items-center justify-center gap-2 ${
              isParsing
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-ink hover:bg-black text-white dark:bg-white dark:text-ink'
            }`}
          >
            {isParsing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Extracting Quota, Deadlines & Qualifications with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Parse Notice & Extract Structured Vacancy Parameters</span>
              </>
            )}
          </button>
        </div>

        {/* Parsed Result Preview */}
        {parsedResult && (
          <div className="p-5 bg-sky-50/70 dark:bg-slate-800/50 rounded-2xl space-y-4 animate-scale-up text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Successfully Parsed Structured Parameters
              </span>
              <span className="text-slate-400 font-mono">{parsedResult.noticeNumber}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Post Title (English)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{parsedResult.title}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Post Title (Nepali)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{parsedResult.titleNp}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Organization & Category</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{parsedResult.org} ({parsedResult.category})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Total Posts Demanded</span>
                <span className="font-black text-blue-600 dark:text-blue-400 text-sm">{parsedResult.totalPosts} Posts</span>
              </div>
            </div>

            {/* Quota Breakdown Tags */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500">Inclusion Quota Reservation Breakdown:</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(parsedResult.quotaBreakdown || {}).map(([key, val]) => (
                  <span
                    key={key}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-700"
                  >
                    <span className="capitalize">{key}</span>: <strong>{val}</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* Deadlines & Fee */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px]">Single Fee Deadline</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{parsedResult.singleFeeDeadline}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Double Fee Deadline</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{parsedResult.doubleFeeDeadline}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Application Fee</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">NPR {parsedResult.fee}</span>
              </div>
            </div>

            {/* Action to Draft */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleImportToVacancy}
                className="px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Fill Vacancy Form with Extracted Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
