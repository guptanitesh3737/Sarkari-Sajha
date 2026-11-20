import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  Users,
  Award,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Share2,
  ExternalLink,
  Bell,
  CheckCircle2,
  FileText,
  DollarSign,
  AlertCircle,
  Briefcase,
  Layers,
  GraduationCap,
  Clock,
  ArrowLeft,
  ShieldAlert,
  CalendarPlus,
  Copy,
  Info
} from 'lucide-react';
import { Vacancy, UserProfile, Language } from '../types';
import { NOT_SPECIFIED } from '../utils/vacancyUtils';
import { setPageSEO, setJobPostingSchema } from '../utils/seo';

interface VacancyDetailPageProps {
  vacancy: Vacancy;
  userProfile?: UserProfile;
  lang: Language;
  onBack: () => void;
  onBookmark: (vacancy: Vacancy) => void;
  isBookmarked: boolean;
  onOpenMatchModal?: () => void;
}

export const VacancyDetailPage: React.FC<VacancyDetailPageProps> = ({
  vacancy,
  userProfile,
  lang,
  onBack,
  onBookmark,
  isBookmarked,
  onOpenMatchModal
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  // Dynamic SEO Injection for crawlers, social sharing, and search indexing
  useEffect(() => {
    const slug = vacancy.slug || vacancy.id;
    const canonical = typeof window !== 'undefined' ? `${window.location.origin}/vacancies/${slug}` : undefined;
    const title = `${vacancy.position || vacancy.title} Vacancy 2026 – SarkariSajha`;
    const description = `Official Nepal Government vacancy notice for ${vacancy.title} by ${vacancy.organization || vacancy.org}. Min qualification: ${vacancy.qualification || vacancy.qualifications?.minLevel}. Application deadline: ${vacancy.application_deadline || vacancy.deadline || 'Active'}.`;

    setPageSEO({
      title,
      description,
      canonicalUrl: canonical,
      ogType: 'article'
    });

    setJobPostingSchema(vacancy);
  }, [vacancy]);

  const formatText = (val?: string) => {
    if (!val || val.trim() === '' || val === 'undefined') return NOT_SPECIFIED;
    return val;
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${vacancy.title} - SarkariSajha`,
          text: `Check out this government vacancy notice from ${vacancy.organization || vacancy.org}: ${vacancy.title}`,
          url
        });
      } catch (e) {
        // Fallback to copy
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSetReminder = () => {
    // Generate iCal standard / Google Calendar link
    const title = encodeURIComponent(`Deadline: ${vacancy.title} (${vacancy.shortOrg || vacancy.org})`);
    const details = encodeURIComponent(`Application Deadline for ${vacancy.title}.\nOfficial link: ${vacancy.official_source_url || vacancy.applyUrl}\nOrganized by: ${vacancy.organization || vacancy.org}`);
    const location = encodeURIComponent(`${vacancy.organization || vacancy.org}, ${vacancy.province}`);
    
    let dateParam = '';
    if (vacancy.application_deadline) {
      const d = vacancy.application_deadline.replace(/-/g, '');
      dateParam = `&dates=${d}T090000Z/${d}T170000Z`;
    }
    
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${dateParam}`;
    window.open(googleCalUrl, '_blank', 'noopener,noreferrer');
    setReminderSet(true);
    setTimeout(() => setReminderSet(false), 4000);
  };

  const getStatusBadge = () => {
    switch (vacancy.status) {
      case 'published':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Active Vacancy</span>;
      case 'closing_soon':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">Closing Soon</span>;
      case 'expired':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Application Closed</span>;
      case 'draft':
        return <span className="bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Draft Notice</span>;
      case 'pending_review':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Under Editorial Review</span>;
      case 'archived':
        return <span className="bg-zinc-100 text-zinc-600 border border-zinc-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Archived</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">Official Notice</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-xl transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'np' ? 'सबै विज्ञापनहरू' : 'Back to Vacancies'}</span>
        </button>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>
      </div>

      {/* Non-Governmental Platform Transparency Notice */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Informational Notice:</span> SarkariSajha is an independent educational and recruitment portal and does not claim to be an official government entity. All application procedures and fee payments must be conducted solely via the verified official portals cited below.
        </div>
      </div>

      {/* Header Banner Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold">
                {vacancy.category}
              </span>
              <span className="text-slate-500 text-xs font-mono">Notice #{vacancy.noticeNumber || NOT_SPECIFIED}</span>
              {vacancy.province && (
                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md text-xs font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" /> {vacancy.province}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-sans tracking-tight leading-tight">
              {lang === 'np' && vacancy.titleNp ? vacancy.titleNp : vacancy.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-600">
              <div className="flex items-center gap-1.5 font-medium text-slate-900">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{vacancy.organization || vacancy.org}</span>
              </div>
              {vacancy.department && vacancy.department !== NOT_SPECIFIED && (
                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>{vacancy.department}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onBookmark(vacancy)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition border ${
                isBookmarked
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-blue-600" /> : <Bookmark className="w-4 h-4 text-slate-500" />}
              <span>{isBookmarked ? 'Saved Vacancy' : 'Save Vacancy'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={handleSetReminder}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition"
            >
              <CalendarPlus className="w-4 h-4 text-amber-600" />
              <span>{reminderSet ? 'Opening Calendar...' : 'Set Reminder'}</span>
            </button>

            {(vacancy.official_source_url || vacancy.applyUrl) && (
              <a
                href={vacancy.official_source_url || vacancy.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
              >
                <span>Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block tracking-wider">Number of Posts</span>
            <span className="text-lg font-bold text-emerald-800 flex items-center gap-1.5 mt-0.5">
              <Users className="w-4 h-4 text-emerald-600" />
              {vacancy.number_of_posts || vacancy.posts || 1} Positions
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block tracking-wider">Application Fee</span>
            <span className="text-lg font-bold text-amber-800 flex items-center gap-1.5 mt-0.5">
              <DollarSign className="w-4 h-4 text-amber-600" />
              {vacancy.application_fee !== undefined && vacancy.application_fee > 0 ? `NPR ${vacancy.application_fee}` : 'Free / Not Specified'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block tracking-wider">Application Deadline</span>
            <span className="text-lg font-bold text-rose-800 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-4 h-4 text-rose-600" />
              {vacancy.application_deadline || vacancy.deadline || NOT_SPECIFIED}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block tracking-wider">Minimum Qualification</span>
            <span className="text-sm font-bold text-blue-900 flex items-center gap-1.5 mt-1 truncate" title={vacancy.qualification || vacancy.minQualification}>
              <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
              {vacancy.qualification || vacancy.minQualification || 'Bachelor Degree'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Essential Job Specs & Quotas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Important Dates */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              Important Examination & Registration Dates
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block font-medium">Application Start Date</span>
                <span className="font-semibold text-slate-900">{formatText(vacancy.application_start_date)}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block font-medium">Single-Fee Deadline</span>
                <span className="font-semibold text-rose-700">{formatText(vacancy.singleFeeDeadline || vacancy.application_deadline || vacancy.deadline)}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block font-medium">Double-Fee Deadline</span>
                <span className="font-semibold text-amber-700">{formatText(vacancy.doubleFeeDeadline)}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block font-medium">Scheduled Exam Date</span>
                <span className="font-semibold text-blue-700">{formatText(vacancy.exam_date || vacancy.examDate)}</span>
              </div>
            </div>
          </div>

          {/* Detailed Eligibility & Requirements */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Award className="w-4 h-4 text-emerald-600" />
              Eligibility & Educational Qualifications
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 p-3 bg-slate-50 rounded-xl">
                <span className="w-36 font-semibold text-slate-700 text-xs shrink-0 uppercase tracking-wider">Required Field:</span>
                <span className="text-slate-900 font-medium">
                  {vacancy.required_field || (vacancy.eligibleFields ? vacancy.eligibleFields.join(', ') : NOT_SPECIFIED)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 p-3 bg-slate-50 rounded-xl">
                <span className="w-36 font-semibold text-slate-700 text-xs shrink-0 uppercase tracking-wider">Age Benchmark:</span>
                <span className="text-slate-900 font-medium">
                  {vacancy.age_requirement?.description || `${vacancy.age_requirement?.min || 18} - ${vacancy.age_requirement?.maxMale || 35} years`}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 p-3 bg-slate-50 rounded-xl">
                <span className="w-36 font-semibold text-slate-700 text-xs shrink-0 uppercase tracking-wider">Experience:</span>
                <span className="text-slate-900 font-medium">{formatText(vacancy.experience)}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 p-3 bg-slate-50 rounded-xl">
                <span className="w-36 font-semibold text-slate-700 text-xs shrink-0 uppercase tracking-wider">Salary / Remuneration:</span>
                <span className="text-slate-900 font-medium">{formatText(vacancy.salary)}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 p-3 bg-slate-50 rounded-xl">
                <span className="w-36 font-semibold text-slate-700 text-xs shrink-0 uppercase tracking-wider">Employment Type:</span>
                <span className="text-slate-900 font-medium">{formatText(vacancy.employment_type)}</span>
              </div>
            </div>
          </div>

          {/* Quota Breakdown / Inclusive Categories */}
          {vacancy.category_requirements && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Users className="w-4 h-4 text-purple-600" />
                Inclusion / Quota Breakdown
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-lg text-center">
                  <span className="text-slate-500 block">Open (खुला)</span>
                  <span className="font-bold text-purple-900 text-base">{vacancy.category_requirements.open ?? 0}</span>
                </div>
                <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-lg text-center">
                  <span className="text-slate-500 block">Female (महिला)</span>
                  <span className="font-bold text-purple-900 text-base">{vacancy.category_requirements.female ?? 0}</span>
                </div>
                <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-lg text-center">
                  <span className="text-slate-500 block">Adivasi Janajati</span>
                  <span className="font-bold text-purple-900 text-base">{vacancy.category_requirements.janajati ?? 0}</span>
                </div>
                <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-lg text-center">
                  <span className="text-slate-500 block">Madhesi</span>
                  <span className="font-bold text-purple-900 text-base">{vacancy.category_requirements.madhesi ?? 0}</span>
                </div>
                <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-lg text-center">
                  <span className="text-slate-500 block">Dalit</span>
                  <span className="font-bold text-purple-900 text-base">{vacancy.category_requirements.dalit ?? 0}</span>
                </div>
                <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-lg text-center">
                  <span className="text-slate-500 block">Apanga (Disabled)</span>
                  <span className="font-bold text-purple-900 text-base">{vacancy.category_requirements.apanga ?? 0}</span>
                </div>
                <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-lg text-center">
                  <span className="text-slate-500 block">Pichhadiyeko</span>
                  <span className="font-bold text-purple-900 text-base">{vacancy.category_requirements.pichhadiye ?? 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Application Procedure & Instructions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-blue-600" />
              Application Procedure & Guidelines
            </h2>

            <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p>{formatText(vacancy.application_instructions)}</p>
            </div>

            {/* Required Documents */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Mandatory Documentation to Prepare:</span>
              <ul className="space-y-1.5 text-sm text-slate-600">
                {vacancy.required_documents && vacancy.required_documents.length > 0 ? (
                  vacancy.required_documents.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 italic">{NOT_SPECIFIED}</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Source Attribution, Gazette Citations, & Fast Links */}
        <div className="space-y-6">
          {/* Official Source Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Briefcase className="w-4 h-4 text-slate-700" />
              Official Verification & Citation
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block font-semibold">Official Source Name:</span>
                <span className="font-medium text-slate-900">{formatText(vacancy.official_source_name || vacancy.shortOrg)}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold">Gazette / Notice Reference:</span>
                <span className="font-mono text-slate-800">{formatText(vacancy.source_document || vacancy.noticeNumber)}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold">Verification Audit:</span>
                <span className="text-emerald-700 font-medium">Verified by {vacancy.verified_by || 'Editorial Board'} on {vacancy.verified_at || vacancy.published_at || 'Recent'}</span>
              </div>

              {(vacancy.official_source_url || vacancy.applyUrl) && (
                <div className="pt-2">
                  <a
                    href={vacancy.official_source_url || vacancy.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition text-xs"
                  >
                    <span>Visit Official Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Syllabus Quick Look */}
          {vacancy.syllabusPoints && vacancy.syllabusPoints.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                Exam Syllabus Outline
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {vacancy.syllabusPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-bold text-indigo-700 shrink-0">#{i + 1}</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Disclaimer */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-500 leading-relaxed space-y-1">
            <p className="font-bold text-slate-700">Notice Accuracy Policy</p>
            <p>SarkariSajha cross-checks notices with Rajpatra, Gorkhapatra, and PSC gazettes. In case of discrepancies, the official gazette publication shall prevail.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
