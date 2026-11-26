import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Share2, CalendarPlus, ShieldCheck } from 'lucide-react';
import { Vacancy, UserProfile, Language } from '../types';
import { NOT_SPECIFIED } from '../utils/vacancyUtils';
import { setPageSEO, setJobPostingSchema } from '../utils/seo';
import { tintHex } from '../utils/tints';
import { num, L, daysLeft, urgency, fmtDate, matchScore, CARD } from '../utils/ui';

interface VacancyDetailPageProps {
  vacancy: Vacancy;
  userProfile?: UserProfile;
  lang: Language;
  onBack: () => void;
  onBookmark: (vacancy: Vacancy) => void;
  isBookmarked: boolean;
  onOpenMatchModal?: () => void;
  onOpenSyllabus?: () => void;
}

const CAT_NP: Record<string, string> = {
  'Lok Sewa (PSC)': 'लोक सेवा',
  'Teacher Service (TSC)': 'शिक्षक सेवा',
  'Banking & Finance': 'बैंकिङ',
  'Security Forces': 'सुरक्षा निकाय',
  'Health Services': 'स्वास्थ्य सेवा',
  'Provincial Lok Sewa': 'प्रदेश लोक सेवा',
  'Local Level (Nagarpalika)': 'स्थानीय तह',
  'Public Corporation': 'संस्थान',
  'IT & Engineering': 'आईटी तथा इन्जिनियरिङ'
};

const has = (v?: string | null) => !!v && v.trim() !== '' && v !== 'undefined' && v !== NOT_SPECIFIED;

