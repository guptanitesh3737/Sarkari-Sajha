import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Bookmark,
  BookmarkCheck,
  Share2,
  ExternalLink,
  CheckCircle2,
  Check,
  ArrowLeft,
  CalendarPlus
} from 'lucide-react';
import { Vacancy, UserProfile, Language } from '../types';
import { NOT_SPECIFIED } from '../utils/vacancyUtils';
import { setPageSEO, setJobPostingSchema } from '../utils/seo';
import { tintFor } from '../utils/tints';

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

  const np = lang === 'np';
  const applyHref = vacancy.official_source_url || vacancy.applyUrl;
  const posts = vacancy.number_of_posts || vacancy.posts || 1;

  const STATUS: Record<string, { label: string; dot: string }> = {
    published: { label: np ? 'खुला' : 'Open', dot: 'bg-emerald-500' },
    closing_soon: { label: np ? 'छिट्टै बन्द' : 'Closing soon', dot: 'bg-amber-500' },
    expired: { label: np ? 'बन्द' : 'Closed', dot: 'bg-slate-400' },
    draft: { label: 'Draft', dot: 'bg-slate-400' },
    pending_review: { label: np ? 'समीक्षामा' : 'Under review', dot: 'bg-sky-500' },
    archived: { label: np ? 'संग्रहित' : 'Archived', dot: 'bg-slate-400' }
  };
  const status = STATUS[vacancy.status as string] || { label: np ? 'सूचना' : 'Notice', dot: 'bg-slate-400' };

  const card = 'rounded-[2rem] bg-white dark:bg-slate-900 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10';
  const chip = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 text-xs text-ink dark:text-slate-100';
  const ghostBtn =
    'h-11 px-4 inline-flex items-center gap-2 rounded-full ring-1 ring-slate-200 dark:ring-white/15 text-sm text-ink dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition';
  const sectionTitle = 'font-display text-xl font-semibold text-ink dark:text-white';

  // Label/value row used across the detail sections.
  const Row: React.FC<{ label: string; value: React.ReactNode; tone?: string }> = ({ label, value, tone }) => (
    <div className="py-3.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 border-b border-slate-100 dark:border-white/10 last:border-0">
      <dt className="sm:w-48 shrink-0 text-sm text-ink-soft dark:text-slate-400">{label}</dt>
      <dd className={`text-[15px] text-ink dark:text-slate-100 ${tone || ''}`}>{value}</dd>
    </div>
  );

  const quotas = vacancy.category_requirements
    ? [
        { label: np ? 'खुला' : 'Open', v: vacancy.category_requirements.open },
        { label: np ? 'महिला' : 'Female', v: vacancy.category_requirements.female },
        { label: np ? 'आदिवासी जनजाति' : 'Janajati', v: vacancy.category_requirements.janajati },
        { label: np ? 'मधेसी' : 'Madhesi', v: vacancy.category_requirements.madhesi },
        { label: np ? 'दलित' : 'Dalit', v: vacancy.category_requirements.dalit },
        { label: np ? 'अपाङ्ग' : 'Disabled', v: vacancy.category_requirements.apanga },
        { label: np ? 'पिछडिएको क्षेत्र' : 'Backward region', v: vacancy.category_requirements.pichhadiye }
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto pt-4 sm:pt-8 space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 h-10 pl-3 pr-4 rounded-full bg-white/70 dark:bg-white/5 ring-1 ring-black/[0.04] dark:ring-white/10 text-sm text-ink dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        {np ? 'सबै विज्ञापन' : 'All vacancies'}
      </button>

      {/* HERO */}
      <section className={`${card} overflow-hidden`}>
        <div className={`px-6 sm:px-10 pt-7 sm:pt-9 pb-8 bg-gradient-to-b ${tintFor(vacancy.category || '')}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className={chip}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            {vacancy.category && <span className={chip}>{vacancy.category}</span>}
            {vacancy.province && (
              <span className={chip}>
                <MapPin className="w-3 h-3 opacity-60" />
                {vacancy.province}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="font-display text-3xl sm:text-[2.6rem] leading-[1.08] font-semibold text-ink dark:text-white">
                {np && vacancy.titleNp ? vacancy.titleNp : vacancy.title}
              </h1>
              <p className="mt-3 text-[15px] text-ink-soft dark:text-slate-300">
                {vacancy.organization || vacancy.org}
                {vacancy.department && vacancy.department !== NOT_SPECIFIED && (
                  <span className="text-ink-soft/70 dark:text-slate-400"> · {vacancy.department}</span>
                )}
              </p>
            </div>
            <div className="flex items-baseline gap-2 text-ink dark:text-white shrink-0">
              <span className="font-display text-6xl font-semibold leading-none">{posts}</span>
              <span className="text-sm text-ink-soft dark:text-slate-300">{posts === 1 ? (np ? 'पद' : 'post') : np ? 'पदहरू' : 'posts'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 sm:px-10 py-5 flex flex-wrap items-center gap-2 border-t border-black/[0.04] dark:border-white/10">
          {applyHref && (
            <a
              href={applyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-5 inline-flex items-center gap-2 rounded-full bg-ink dark:bg-white text-white dark:text-ink text-sm font-medium shadow-pill hover:bg-black transition"
            >
              {np ? 'आधिकारिक साइटमा आवेदन' : 'Apply on official site'}
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {onOpenMatchModal && (
            <button onClick={onOpenMatchModal} className={ghostBtn}>
              <CheckCircle2 className="w-4 h-4 opacity-70" />
              {np ? 'योग्यता जाँच' : 'Check eligibility'}
            </button>
          )}
          <button onClick={() => onBookmark(vacancy)} className={ghostBtn} aria-pressed={isBookmarked}>
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4 opacity-70" />}
            {isBookmarked ? (np ? 'सुरक्षित' : 'Saved') : np ? 'सुरक्षित गर्नुहोस्' : 'Save'}
          </button>
          <button onClick={handleShare} className={ghostBtn}>
            {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 opacity-70" />}
            {copiedLink ? (np ? 'लिंक कपी भयो' : 'Link copied') : np ? 'सेयर' : 'Share'}
          </button>
          <button onClick={handleSetReminder} className={ghostBtn}>
            <CalendarPlus className="w-4 h-4 opacity-70" />
            {reminderSet ? (np ? 'क्यालेन्डर खुल्दै…' : 'Opening calendar…') : np ? 'रिमाइन्डर' : 'Remind me'}
          </button>
        </div>

        {/* Key facts */}
        <dl className="grid grid-cols-2 lg:grid-cols-4 border-t border-black/[0.04] dark:border-white/10">
          {[
            { label: np ? 'अन्तिम म्याद' : 'Deadline', value: vacancy.application_deadline || vacancy.deadline || NOT_SPECIFIED },
            {
              label: np ? 'आवेदन शुल्क' : 'Application fee',
              value: vacancy.application_fee !== undefined && vacancy.application_fee > 0 ? `NPR ${vacancy.application_fee}` : np ? 'उल्लेख छैन' : 'Not specified'
            },
            { label: np ? 'न्यूनतम योग्यता' : 'Qualification', value: vacancy.qualification || vacancy.minQualification || 'Bachelor Degree' },
            { label: np ? 'सूचना नं.' : 'Notice no.', value: vacancy.noticeNumber || NOT_SPECIFIED }
          ].map((f, i) => (
            <div
              key={f.label}
              className={`px-6 sm:px-10 py-5 ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''} border-black/[0.04] dark:border-white/10`}
            >
              <dt className="text-xs text-ink-soft dark:text-slate-400">{f.label}</dt>
              <dd className="mt-1 font-display text-lg font-medium text-ink dark:text-white truncate" title={String(f.value)}>
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className={`${card} p-6 sm:p-8`}>
            <h2 className={sectionTitle}>{np ? 'महत्त्वपूर्ण मितिहरू' : 'Important dates'}</h2>
            <dl className="mt-3">
              <Row label={np ? 'आवेदन सुरु' : 'Applications open'} value={formatText(vacancy.application_start_date)} />
              <Row
                label={np ? 'एक दस्तुर म्याद' : 'Single-fee deadline'}
                value={formatText(vacancy.singleFeeDeadline || vacancy.application_deadline || vacancy.deadline)}
              />
              <Row label={np ? 'दोब्बर दस्तुर म्याद' : 'Double-fee deadline'} value={formatText(vacancy.doubleFeeDeadline)} />
              <Row label={np ? 'परीक्षा मिति' : 'Exam date'} value={formatText(vacancy.exam_date || vacancy.examDate)} />
            </dl>
          </section>

          <section className={`${card} p-6 sm:p-8`}>
            <h2 className={sectionTitle}>{np ? 'योग्यता' : 'Eligibility'}</h2>
            <dl className="mt-3">
              <Row
                label={np ? 'आवश्यक विषय' : 'Required field'}
                value={vacancy.required_field || (vacancy.eligibleFields ? vacancy.eligibleFields.join(', ') : NOT_SPECIFIED)}
              />
              <Row
                label={np ? 'उमेर' : 'Age'}
                value={
                  vacancy.age_requirement?.description ||
                  `${vacancy.age_requirement?.min || 18} – ${vacancy.age_requirement?.maxMale || 35} ${np ? 'वर्ष' : 'years'}`
                }
              />
              <Row label={np ? 'अनुभव' : 'Experience'} value={formatText(vacancy.experience)} />
              <Row label={np ? 'तलब' : 'Salary'} value={formatText(vacancy.salary)} />
              <Row label={np ? 'रोजगारी प्रकार' : 'Employment type'} value={formatText(vacancy.employment_type)} />
            </dl>
          </section>

          {quotas.length > 0 && (
            <section className={`${card} p-6 sm:p-8`}>
              <h2 className={sectionTitle}>{np ? 'समावेशी कोटा' : 'Seats by quota'}</h2>
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quotas.map((q) => (
                  <div key={q.label} className="px-4 py-3 rounded-2xl bg-sky-50 dark:bg-white/5">
                    <div className="font-display text-2xl font-semibold text-ink dark:text-white">{q.v ?? 0}</div>
                    <div className="text-xs text-ink-soft dark:text-slate-400">{q.label}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={`${card} p-6 sm:p-8`}>
            <h2 className={sectionTitle}>{np ? 'आवेदन कसरी दिने' : 'How to apply'}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft dark:text-slate-300">{formatText(vacancy.application_instructions)}</p>

            <h3 className="mt-7 text-sm font-medium text-ink dark:text-white">{np ? 'तयार गर्नुपर्ने कागजात' : 'Documents to prepare'}</h3>
            <ul className="mt-3 space-y-2.5">
              {vacancy.required_documents && vacancy.required_documents.length > 0 ? (
                vacancy.required_documents.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[15px] text-ink dark:text-slate-200">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-sky-100 dark:bg-white/10 inline-flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                    {doc}
                  </li>
                ))
              ) : (
                <li className="text-sm text-ink-soft dark:text-slate-400">{NOT_SPECIFIED}</li>
              )}
            </ul>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          <section className={`${card} p-6`}>
            <h2 className="font-display text-lg font-semibold text-ink dark:text-white">{np ? 'आधिकारिक स्रोत' : 'Official source'}</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-xs text-ink-soft dark:text-slate-400">{np ? 'निकाय' : 'Publisher'}</dt>
                <dd className="mt-0.5 text-ink dark:text-slate-100">{formatText(vacancy.official_source_name || vacancy.shortOrg)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft dark:text-slate-400">{np ? 'राजपत्र / सूचना सन्दर्भ' : 'Gazette / notice reference'}</dt>
                <dd className="mt-0.5 text-ink dark:text-slate-100 break-words">{formatText(vacancy.source_document || vacancy.noticeNumber)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft dark:text-slate-400">{np ? 'प्रमाणीकरण' : 'Verified'}</dt>
                <dd className="mt-0.5 text-ink dark:text-slate-100 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {vacancy.verified_by || 'Editorial Board'} · {vacancy.verified_at || vacancy.published_at || 'Recent'}
                </dd>
              </div>
            </dl>
            {applyHref && (
              <a
                href={applyHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full h-11 inline-flex items-center justify-center gap-2 rounded-full ring-1 ring-slate-200 dark:ring-white/15 text-sm text-ink dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition"
              >
                {np ? 'स्रोत हेर्नुहोस्' : 'Open source'}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </section>

          {vacancy.syllabusPoints && vacancy.syllabusPoints.length > 0 && (
            <section className={`${card} p-6`}>
              <h2 className="font-display text-lg font-semibold text-ink dark:text-white">{np ? 'पाठ्यक्रम' : 'Syllabus outline'}</h2>
              <ol className="mt-4 space-y-3">
                {vacancy.syllabusPoints.map((pt, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink dark:text-slate-200">
                    <span className="w-6 shrink-0 font-display text-ink-soft dark:text-slate-500">{String(i + 1).padStart(2, '0')}</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <p className="px-2 text-xs leading-relaxed text-ink-soft dark:text-slate-400">
            {np
              ? 'सरकारी साझा स्वतन्त्र प्लेटफर्म हो। आवेदन र शुल्क भुक्तानी आधिकारिक पोर्टलबाट मात्र गर्नुहोस्। विवाद भएमा आधिकारिक राजपत्र मान्य हुनेछ।'
              : 'SarkariSajha is an independent platform. Apply and pay fees only through the official portal. We cross-check with Rajpatra, Gorkhapatra and PSC gazettes; if anything differs, the official gazette prevails.'}
          </p>
        </aside>
      </div>
    </div>
  );
};
