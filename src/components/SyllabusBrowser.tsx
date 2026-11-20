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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200 border border-white/10">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{lang === 'np' ? 'आधिकारिक पाठ्यक्रम तथा अध्यायवार अध्ययन' : 'Official PSC Syllabus & Chapter Study Paths'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {lang === 'np' ? 'पाठ्यक्रम ब्राउजर एवं नोटस्' : 'Syllabus Browser & Study Paths'}
            </h1>
            <p className="text-sm text-blue-200/80 leading-relaxed">
              {lang === 'np'
                ? 'शाखा अधिकृत, नायब सुब्बा, खरिदार तथा बैंकिङ पदहरूको आधिकारिक पाठ्यक्रम, महत्वपूर्ण दफावार सारांश र १-क्लिक अभ्यास क्विज।'
                : 'Interactive syllabus breakdown for Section Officer, NaSu, Kharidar, and Banking posts with chapter notes, legal citations, and linked practice drills.'}
            </p>
          </div>

          {/* Quick Voice / Text Search Bar */}
          <div className="w-full md:w-80 shrink-0">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'np' ? 'विषय वा पाठ खोज्नुहोस्...' : 'Search chapter or topic...'}
                className="w-full pl-9 pr-11 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder:text-slate-300 text-xs rounded-xl border border-white/15 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
              <button
                type="button"
                onClick={toggleListening}
                title={lang === 'np' ? 'नेपालीमा बोलेर खोज्नुहोस्' : 'Voice Search (Nepali/English)'}
                className={`absolute right-2 p-1.5 rounded-lg text-xs transition ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>
            {isListening && (
              <p className="text-[11px] text-rose-300 mt-1 font-medium animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                {lang === 'np' ? 'सुन्दैछ... नेपालीमा बोल्नुहोस्' : 'Listening... Speak in Nepali or English'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Post Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {posts.map((post) => {
          const isSelected = post.id === selectedPostId;
          return (
            <button
              key={post.id}
              onClick={() => {
                setSelectedPostId(post.id);
                setSelectedPaperIndex(0);
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <Award className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
              <div className="text-left">
                <div>{lang === 'np' ? post.nameNp : post.name}</div>
                <div className={`text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  {post.level}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Post Details Card */}
      {activePost && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          {/* Post Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {activePost.code}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activePost.organization}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {lang === 'np' ? activePost.nameNp : activePost.name}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {lang === 'np' ? activePost.descriptionNp : activePost.description}
              </p>
            </div>

            {/* Paper Selection Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/70 p-1.5 rounded-2xl shrink-0">
              {activePost.papers.map((paper, idx) => (
                <button
                  key={paper.id}
                  onClick={() => setSelectedPaperIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedPaperIndex === idx
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Paper {paper.paperNumber} ({paper.paperType === 'objective_mcq' ? 'MCQ' : 'Subjective'})
                </button>
              ))}
            </div>
          </div>

          {/* Paper Information Strip */}
          {activePaper && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Paper Name</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{lang === 'np' ? activePaper.nameNp : activePaper.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Full Marks</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activePaper.fullMarks} Marks (Pass: {activePaper.passMarks})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Time Duration</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activePaper.timeDurationMinutes} Minutes</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Exam Format</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  {activePaper.paperType === 'objective_mcq' ? '1st Phase MCQ (0.20 Neg)' : '2nd Phase Subjective Written'}
                </span>
              </div>
            </div>
          )}

          {/* Chapter List & Accordion */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>
                  {lang === 'np' ? 'अध्याय तथा खण्ड सूची' : 'Chapter Syllabus & Structured Notes'}
                </span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full font-normal text-slate-500">
                  {filteredChapters.length} {filteredChapters.length === 1 ? 'Chapter' : 'Chapters'}
                </span>
              </h3>

              {downloadSuccess && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Notes downloaded successfully!</span>
                </div>
              )}
            </div>

            {filteredChapters.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                <p className="text-sm text-slate-500">No chapters match "{searchQuery}".</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Clear search filter
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredChapters.map((chapter) => {
                  const isExpanded = expandedChapterId === chapter.id;

                  return (
                    <div
                      key={chapter.id}
                      className={`border rounded-2xl transition overflow-hidden ${
                        isExpanded
                          ? 'border-blue-300 dark:border-blue-800/80 bg-blue-50/20 dark:bg-blue-950/10'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Chapter Title Row */}
                      <button
                        type="button"
                        onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                        className="w-full p-4 flex items-center justify-between gap-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isExpanded
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {chapter.chapterNumber}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {lang === 'np' ? chapter.titleNp : chapter.title}
                            </h4>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {chapter.weightageMarks && (
                                <span className="font-semibold text-amber-600 dark:text-amber-400">
                                  Weightage: {chapter.weightageMarks} Marks
                                </span>
                              )}
                              <span>•</span>
                              <span>{chapter.topics.length} Sub-topics</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {chapter.practiceQuizSetId && (
                            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <Sparkles className="w-3 h-3" />
                              Drill Linked
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Chapter Details */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-blue-100 dark:border-blue-900/40 text-xs">
                          {/* Summary Notes (Bilingual) */}
                          <div className="space-y-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                                <FileText className="w-3.5 h-3.5 text-blue-600" />
                                {lang === 'np' ? 'विषयवस्तुको सारंश (Quick Revision Notes)' : 'Quick Revision Summary Notes'}
                              </span>
                              <button
                                onClick={() => handleDownloadNotes(chapter)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                                  isPro
                                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300'
                                    : 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                }`}
                              >
                                {isPro ? (
                                  <>
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Notes</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3 h-3 text-amber-600" />
                                    <span>Unlock PDF Notes (Pro)</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              {lang === 'np' ? chapter.summaryNotesNp : chapter.summaryNotesEn}
                            </p>
                          </div>

                          {/* Key Constitutional / Legal Articles */}
                          {chapter.keyArticles && chapter.keyArticles.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                Relevant Legal & Constitutional Provisions
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {chapter.keyArticles.map((art, aIdx) => (
                                  <span
                                    key={aIdx}
                                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-[11px] font-mono border border-slate-200 dark:border-slate-700"
                                  >
                                    {art}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sub-Topics Breakdown */}
                          <div className="space-y-2">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                              Sub-Topic Syllabus Items
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {chapter.topics.map((top) => (
                                <div
                                  key={top.id}
                                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1.5"
                                >
                                  <div className="font-bold text-slate-900 dark:text-slate-100">
                                    {lang === 'np' ? top.titleNp : top.title}
                                  </div>
                                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                                    {top.keyPoints.map((pt, pIdx) => (
                                      <li key={pIdx} className="flex items-start gap-1.5">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        <span>{pt}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons: 1-Click Practice Drill / AI Written Evaluator */}
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                            {chapter.practiceQuizSetId && onLaunchQuiz && (
                              <button
                                type="button"
                                onClick={() => onLaunchQuiz(chapter.practiceQuizSetId!)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-xs shadow-sm hover:from-emerald-500 hover:to-teal-500 transition"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{lang === 'np' ? 'यस अध्यायको मोडल क्विज सुरु गर्नुहोस्' : 'Launch Chapter Practice Drill'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {activePaper.paperType === 'subjective_written' && onOpenSubjective && (
                              <button
                                type="button"
                                onClick={() => onOpenSubjective(activePost.name)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-xs shadow-sm hover:from-purple-500 hover:to-indigo-500 transition"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>{lang === 'np' ? 'AI लिखित उत्तर परीक्षकमा जानुहोस्' : 'Practice Subjective Written Evaluation'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