export const VacancyDetailPage: React.FC<VacancyDetailPageProps> = ({
  vacancy,
  userProfile,
  lang,
  onBack,
  onBookmark,
  isBookmarked,
  onOpenMatchModal,
  onOpenSyllabus
}) => {
  const tr = L(lang);
  const np = lang === 'np';
  const [copied, setCopied] = useState(false);
  const [checks, setChecks] = useState<boolean[]>([false, false, false, false, false]);

  useEffect(() => {
    const slug = vacancy.slug || vacancy.id;
    setPageSEO({
      title: `${vacancy.position || vacancy.title} Vacancy 2026 – SarkariSajha`,
      description: `Official Nepal Government vacancy notice for ${vacancy.title} by ${vacancy.organization || vacancy.org}. Min qualification: ${vacancy.qualification || vacancy.qualifications?.minLevel}. Application deadline: ${vacancy.application_deadline || vacancy.deadline || 'Active'}.`,
      canonicalUrl: typeof window !== 'undefined' ? `${window.location.origin}/vacancies/${slug}` : undefined,
      ogType: 'article'
    });
    setJobPostingSchema(vacancy);
    setChecks([false, false, false, false, false]);
  }, [vacancy]);

  // Pre-tick age and qualification when the saved profile already satisfies them.
  const m = userProfile ? matchScore(vacancy, userProfile) : null;
  useEffect(() => {
    if (m) setChecks((c) => [m.ageOk || c[0], m.qualOk || c[1], c[2], c[3], c[4]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vacancy.id, userProfile?.age, userProfile?.qualificationLevel]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${vacancy.title} - SarkariSajha`, url });
        return;
      }
    } catch {
      /* fall through to copy */
    }
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const remind = () => {
    const title = encodeURIComponent(`Deadline: ${vacancy.title} (${vacancy.shortOrg || vacancy.org || vacancy.organization})`);
    const details = encodeURIComponent(`Official link: ${vacancy.official_source_url || vacancy.applyUrl || ''}`);
    const d = (vacancy.application_deadline || '').replace(/-/g, '');
    const dates = d ? `&dates=${d}T090000Z/${d}T170000Z` : '';
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}${dates}`, '_blank', 'noopener,noreferrer');
  };

  const applyHref = vacancy.official_source_url || vacancy.applyUrl;
  const posts = vacancy.number_of_posts || vacancy.posts || 1;
  const fee = vacancy.application_fee ?? vacancy.fee ?? 0;
  const deadline = vacancy.application_deadline || vacancy.deadline;
  const dl = daysLeft(deadline);
  const closed = dl < 0 || vacancy.status === 'expired';
  const u = urgency(dl);
  const match = m?.score ?? 0;
  const qual = vacancy.qualification || vacancy.qualifications?.minLevel || vacancy.minQualification || NOT_SPECIFIED;
  const minAge = vacancy.age_requirement?.min ?? vacancy.qualifications?.minAge ?? 18;
  const maxAge = vacancy.age_requirement?.maxMale ?? vacancy.qualifications?.maxAge ?? 35;
  const ageText = vacancy.age_requirement?.description || `${minAge}–${maxAge} ${tr('yrs', 'वर्ष')}`;
  const level = vacancy.job_level || vacancy.level;

  const facts: [string, string][] = [
    [tr('Level', 'तह'), has(level) ? String(level) : '—'],
    [tr('Posts', 'पद संख्या'), num(posts, lang)],
    [tr('Fee', 'दस्तुर'), fee > 0 ? `${tr('Rs ', 'रु ')}${num(fee.toLocaleString(), lang)}` : '—'],
    [tr('Age limit', 'उमेर हद'), np ? num(ageText, lang) : ageText],
    [tr('Qualification', 'आवश्यक योग्यता'), String(qual)],
    [tr('Province', 'प्रदेश'), vacancy.province || '—'],
    [tr('Salary', 'तलब'), has(vacancy.salary) ? String(vacancy.salary) : '—']
  ];

  const today = new Date().toISOString().slice(0, 10);
  const steps = [
    { label: tr('Applications open', 'दरखास्त खुला'), date: vacancy.application_start_date || vacancy.published_at },
    { label: tr('Last date to apply', 'अन्तिम मिति'), date: deadline },
    { label: tr('Written exam', 'लिखित परीक्षा'), date: vacancy.exam_date || vacancy.examDate },
    { label: tr('Interview & final result', 'अन्तर्वार्ता र नतिजा'), date: undefined }
  ].map((s) => ({ ...s, done: !!s.date && s.date.slice(0, 10) <= today }));

  const questions: [string, string][] = [
    [tr(`I'm between ${minAge} and ${maxAge} years old`, `मेरो उमेर ${num(minAge, lang)}–${num(maxAge, lang)} वर्षभित्र छ`), tr('Age counted on the last date of application', 'दरखास्तको अन्तिम मितिमा गणना')],
    [tr(`I hold: ${qual}`, `मसँग: ${qual}`), tr('From a recognised university or board', 'मान्यताप्राप्त विश्वविद्यालयबाट')],
    [tr('I am a Nepali citizen', 'म नेपाली नागरिक हुँ'), tr('Citizenship certificate copy required', 'नागरिकता प्रमाणपत्र आवश्यक')],
    [tr(`I can pay Rs ${fee} online`, `म रु ${num(fee, lang)} अनलाइन तिर्न सक्छु`), tr('eSewa, Khalti or ConnectIPS', 'ई-सेवा, खल्ती वा कनेक्टआइपिएस')],
    [tr('My photo and signature are scanned', 'फोटो र हस्ताक्षर स्क्यान छ'), tr('JPG under 300 KB each', 'प्रत्येक ३०० KB भन्दा कम')]
  ];
  const done = checks.filter(Boolean).length;
  const allDone = done === 5;

  const syllabus = vacancy.syllabusPoints?.length ? vacancy.syllabusPoints : vacancy.syllabusSummary || [];
  const quotas = vacancy.category_requirements
    ? ([
        [tr('Open', 'खुला'), vacancy.category_requirements.open],
        [tr('Female', 'महिला'), vacancy.category_requirements.female],
        [tr('Janajati', 'जनजाति'), vacancy.category_requirements.janajati],
        [tr('Madhesi', 'मधेसी'), vacancy.category_requirements.madhesi],
        [tr('Dalit', 'दलित'), vacancy.category_requirements.dalit],
        [tr('Disabled', 'अपाङ्ग'), vacancy.category_requirements.apanga],
        [tr('Backward region', 'पिछडिएको क्षेत्र'), vacancy.category_requirements.pichhadiye]
      ].filter(([, v]) => typeof v === 'number' && (v as number) > 0) as [string, number][])
    : [];

  const cardTitle = 'font-display text-[18px] font-semibold text-ink';

  return (
    <div className="flex flex-col gap-[22px] pt-7 pb-6">
      <button
        onClick={onBack}
        className="self-start inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-white/80 text-[13px] text-ink hover:bg-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {tr('All vacancies', 'सबै विज्ञापन')}
      </button>

      {/* Shared header */}
      <header className="flex flex-col gap-2.5">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold px-2.5 py-[5px] rounded-full text-ink" style={{ background: tintHex(vacancy.category || '') }}>
            {np ? CAT_NP[vacancy.category] || vacancy.category : vacancy.category}
          </span>
          <span className="text-xs font-semibold px-2.5 py-[5px] rounded-full bg-[#d1fae5] text-[#047857]">✓ {tr('Verified notice', 'प्रमाणित सूचना')}</span>
          {has(vacancy.noticeNumber) && (
            <span className="text-xs px-2.5 py-[5px] rounded-full bg-white text-ink-soft">
              {tr('Notice No.', 'विज्ञापन नम्बर')} {vacancy.noticeNumber}
            </span>
          )}
        </div>
        <h1 className="font-display font-semibold tracking-[-0.025em] leading-[1.08] text-ink text-[28px] sm:text-[44px] [text-wrap:balance] max-w-[820px]">
          {np && vacancy.titleNp ? vacancy.titleNp : vacancy.title}
        </h1>
        <p className="text-[14.5px] text-ink-soft">
          {vacancy.organization || vacancy.org}
          {has(vacancy.department) && <span className="text-[#98a2b3]"> · {vacancy.department}</span>}
        </p>
      </header>

      <div className="flex flex-wrap gap-5 items-start">
        {/* LEFT */}
        <div className="flex-[1_1_520px] min-w-0 flex flex-col gap-5">
          <section className={`${CARD} p-[22px]`}>
            <h2 className={`${cardTitle} mb-3.5`}>{tr('At a glance', 'संक्षेपमा')}</h2>
            <dl className="grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(min(180px,100%),1fr))]">
              {facts.map(([k, v]) => (
                <div key={k} className="bg-sky-50 rounded-2xl px-3.5 py-3">
                  <dt className="text-[11.5px] text-[#667085]">{k}</dt>
                  <dd className="text-[14.5px] font-semibold mt-[3px] leading-[1.35] text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Eligibility checklist (variation B feature) */}
          <section className="bg-white rounded-[28px] shadow-soft p-6 flex flex-col gap-[18px]">
            <div className="flex justify-between items-center gap-3 flex-wrap">
              <div>
                <h2 className="font-display text-[22px] font-semibold tracking-[-0.01em] text-ink">{tr('Can you apply?', 'के तपाईं योग्य हुनुहुन्छ?')}</h2>
                <p className="text-[13.5px] text-ink-soft mt-0.5">{tr("Tick what applies to you — we'll tell you if you're ready.", 'आफूलाई लागू हुने छान्नुहोस्।')}</p>
              </div>
              <div className="font-display text-[28px] font-semibold text-ink" aria-live="polite">
                {num(done, lang)}/{num(5, lang)}
              </div>
            </div>
            <div className="h-2 rounded-full bg-sky-100 overflow-hidden">
              <div className="h-full transition-[width] duration-300" style={{ width: `${done * 20}%`, background: allDone ? '#059669' : '#5ea9e2' }} />
            </div>
            <div className="flex flex-col gap-2">
              {questions.map(([q, hint], i) => {
                const on = checks[i];
                return (
                  <button
                    key={i}
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => setChecks((c) => c.map((x, j) => (j === i ? !x : x)))}
                    className="flex items-start gap-3.5 text-left rounded-[18px] px-4 py-3.5 min-h-14 border transition"
                    style={{ borderColor: on ? '#a7f3d0' : '#eef2f6', background: on ? '#f0fdf6' : '#fff' }}
                  >
                    <span
                      className="w-6 h-6 flex-none rounded-lg border-[1.5px] text-white flex items-center justify-center"
                      style={{ borderColor: on ? '#059669' : '#d0d5dd', background: on ? '#059669' : '#fff' }}
                    >
                      {on && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-semibold text-[14.5px] text-ink">{q}</span>
                      <span className="text-[12.5px] text-ink-soft">{hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2.5 flex-wrap">
              {allDone && applyHref && !closed ? (
                <a
                  href={applyHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-[1_1_200px] h-[52px] rounded-full bg-ink text-white text-[15px] font-medium shadow-pill inline-flex items-center justify-center hover:bg-black transition"
                >
                  {tr("You're eligible — apply officially ↗", 'तपाईं योग्य हुनुहुन्छ — दरखास्त दिनुहोस् ↗')}
                </a>
              ) : (
                <button disabled className="flex-[1_1_200px] h-[52px] rounded-full bg-[#e4e7ec] text-[#98a2b3] text-[15px] font-medium cursor-not-allowed">
                  {closed
                    ? tr('Applications closed', 'दरखास्त बन्द भयो')
                    : allDone
                      ? tr('Official link not available', 'आधिकारिक लिंक उपलब्ध छैन')
                      : tr(`${5 - done} more to check`, `थप ${num(5 - done, lang)} जाँच बाँकी`)}
                </button>
              )}
              {onOpenMatchModal && (
                <button
                  onClick={onOpenMatchModal}
                  className="flex-[1_1_160px] h-[52px] rounded-full border border-[#d0d5dd] bg-white text-[15px] text-ink hover:bg-sky-50 transition"
                >
                  {tr('Check with AI', 'एआईसँग जाँच्नुहोस्')}
                </button>
              )}
            </div>
          </section>

          {syllabus.length > 0 && (
            <section className={`${CARD} p-[22px]`}>
              <div className="flex justify-between items-baseline mb-1.5 gap-3">
                <h2 className={cardTitle}>{tr('Exam syllabus & papers', 'परीक्षा पाठ्यक्रम र पत्रहरू')}</h2>
                {onOpenSyllabus && (
                  <button onClick={onOpenSyllabus} className="text-[13px] text-ink underline underline-offset-2 shrink-0">
                    {tr('Open syllabus', 'पाठ्यक्रम हेर्नुहोस्')}
                  </button>
                )}
              </div>
              <ol>
                {syllabus.map((pt, i) => (
                  <li key={i} className="flex gap-3 py-3.5 border-t border-[#eef2f6] text-[14.5px] text-ink">
                    <span className="w-6 shrink-0 font-semibold text-[#98a2b3]">{num(i + 1, lang)}</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className={`${CARD} p-[22px]`}>
            <h2 className={`${cardTitle} mb-3.5`}>{tr('Selection timeline', 'छनोट प्रक्रिया')}</h2>
            <ol>
              {steps.map((s, i) => (
                <li key={i} className="flex gap-3.5">
                  <div className="flex flex-col items-center">
                    <span
                      className="w-3 h-3 rounded-full mt-1"
                      style={{ background: s.done ? '#059669' : '#fff', boxShadow: `0 0 0 4px ${s.done ? '#d1fae5' : '#cfe8fa'}` }}
                    />
                    {i < steps.length - 1 && <span className="flex-1 w-0.5 bg-sky-100 min-h-6" />}
                  </div>
                  <div className="pb-4">
                    <div className="text-sm font-semibold text-ink">{s.label}</div>
                    <div className="text-[12.5px] text-[#667085]">{s.date ? num(fmtDate(s.date), lang) : tr('To be announced', 'पछि घोषणा हुने')}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {(has(vacancy.application_instructions) || vacancy.required_documents?.length > 0 || quotas.length > 0) && (
            <section className={`${CARD} p-[22px]`}>
              <h2 className={`${cardTitle} mb-2`}>{tr('How to apply', 'आवेदन कसरी दिने')}</h2>
              {has(vacancy.application_instructions) && <p className="text-[14.5px] leading-relaxed text-ink-soft">{vacancy.application_instructions}</p>}
              {vacancy.required_documents?.length > 0 && (
                <ul className="mt-4 flex flex-col gap-2">
                  {vacancy.required_documents.map((doc, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[14px] text-ink">
                      <span className="mt-0.5 w-5 h-5 rounded-md bg-sky-100 inline-flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      {doc}
                    </li>
                  ))}
                </ul>
              )}
              {quotas.length > 0 && (
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {quotas.map(([k, v]) => (
                    <div key={k} className="bg-sky-50 rounded-[14px] px-3 py-2.5">
                      <div className="font-display text-xl font-semibold text-ink">{num(v, lang)}</div>
                      <div className="text-[11.5px] text-[#667085]">{k}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* RIGHT: sticky apply panel */}
        <aside className="flex-[1_1_300px] max-w-full lg:sticky lg:top-24 flex flex-col gap-3.5">
          <div className={`${CARD} p-[22px] flex flex-col gap-3.5`}>
            {m && (
              <div className="flex items-center gap-3.5">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `conic-gradient(${match >= 80 ? '#059669' : '#5ea9e2'} ${match * 3.6}deg, #e4f2fc 0)` }}
                  role="img"
                  aria-label={tr(`${match}% match`, `${num(match, lang)}% मिलान`)}
                >
                  <div className="w-[50px] h-[50px] rounded-full bg-white flex items-center justify-center font-bold text-[15px] text-ink">{num(match, lang)}%</div>
                </div>
                <div>
                  <div className="text-xs text-[#667085]">{tr('Profile match score', 'प्रोफाइल मिलान प्रतिशत')}</div>
                  <div className="text-sm font-semibold leading-[1.35] text-ink">
                    {match >= 80
                      ? tr('Strong fit for your profile', 'तपाईंको प्रोफाइलसँग राम्रो मेल')
                      : match >= 50
                        ? tr('Partial fit — check the details', 'आंशिक मेल — विवरण जाँच्नुहोस्')
                        : tr('Your profile may not qualify', 'तपाईंको प्रोफाइल योग्य नहुन सक्छ')}
                  </div>
                </div>
              </div>
            )}
            <div
              className="rounded-2xl px-3.5 py-3 text-[13.5px] font-semibold"
              style={closed ? { background: '#eef2f6', color: '#667085' } : { background: u.bg, color: u.fg }}
            >
              {closed
                ? tr(`Closed on ${fmtDate(deadline)}`, `${num(fmtDate(deadline), lang)} मा बन्द भयो`)
                : Number.isFinite(dl)
                  ? tr(`Closes ${fmtDate(deadline)} · ${dl} days left`, `${num(fmtDate(deadline), lang)} मा बन्द · ${num(dl, lang)} दिन बाँकी`)
                  : tr('Open until filled', 'पद पूर्ति नभएसम्म खुला')}
            </div>
            {applyHref ? (
              <a
                href={applyHref}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 rounded-full bg-ink text-white text-[15px] font-medium shadow-pill inline-flex items-center justify-center hover:bg-black transition"
              >
                {tr('Official apply', 'आधिकारिक फाराम भर्नुहोस्')} ↗
              </a>
            ) : null}
            <button
              onClick={() => onBookmark(vacancy)}
              aria-pressed={isBookmarked}
              className="h-12 rounded-full border text-[15px] text-ink transition"
              style={{ borderColor: isBookmarked ? '#a7f3d0' : '#d0d5dd', background: isBookmarked ? '#f0fdf6' : '#fff' }}
            >
              {isBookmarked ? tr('✓ Saved to tracker', '✓ ट्र्याकरमा राखियो') : tr('Track this application', 'यो आवेदन ट्र्याक गर्नुहोस्')}
            </button>
            <div className="flex gap-2">
              <button onClick={share} className="flex-1 h-10 rounded-full bg-sky-50 text-[13px] text-ink inline-flex items-center justify-center gap-1.5 hover:bg-sky-100 transition">
                <Share2 className="w-3.5 h-3.5" />
                {copied ? tr('Link copied', 'लिंक कपी भयो') : tr('Share', 'सेयर')}
              </button>
              <button onClick={remind} className="flex-1 h-10 rounded-full bg-sky-50 text-[13px] text-ink inline-flex items-center justify-center gap-1.5 hover:bg-sky-100 transition">
                <CalendarPlus className="w-3.5 h-3.5" />
                {tr('Remind me', 'रिमाइन्डर')}
              </button>
            </div>
            <p className="text-[11.5px] text-[#667085] leading-normal flex gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-px text-[#059669]" />
              <span>
                {tr(
                  `Source: ${vacancy.official_source_name || vacancy.shortOrg || vacancy.organization}. SarkariSajha is not a government entity. Always apply on the official commission portal.`,
                  `स्रोत: ${vacancy.official_source_name || vacancy.shortOrg || vacancy.organization}। सरकारी साझा सरकारी निकाय होइन। सधैं आधिकारिक पोर्टलमा दरखास्त दिनुहोस्।`
                )}
              </span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
