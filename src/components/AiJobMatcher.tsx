import React, { useMemo, useRef, useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { UserProfile, Vacancy, Language } from '../types';
import { num, L, matchScore, H1 } from '../utils/ui';

interface AiJobMatcherProps {
  userProfile: UserProfile;
  vacancies: Vacancy[];
  lang: Language;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onSelectVacancy: (vacancy: Vacancy) => void;
}

const SAMPLE_CV = `Aarav Sharma — Bhaktapur, Bagmati Province. Date of birth 2058-03-12 (age 24).
Education: Bachelor of Information Technology (BIT), Tribhuvan University, 2080, first division.
+2 Science, NEB, 2076. SEE, 2074.
Experience: 1.5 years junior web developer at a Kathmandu software company. Computer operator training (6 months).
Skills: networking, databases, MS Office, Nepali and English typing. Nepali citizen.`;

type Stage = 'upload' | 'parsing' | 'done';

export const AiJobMatcher: React.FC<AiJobMatcherProps> = ({ userProfile, vacancies, lang, onUpdateProfile, onSelectVacancy }) => {
  const tr = L(lang);
  const [stage, setStage] = useState<Stage>(userProfile.resumeText ? 'done' : 'upload');
  const [fileName, setFileName] = useState<string>(userProfile.resumeText ? tr('Saved CV', 'सुरक्षित सीभी') : '');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const parse = async (text: string, name: string) => {
    if (text.trim().length < 15) {
      setError(tr('Add a little more CV text (at least 15 characters).', 'कम्तीमा १५ अक्षरको सीभी विवरण राख्नुहोस्।'));
      return;
    }
    setError(null);
    setFileName(name);
    setStage('parsing');
    const started = Date.now();
    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text })
      });
      const data = await res.json();
      // Keep the skeleton up for ~1.3s so the state change reads clearly.
      const wait = Math.max(0, 1300 - (Date.now() - started));
      await new Promise((r) => setTimeout(r, wait));
      if (data.success && data.profile) {
        onUpdateProfile({ ...data.profile, resumeText: text });
        setStage('done');
      } else {
        setError(data.error || tr('We could not read that CV. Try pasting the text instead.', 'सीभी पढ्न सकिएन। पाठ टाँसेर प्रयास गर्नुहोस्।'));
        setStage('upload');
      }
    } catch {
      setError(tr('Could not reach the CV reader. Check your connection and try again.', 'सीभी पढ्ने सेवामा पुग्न सकिएन। फेरि प्रयास गर्नुहोस्।'));
      setStage('upload');
    }
  };

  const readFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError(tr('That file is over 5 MB.', 'फाइल ५ MB भन्दा ठूलो छ।'));
      return;
    }
    if (!/\.(txt|md)$/i.test(file.name) && !file.type.startsWith('text/')) {
      setError(tr('For now, upload a .txt file or paste your CV text.', 'अहिलेलाई .txt फाइल राख्नुहोस् वा सीभीको पाठ टाँस्नुहोस्।'));
      setPasteOpen(true);
      return;
    }
    parse(await file.text(), file.name);
  };

  const ranked = useMemo(
    () =>
      vacancies
        .map((v) => ({ v, m: matchScore(v, userProfile) }))
        .sort((a, b) => b.m.score - a.m.score)
        .slice(0, 6),
    [vacancies, userProfile]
  );

  const color = (s: number) => (s >= 80 ? '#059669' : s >= 60 ? '#5ea9e2' : '#98a2b3');
  const profileChips = [
    userProfile.qualificationLevel,
    userProfile.fieldOfStudy,
    typeof userProfile.age === 'number' ? tr(`${userProfile.age} yrs`, `${num(userProfile.age, lang)} वर्ष`) : '',
    userProfile.province,
    userProfile.district
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-5 pt-7 pb-6">
      <header className="flex flex-col gap-2">
        <h1 className={H1.replace('lg:text-[56px]', 'lg:text-[48px]')}>{tr('Which vacancies fit you?', 'कुन विज्ञापन तपाईंलाई मिल्छ?')}</h1>
        <p className="max-w-[38rem] text-[15px] leading-relaxed text-ink-soft">
          {tr(
            'Add your CV. We read qualification, age and experience, then score every open notice against PSC eligibility rules.',
            'आफ्नो सीभी राख्नुहोस्। हामी योग्यता, उमेर र अनुभव पढेर हरेक विज्ञापनसँग मिलाउँछौं।'
          )}
        </p>
      </header>

      {stage === 'upload' && (
        <div className="bg-white rounded-[28px] p-2.5 shadow-soft">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) readFile(f);
            }}
            className={`border-2 border-dashed rounded-[22px] px-5 py-11 flex flex-col items-center gap-3 text-center transition ${
              dragOver ? 'border-[#5ea9e2] bg-sky-100' : 'border-[#b3dbf7] bg-sky-50'
            }`}
          >
            <div className="w-14 h-14 rounded-[18px] bg-white flex items-center justify-center shadow-[0_1px_2px_rgb(11_18_32/0.06)]">
              <FileUp className="w-6 h-6 text-ink" strokeWidth={1.8} />
            </div>
            <div className="font-semibold text-base text-ink">{tr('Drop your CV here', 'सीभी यहाँ राख्नुहोस्')}</div>
            <div className="text-[13px] text-[#667085]">{tr('Text file or pasted text · up to 5 MB · never shared', 'पाठ फाइल वा टाँसिएको पाठ · ५ MB सम्म')}</div>
            <div className="flex gap-2.5 flex-wrap justify-center mt-1.5">
              <button
                onClick={() => parse(SAMPLE_CV, 'sample_cv.txt')}
                className="h-[46px] px-5 rounded-full bg-ink text-white text-[14.5px] shadow-pill hover:bg-black transition"
              >
                {tr('Try with sample CV', 'नमुना सीभी प्रयोग गर्नुहोस्')}
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="h-[46px] px-5 rounded-full border border-[#d0d5dd] bg-white text-[14.5px] text-ink hover:bg-sky-50 transition"
              >
                {tr('Browse files', 'फाइल छान्नुहोस्')}
              </button>
              <button
                onClick={() => setPasteOpen((o) => !o)}
                className="h-[46px] px-5 rounded-full border border-[#d0d5dd] bg-white text-[14.5px] text-ink hover:bg-sky-50 transition"
                aria-expanded={pasteOpen}
              >
                {tr('Paste text', 'पाठ टाँस्नुहोस्')}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md,text/plain"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) readFile(f);
                  e.target.value = '';
                }}
              />
            </div>
            {pasteOpen && (
              <div className="w-full max-w-xl mt-3 flex flex-col gap-2 text-left">
                <label htmlFor="cv-text" className="text-xs text-[#667085] pl-1">
                  {tr('CV text', 'सीभीको पाठ')}
                </label>
                <textarea
                  id="cv-text"
                  value={pasted}
                  onChange={(e) => setPasted(e.target.value)}
                  rows={6}
                  placeholder={tr('Education, date of birth, experience, province…', 'शिक्षा, जन्म मिति, अनुभव, प्रदेश…')}
                  className="w-full rounded-[18px] bg-white border border-[#e4e7ec] p-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
                <button
                  onClick={() => parse(pasted, tr('Pasted CV', 'टाँसिएको सीभी'))}
                  className="self-end h-11 px-5 rounded-full bg-ink text-white text-sm hover:bg-black transition"
                >
                  {tr('Read my CV', 'सीभी पढ्नुहोस्')}
                </button>
              </div>
            )}
            {error && (
              <p role="alert" className="text-[13px] text-[#be123c] mt-1">
                {error}
              </p>
            )}
          </div>
        </div>
      )}

      {stage === 'parsing' && (
        <div className="bg-white rounded-[28px] p-7 flex flex-col gap-3.5 shadow-soft" aria-busy="true">
          <div className="font-semibold text-ink flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {tr('Reading your CV with Gemini…', 'जेमिनीले सीभी पढ्दै…')}
          </div>
          {[70, 90, 55].map((w) => (
            <div key={w} className="h-3.5 rounded-lg animate-pulse bg-gradient-to-r from-[#eef2f6] via-[#f8fafc] to-[#eef2f6]" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}

      {stage === 'done' && (
        <>
          <div className="bg-white rounded-[24px] px-5 py-[18px] flex flex-wrap items-center gap-2.5 shadow-soft">
            <div className="flex items-center gap-2.5 mr-2">
              <span className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center font-semibold">
                {(userProfile.name || 'U').charAt(0).toUpperCase()}
              </span>
              <div>
                <div className="font-semibold text-[14.5px] text-ink">{userProfile.name || tr('Your profile', 'तपाईंको प्रोफाइल')}</div>
                <div className="text-xs text-[#667085]">{fileName || tr('Saved CV', 'सुरक्षित सीभी')}</div>
              </div>
            </div>
            {profileChips.map((c) => (
              <span key={c} className="text-[12.5px] px-[11px] py-1.5 rounded-full bg-sky-50 text-ink">
                {c}
              </span>
            ))}
            <button onClick={() => setStage('upload')} className="ml-auto text-[13px] underline underline-offset-2 text-ink">
              {tr('Replace CV', 'सीभी बदल्नुहोस्')}
            </button>
          </div>

          <ol className="flex flex-col gap-3">
            {ranked.map(({ v, m }, i) => {
              const top = i === 0 && m.score >= 60;
              const why = [
                { ok: m.qualOk, text: m.qualOk ? tr('✓ Qualification', '✓ योग्यता') : tr('✕ Qualification', '✕ योग्यता') },
                { ok: m.ageOk, text: m.ageOk ? tr('✓ Age', '✓ उमेर') : tr('✕ Age', '✕ उमेर') },
                { ok: null, text: m.provOk ? tr('✓ Province', '✓ प्रदेश') : tr('Other province', 'अर्को प्रदेश') }
              ];
              return (
                <li key={v.id}>
                  <button
                    onClick={() => onSelectVacancy(v)}
                    className="w-full text-left bg-white rounded-[22px] px-5 py-4 flex flex-wrap items-center gap-x-5 gap-y-3.5 shadow-[0_1px_2px_rgb(11_18_32/0.04),0_12px_32px_-12px_rgb(11_18_32/0.1)] hover:-translate-y-0.5 transition"
                    style={{ outline: top ? '2px solid #fcd34d' : 'none' }}
                  >
                    <div className="w-[52px] flex-none font-display text-[26px] font-semibold" style={{ color: color(m.score) }}>
                      {num(m.score, lang)}%
                    </div>
                    <div className="flex-[1_1_260px] min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[15px] text-ink">{lang === 'np' && v.titleNp ? v.titleNp : v.title}</span>
                        {top && (
                          <span className="text-[11px] font-semibold px-2 py-[3px] rounded-full bg-[#fef3c7] text-[#92400e]">{tr('Top match', 'उत्कृष्ट मिलान')}</span>
                        )}
                      </div>
                      <div className="h-1.5 rounded-full bg-sky-100 overflow-hidden max-w-[360px]">
                        <div className="h-full transition-[width] duration-300" style={{ width: `${m.score}%`, background: color(m.score) }} />
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {why.map((w) => (
                        <span
                          key={w.text}
                          className="text-xs px-[9px] py-1 rounded-full"
                          style={
                            w.ok === null
                              ? { background: '#f3f9fe', color: '#0b1220' }
                              : w.ok
                                ? { background: '#ecfdf5', color: '#047857' }
                                : { background: '#fff1f2', color: '#be123c' }
                          }
                        >
                          {w.text}
                        </span>
                      ))}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
};
