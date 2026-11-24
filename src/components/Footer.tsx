import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Language, Theme } from '../types';

interface FooterProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenInstallPrompt?: () => void;
}

const PORTALS = [
  { label: 'Lok Sewa (PSC)', href: 'https://pps.psc.gov.np' },
  { label: 'TSC', href: 'https://online.tsc.gov.np' },
  { label: 'PSC Gazette', href: 'https://psc.gov.np' },
  { label: 'Nepal Rastra Bank', href: 'https://nrb.org.np' }
];

export const Footer: React.FC<FooterProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  setActiveTab,
  onOpenInstallPrompt
}) => {
  const np = lang === 'np';

  const nav = [
    { id: 'vacancies', label: np ? 'विज्ञापन' : 'Vacancies' },
    { id: 'syllabus', label: np ? 'पाठ्यक्रम' : 'Syllabus' },
    { id: 'quizzes', label: np ? 'क्विज' : 'Quiz' },
    { id: 'ai_assistant', label: np ? 'एआई' : 'AI Assistant' },
    { id: 'about', label: np ? 'हाम्रो बारेमा' : 'About' }
  ];

  const legal = [
    { id: 'privacy', label: np ? 'गोपनीयता' : 'Privacy' },
    { id: 'terms', label: np ? 'सर्तहरू' : 'Terms' },
    { id: 'disclaimer', label: np ? 'अस्वीकरण' : 'Disclaimer' },
    { id: 'contact', label: np ? 'सम्पर्क' : 'Contact' }
  ];

  const go = (id: string) => {
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quiet = 'hover:text-ink dark:hover:text-white transition';

  return (
    <footer className="px-3 sm:px-6 pb-28 lg:pb-6">
      <div className="max-w-6xl mx-auto overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-sky-100 via-sky-200 to-[#8fcaf3] dark:from-[#0f2236] dark:via-[#0b1828] dark:to-[#0a121d] ring-1 ring-black/[0.03] dark:ring-white/5">
        <div className="px-6 sm:px-10 pt-14 sm:pt-20 pb-8">
          <p className="max-w-xl mx-auto text-center text-sm text-ink-soft dark:text-slate-400 leading-relaxed">
            {np
              ? 'सरकारी साझा स्वतन्त्र सूचना तथा परीक्षा तयारी प्लेटफर्म हो, आधिकारिक सरकारी वेबसाइट होइन। आवेदन गर्नु अघि सम्बन्धित निकायबाट विवरण पुष्टि गर्नुहोस्।'
              : 'SarkariSajha is an independent information and exam-prep platform, not an official government website. Always verify details with the issuing authority before applying.'}
          </p>

          <p
            aria-hidden="true"
            className="mt-10 sm:mt-14 text-center font-display font-bold tracking-tighter leading-none text-white dark:text-white/90 text-[18vw] sm:text-[15vw] lg:text-[11.5rem] [text-shadow:0_6px_0_rgb(47_124_191/0.35)] select-none"
          >
            SarkariSajha
          </p>

          <nav
            aria-label="Footer"
            className="mt-8 sm:mt-10 mx-auto max-w-3xl flex flex-wrap justify-center sm:flex-nowrap sm:divide-x divide-black/5 dark:divide-white/10 rounded-3xl sm:rounded-full bg-white/60 dark:bg-white/5 backdrop-blur ring-1 ring-black/[0.04] dark:ring-white/10 p-1.5"
          >
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className="group flex-1 min-w-[45%] sm:min-w-0 flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 text-sm text-ink dark:text-slate-200 rounded-full hover:bg-white/80 dark:hover:bg-white/10 transition"
              >
                <span>{item.label}</span>
                <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition" />
              </button>
            ))}
          </nav>

          <div className="mt-10 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 text-xs text-ink-soft dark:text-slate-400">
            <span>© {new Date().getFullYear()} SarkariSajha · Kathmandu, Nepal</span>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {legal.map((l) => (
                <button key={l.id} onClick={() => go(l.id)} className={quiet}>
                  {l.label}
                </button>
              ))}
              {PORTALS.map((p) => (
                <a key={p.href} href={p.href} target="_blank" rel="noopener noreferrer" className={`hidden md:inline ${quiet}`}>
                  {p.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setLang(np ? 'en' : 'np')} className={quiet}>
                {np ? 'English' : 'नेपाली'}
              </button>
              {onOpenInstallPrompt && (
                <button onClick={onOpenInstallPrompt} className={quiet}>
                  {np ? 'एप' : 'Install app'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
