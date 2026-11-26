import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Search,
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  Download,
  GraduationCap,
  Award,
  Layers,
  ChevronDown,
  ChevronRight,
  Lock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { SyllabusPost, SyllabusPaper, SyllabusChapter, Language, UserSubscription } from '../types';
import { INITIAL_SYLLABUS_POSTS } from '../data/seedData';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { setPageSEO, setSyllabusSchema, setBreadcrumbSchema } from '../utils/seo';
import { num, L, H1 } from '../utils/ui';

interface SyllabusBrowserProps {
  lang: Language;
  onLaunchQuiz?: (quizSetId: string) => void;
  onOpenSubjective?: (examProfile: string) => void;
  onOpenUpgrade?: () => void;
  subscription?: UserSubscription;
}

export function SyllabusBrowser({
  lang,
  onLaunchQuiz,
  onOpenSubjective,
  onOpenUpgrade,
  subscription
}: SyllabusBrowserProps) {
  const [posts, setPosts] = useState<SyllabusPost[]>(INITIAL_SYLLABUS_POSTS);
  const [selectedPostId, setSelectedPostId] = useState<string>(
    INITIAL_SYLLABUS_POSTS[0]?.id || 'post_sakha_adhikrit'
  );
  const [selectedPaperIndex, setSelectedPaperIndex] = useState<number>(0);
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>('chap_so_1_1');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Devanagari Voice to Text
  const { isListening, toggleListening, transcript } = useSpeechToText({
    lang: lang === 'np' ? 'ne-NP' : 'en-US',
    onTranscript: (t) => setSearchQuery(t)
  });

  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    fetch('/api/syllabus')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data);
          if (data.length > 0) {
            setSelectedPostId(data[0].id);
          }
        }
      })
      .catch(err => console.error('Error fetching syllabus:', err))
      .finally(() => setLoading(false));
  }, []);

  const activePost = posts.find(p => p.id === selectedPostId) || posts[0];
  const activePaper: SyllabusPaper | undefined = activePost?.papers?.[selectedPaperIndex] || activePost?.papers?.[0];

  // Dynamic Syllabus Post SEO & Structured Schema
  useEffect(() => {
    if (activePost) {
      setPageSEO({
        title: lang === 'np'
          ? `${activePost.nameNp} (${activePost.name}) पाठ्यक्रम, परीक्षा योजना तथा संक्षिप्त नोटहरू – SarkariSajha`
          : `${activePost.name} (${activePost.level}) Official PSC Syllabus & Study Guide – SarkariSajha`,
        description: `Official Lok Sewa Aayog curriculum for ${activePost.name} (${activePost.level}). View syllabus papers, key constitutional articles, and revision digests.`,
        canonicalUrl: `${window.location.origin}/syllabus`
      });
      setSyllabusSchema(activePost);
      setBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Syllabus', path: '/syllabus' },
        { name: activePost.name, path: `/syllabus` }
      ]);
    }
  }, [activePost, lang]);

  // Filter chapters based on search query
  const filteredChapters = (activePaper?.chapters || []).filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = c.title.toLowerCase().includes(q) || c.titleNp.includes(q);
    const summaryMatch = c.summaryNotesEn.toLowerCase().includes(q) || c.summaryNotesNp.includes(q);
    const topicMatch = c.topics.some(t => t.title.toLowerCase().includes(q) || t.titleNp.includes(q));
    return titleMatch || summaryMatch || topicMatch;
  });

  const isPro = subscription?.tier === 'pro' || subscription?.tier === 'yearly_pro';

  const handleDownloadNotes = (chapter: SyllabusChapter) => {
    if (!isPro) {
      if (onOpenUpgrade) onOpenUpgrade();
      return;
    }

    // Generate downloadable study text
    const textContent = `=====================================================
SARKARISAJHA - LOK SEWA REVISION DIGEST
Post: ${activePost?.name} (${activePost?.nameNp})
Paper: ${activePaper?.name}
Chapter: ${chapter.title} (${chapter.titleNp})
=====================================================

OVERVIEW & CONSTITUTIONAL FRAMEWORK:
${chapter.summaryNotesEn}

नेपाली सारंश:
${chapter.summaryNotesNp}

KEY STATUTORY / LEGAL CITATIONS:
${(chapter.keyArticles || []).map(a => `• ${a}`).join('\n')}

TOPIC BREAKDOWN & STUDY POINTS:
${chapter.topics.map(t => `
--- ${t.title} (${t.titleNp}) ---
${t.keyPoints.map(p => `• ${p}`).join('\n')}
${t.statutoryCitations ? 'Citations: ' + t.statutoryCitations.join(', ') : ''}
`).join('\n')}

Downloaded from SarkariSajha Exam Portal: ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SarkariSajha_${activePost?.code}_${chapter.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(chapter.id);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const tr = L(lang);
  const np = lang === 'np';
  const PAPER_TINTS = ['#cfe4ff', '#c9f3e1', '#ffe0c7', '#ffd6e3', '#e3f7c4', '#e6d9ff'];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const [openPapers, setOpenPapers] = useState<Record<string, boolean>>({});
  const q = searchQuery.trim().toLowerCase();
  const chapterMatches = (c: SyllabusChapter) =>
    !q ||
    c.title.toLowerCase().includes(q) ||
    c.titleNp.includes(q) ||
    c.topics.some((t) => t.title.toLowerCase().includes(q) || t.titleNp.includes(q));

  const modeLabel = (p: SyllabusPaper) =>
    p.paperType === 'objective_mcq' ? tr('MCQ', 'वस्तुगत') : p.paperType === 'practical' ? tr('Practical', 'प्रयोगात्मक') : tr('Subjective', 'विषयगत');
  const duration = (m: number) => (m >= 60 ? tr(`${m / 60} hr`, `${num(m / 60, lang)} घण्टा`) : tr(`${m} min`, `${num(m, lang)} मिनेट`));

  return (
    <div className="flex flex-col gap-5 pt-7 pb-6">
      <header className="flex flex-col gap-2">
        <h1 className={H1.replace('lg:text-[56px]', 'lg:text-[48px]')}>{tr('Syllabus & papers', 'पाठ्यक्रम र पत्रहरू')}</h1>
        <p className="max-w-[38rem] text-[15px] leading-relaxed text-ink-soft">
          {tr('Official PSC syllabus, broken down by paper and marks weightage.', 'लोक सेवा आयोगको आधिकारिक पाठ्यक्रम, पत्र र अंकभार अनुसार।')}
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 max-w-full" role="tablist" aria-label={tr('Exam', 'परीक्षा')}>
          {posts.map((p) => {
            const active = p.id === activePost?.id;
            return (
              <button
                key={p.id}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setSelectedPostId(p.id);
                  setSelectedPaperIndex(0);
                  setOpenPapers({});
                }}
                className={`flex-none h-10 px-4 rounded-full text-[13.5px] whitespace-nowrap transition ${active ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-sky-50'}`}
              >
                {np ? p.nameNp : p.name}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 h-10 pl-4 pr-1.5 rounded-full bg-white shadow-[0_1px_2px_rgb(11_18_32/0.05)] w-full sm:w-72">
          <Search className="w-4 h-4 text-[#98a2b3] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tr('Search a topic…', 'विषय खोज्नुहोस्…')}
            aria-label={tr('Search a topic', 'विषय खोज्नुहोस्')}
            className="flex-1 min-w-0 bg-transparent text-sm text-ink placeholder:text-[#98a2b3] focus:outline-none"
          />
          <button
            type="button"
            onClick={toggleListening}
            aria-label={tr('Voice search', 'बोलेर खोज्नुहोस्')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${isListening ? 'bg-rose-500 text-white' : 'text-[#667085] hover:bg-sky-50'}`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
        </label>
      </div>

      {loading && posts.length === 0 ? (
        <div className="bg-white rounded-[24px] h-24 animate-pulse shadow-soft" />
      ) : (
        <div className="flex flex-col gap-3">
          {(activePost?.papers || []).map((paper, pi) => {
            const chapters = paper.chapters.filter(chapterMatches);
            const open = q ? chapters.length > 0 : openPapers[paper.id] ?? pi === 0;
            if (q && chapters.length === 0) return null;
            return (
              <section key={paper.id} className="bg-white rounded-[24px] overflow-hidden shadow-soft">
                <button
                  onClick={() => setOpenPapers((o) => ({ ...o, [paper.id]: !open }))}
                  aria-expanded={open}
                  className="w-full text-left px-[22px] py-[18px] flex items-center gap-3.5 text-ink"
                >
                  <span
                    className="w-11 h-11 flex-none rounded-[14px] flex items-center justify-center font-display font-semibold"
                    style={{ background: PAPER_TINTS[pi % PAPER_TINTS.length] }}
                  >
                    {ROMAN[pi] || num(pi + 1, lang)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-[15.5px]">{np ? paper.nameNp : paper.name}</span>
                    <span className="block text-[12.5px] text-[#667085] mt-0.5">
                      {modeLabel(paper)} · {duration(paper.timeDurationMinutes)} · {num(paper.fullMarks, lang)} {tr('marks', 'अंक')} · {num(paper.chapters.length, lang)}{' '}
                      {tr('units', 'एकाइ')}
                    </span>
                  </span>
                  <span className="text-lg text-ink-soft w-5 text-center" aria-hidden="true">
                    {open ? '−' : '+'}
                  </span>
                </button>
                {open && (
                  <div className="px-[22px] pb-3.5">
                    {chapters.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 py-3 border-t border-[#eef2f6] flex-wrap">
                        <span className="flex-[1_1_200px] text-sm text-ink">{np ? c.titleNp : c.title}</span>
                        <span className="text-[13px] text-ink-soft w-[70px]">
                          {c.weightageMarks ? `${num(c.weightageMarks, lang)} ${tr('marks', 'अंक')}` : '—'}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleDownloadNotes(c)}
                            className="h-[34px] px-3 rounded-full text-[12.5px] text-ink-soft hover:text-ink hover:bg-sky-50 transition"
                            title={isPro ? tr('Download notes', 'नोट डाउनलोड') : tr('Notes are a Pro feature', 'नोट प्रो सुविधा हो')}
                          >
                            {downloadSuccess === c.id ? tr('Saved ✓', 'सुरक्षित ✓') : tr('Notes', 'नोट')}
                          </button>
                          <button
                            onClick={() => onLaunchQuiz?.(c.practiceQuizSetId || '')}
                            className="h-[34px] px-3.5 rounded-full border border-[#d0d5dd] bg-white text-[12.5px] text-ink hover:bg-sky-50 transition"
                          >
                            {tr('Practice', 'अभ्यास')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
          {q && (activePost?.papers || []).every((p) => p.chapters.filter(chapterMatches).length === 0) && (
            <p className="py-8 text-center text-sm text-[#667085]">{tr('No topic matches that search.', 'खोजसँग मिल्ने विषय भेटिएन।')}</p>
          )}
        </div>
      )}
    </div>
  );
}
