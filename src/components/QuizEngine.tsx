import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  Trophy,
  HelpCircle,
  Loader2,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  BarChart2,
  Bookmark,
  Languages,
  Check,
  Zap,
  Target,
  Sliders,
  Compass,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Filter
} from 'lucide-react';
import { QuizSet, QuizQuestion, QuizAttempt, Language, UserProfile, QuizCategoryItem, ExamProfile } from '../types';
import { t } from '../utils/translations';
import { Leaderboard } from './Leaderboard';
import { num, L, H1 } from '../utils/ui';
import { tintBand } from '../utils/tints';

interface QuizEngineProps {
  quizSets: QuizSet[];
  lang: Language;
  userProfile?: UserProfile;
  onAttemptComplete?: (attempt: QuizAttempt) => void;
  initialQuizSetId?: string;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  quizSets,
  lang,
  userProfile,
  onAttemptComplete,
  initialQuizSetId
}) => {
  const [subTab, setSubTab] = useState<'quizzes' | 'ai_drill' | 'leaderboard'>('quizzes');
  const [selectedSet, setSelectedSet] = useState<QuizSet | null>(null);

  // Auto-select initial quiz set if provided
  useEffect(() => {
    if (initialQuizSetId && quizSets.length > 0) {
      const found = quizSets.find(q => q.id === initialQuizSetId);
      if (found) {
        handleStartQuiz(found);
      }
    }
  }, [initialQuizSetId, quizSets]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | number[] | boolean | string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [quizState, setQuizState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);
  const [leaderboard, setLeaderboard] = useState<QuizAttempt[]>([]);

  // Quiz Engine Options
  const [randomizeQuestions, setRandomizeQuestions] = useState<boolean>(false);
  const [randomizeOptions, setRandomizeOptions] = useState<boolean>(false);
  const [customPassThreshold, setCustomPassThreshold] = useState<number>(40);
  const [customNegativeRate, setCustomNegativeRate] = useState<number>(0.20);

  // Categories & Exam Profiles
  const [categories, setCategories] = useState<QuizCategoryItem[]>([]);
  const [examProfiles, setExamProfiles] = useState<ExamProfile[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('all');

  // Candidate Bilingual Toggle
  const [questionLangMode, setQuestionLangMode] = useState<'both' | 'np' | 'en'>('both');

  // AI Personalized Drill State
  const [aiDrillTopic, setAiDrillTopic] = useState<string>('Nepal Constitution & Governance');
  const [aiDrillExam, setAiDrillExam] = useState<string>('Section Officer (Sakha Adhikrit)');
  const [aiDrillDifficulty, setAiDrillDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [generatingDrill, setGeneratingDrill] = useState(false);

  // Deep AI Explanations per question
  const [aiExplanations, setAiExplanations] = useState<Record<string, { explanationEn: string; explanationNp: string; mnemonicTip: string }>>({});
  const [loadingAiExplain, setLoadingAiExplain] = useState<Record<string, boolean>>({});

  const questionCardRef = useRef<HTMLDivElement>(null);

  // Helper to shuffle arrays
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Process questions with randomize options if enabled
  const prepareQuestions = (rawQuestions: QuizQuestion[], doRandomQ: boolean, doRandomOpts: boolean) => {
    let list = [...rawQuestions];
    if (doRandomQ) {
      list = shuffleArray(list);
    }
    if (doRandomOpts) {
      list = list.map(q => {
        if (q.questionType === 'true_false' || !q.options || q.options.length <= 1) return q;
        // Shuffle options and recalculate correct indices
        const originalOptionsWithIndices = q.options.map((opt, idx) => ({
          opt,
          optNp: q.optionsNp?.[idx],
          origIdx: idx
        }));
        const shuffled = shuffleArray(originalOptionsWithIndices);
        const newOptions = shuffled.map(s => s.opt);
        const newOptionsNp = shuffled.map(s => s.optNp || s.opt);
        
        let newCorrectOpt = 0;
        const newCorrectAnswers: number[] = [];
        shuffled.forEach((s, newIdx) => {
          if (s.origIdx === q.correctOption) {
            newCorrectOpt = newIdx;
          }
          if (q.correctAnswers?.includes(s.origIdx)) {
            newCorrectAnswers.push(newIdx);
          }
        });

        return {
          ...q,
          options: newOptions,
          optionsNp: newOptionsNp,
          correctOption: newCorrectOpt,
          correctAnswers: newCorrectAnswers.length > 0 ? newCorrectAnswers : [newCorrectOpt]
        };
      });
    }
    return list;
  };

  // Start a Standard Quiz Set
  const handleStartQuiz = async (qs: QuizSet) => {
    try {
      const res = await fetch(`/api/quizzes/${qs.id}`);
      const data = await res.json();
      if (data.quizSet && data.questions) {
        const prepared = prepareQuestions(data.questions, randomizeQuestions, randomizeOptions);
        setSelectedSet(data.quizSet);
        setQuestions(prepared);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setFlaggedQuestions({});
        setTimeLeft(qs.timeLimitMinutes * 60);
        setQuizState('running');
        setAttemptResult(null);

        fetchLeaderboard(qs.id);
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
    }
  };

  // Generate Personalized AI Practice Drill
  const handleGenerateAiDrill = async (weakTopics?: string[]) => {
    setGeneratingDrill(true);
    try {
      const res = await fetch('/api/ai/personalized-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile?.name || 'candidate',
          weakTopics: weakTopics || [aiDrillTopic],
          examProfile: aiDrillExam,
          count: 5
        })
      });

      const data = await res.json();
      if (data.quizSet && data.questions && data.questions.length > 0) {
        setSelectedSet(data.quizSet);
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setFlaggedQuestions({});
        setTimeLeft(data.quizSet.timeLimitMinutes * 60);
        setQuizState('running');
        setAttemptResult(null);
      } else {
        alert('Failed to generate personalized AI drill. Please try again.');
      }
    } catch (err) {
      console.error('Failed AI Drill generation:', err);
      alert('Error connecting to AI diagnostic engine.');
    } finally {
      setGeneratingDrill(false);
    }
  };

  const fetchLeaderboard = async (setId: string) => {
    try {
      const res = await fetch(`/api/quizzes/${setId}/leaderboard`);
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (quizState !== 'running') return;
    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState, timeLeft]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (quizState !== 'running') return;

    const newAnswers = {
      ...userAnswers,
      [questionId]: optionIndex
    };

    setUserAnswers(newAnswers);

    // Auto-advance to next unanswered question after brief delay
    let nextUnansweredIndex = questions.findIndex(
      (q, idx) => idx > currentQuestionIndex && newAnswers[q.id] === undefined
    );

    if (nextUnansweredIndex === -1) {
      nextUnansweredIndex = questions.findIndex(
        (q) => newAnswers[q.id] === undefined
      );
    }

    setTimeout(() => {
      if (nextUnansweredIndex !== -1 && nextUnansweredIndex !== currentQuestionIndex) {
        setCurrentQuestionIndex(nextUnansweredIndex);
      }

      if (questionCardRef.current) {
        questionCardRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 300);
  };

  const handleToggleMultiSelect = (questionId: string, optionIndex: number) => {
    if (quizState !== 'running') return;

    const currentSelected = (userAnswers[questionId] as number[]) || [];
    let updated: number[];
    if (currentSelected.includes(optionIndex)) {
      updated = currentSelected.filter(i => i !== optionIndex);
    } else {
      updated = [...currentSelected, optionIndex].sort((a, b) => a - b);
    }

    setUserAnswers({
      ...userAnswers,
      [questionId]: updated
    });
  };

  const handleSelectTrueFalse = (questionId: string, value: boolean) => {
    if (quizState !== 'running') return;

    const newAnswers = {
      ...userAnswers,
      [questionId]: value
    };

    setUserAnswers(newAnswers);

    // Auto-advance
    let nextUnansweredIndex = questions.findIndex(
      (q, idx) => idx > currentQuestionIndex && newAnswers[q.id] === undefined
    );

    if (nextUnansweredIndex === -1) {
      nextUnansweredIndex = questions.findIndex(
        (q) => newAnswers[q.id] === undefined
      );
    }

    setTimeout(() => {
      if (nextUnansweredIndex !== -1 && nextUnansweredIndex !== currentQuestionIndex) {
        setCurrentQuestionIndex(nextUnansweredIndex);
      }

      if (questionCardRef.current) {
        questionCardRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 300);
  };

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const navigateQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      if (questionCardRef.current) {
        questionCardRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  const handleSubmitQuiz = async () => {
    if (!selectedSet || quizState !== 'running') return;

    const timeTaken = selectedSet.timeLimitMinutes * 60 - timeLeft;

    try {
      const res = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizSetId: selectedSet.id,
          answers: userAnswers,
          timeTakenSeconds: timeTaken,
          userName: userProfile?.name || 'Anonymous Candidate'
        })
      });

      const data = await res.json();
      if (data.attempt) {
        setAttemptResult(data.attempt);
        setQuizState('completed');
        if (onAttemptComplete) {
          onAttemptComplete(data.attempt);
        }

        if (data.attempt.passed ?? data.attempt.percentage >= (selectedSet.passThreshold || customPassThreshold || 50)) {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 }
          });
        }

        fetchLeaderboard(selectedSet.id);
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    }
  };

  const handleGenerateAiExplanation = async (q: QuizQuestion) => {
    try {
      setLoadingAiExplain((prev) => ({ ...prev, [q.id]: true }));
      const userChoiceIndex = userAnswers[q.id];
      const selectedText = typeof userChoiceIndex === 'number' && q.options
        ? q.options[userChoiceIndex]
        : Array.isArray(userChoiceIndex)
        ? userChoiceIndex.map(i => q.options?.[i]).filter(Boolean).join(', ')
        : userChoiceIndex !== undefined
        ? String(userChoiceIndex)
        : 'No Option Selected';
      const correctText = q.options ? q.options[q.correctOption] : 'N/A';

      const res = await fetch('/api/quizzes/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: q.questionText,
          selectedOption: selectedText,
          correctOptionText: correctText,
          topic: q.topic || q.category
        })
      });

      const data = await res.json();
      setAiExplanations((prev) => ({
        ...prev,
        [q.id]: data
      }));
    } catch (err) {
      console.error('Failed AI explanation generation:', err);
    } finally {
      setLoadingAiExplain((prev) => ({ ...prev, [q.id]: false }));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Filtered Quiz Sets
  const filteredSets = quizSets.filter(qs => {
    if (selectedCategoryFilter !== 'all' && qs.category !== selectedCategoryFilter) return false;
    if (selectedExamFilter !== 'all' && qs.examProfile !== selectedExamFilter) return false;
    return true;
  });

  const tr = L(lang);

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header (browse view only) */}
      {quizState === 'idle' && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-7">
          <div className="flex flex-col gap-2.5">
            <h1 className={H1}>
              {tr('Practice for', 'अभ्यास गर्नुहोस्')} <span className="marker">{tr('Lok Sewa', 'लोक सेवा')}</span>
            </h1>
            <p className="max-w-[38rem] text-[15px] leading-relaxed text-ink-soft">
              {tr('Timed, PSC-format mock papers with negative marking and explanations for every answer.', 'नेगेटिभ मार्किङसहित लोक सेवा ढाँचाका समयबद्ध नमुना परीक्षा र हरेक उत्तरको व्याख्या।')}
            </p>
          </div>
          <div className="flex items-center p-1 bg-white rounded-full shadow-[0_1px_2px_rgb(11_18_32/0.05)] gap-1 self-start sm:self-auto" role="tablist">
            {([
              ['quizzes', tr('Mock papers', 'नमुना परीक्षा')],
              ['ai_drill', tr('AI drill', 'एआई अभ्यास')],
              ['leaderboard', tr('Rankings', 'शीर्ष नतिजा')]
            ] as const).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={subTab === id}
                onClick={() => setSubTab(id)}
                className={`h-9 px-3.5 rounded-full text-[13px] transition ${subTab === id ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* IDLE STATE: BROWSE SETS OR GENERATE AI DRILL */}
      {quizState === 'idle' && (
        <>
          {subTab === 'leaderboard' ? (
            <Leaderboard
              quizSets={quizSets}
              lang={lang}
              currentUserName={userProfile?.name}
              onStartQuiz={(qs) => {
                setSubTab('quizzes');
                handleStartQuiz(qs);
              }}
            />
          ) : subTab === 'ai_drill' ? (
            /* AI PERSONALIZED DIAGNOSTIC DRILL BUILDER */
            <div className="bg-white rounded-2xl p-6 text-slate-900 space-y-6 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Personalized AI Diagnostic Drill</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">
                      Adaptive
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate an instant 5-question targeted mock drill on specific topics with Lok Sewa negative marking.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Focus Syllabus Topic:</label>
                  <select
                    value={aiDrillTopic}
                    onChange={(e) => setAiDrillTopic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-300 font-medium"
                  >
                    <option value="Nepal Constitution & Governance">Nepal Constitution & Governance (संविधान र शासन)</option>
                    <option value="Nepal Geography & Environment">Nepal Geography & Climate (भूगोल र वातावरण)</option>
                    <option value="Public Administration & Civil Service">Public Administration & Civil Service Act (प्रशासन)</option>
                    <option value="Economics & Planning">Nepal Economy & 16th Plan (अर्थतन्त्र र योजना)</option>
                    <option value="Science, Tech & Computer">Science & Computer Literacy (विज्ञान र प्रविधि)</option>
                    <option value="Mathematics & Logical Reasoning">Logical Reasoning & Numerical IQ (तार्किक क्षमता)</option>
                    <option value="Current Affairs & Global Affairs">Current Affairs & International Affairs (समसामयिक)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Target Exam Post:</label>
                  <select
                    value={aiDrillExam}
                    onChange={(e) => setAiDrillExam(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-300 font-medium"
                  >
                    <option value="Section Officer (Sakha Adhikrit)">Section Officer (Sakha Adhikrit)</option>
                    <option value="Nayab Subba (NaSu)">Nayab Subba (NaSu)</option>
                    <option value="Kharidar">Kharidar (Level 4)</option>
                    <option value="Nepal Rastra Bank / Commercial Banks">Banking (NRB / NBL / RBB)</option>
                    <option value="Nepal Police / APF Inspector">Security Forces (Police Inspector)</option>
                    <option value="Teachers Service Commission (TSC)">Teachers Service Commission (TSC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Difficulty:</label>
                  <select
                    value={aiDrillDifficulty}
                    onChange={(e) => setAiDrillDifficulty(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-300 font-medium"
                  >
                    <option value="medium">Medium (Lok Sewa Standard)</option>
                    <option value="easy">Easy (Foundational Review)</option>
                    <option value="hard">Hard (Multi-statement / Tricky)</option>
                  </select>
                </div>
              </div>

              <div className="bg-purple-50/60 rounded-xl p-3.5 text-xs text-purple-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Official Rule Applied:</strong> The generated drill enforces Lok Sewa 20% negative penalty (-0.20 marks per incorrect choice). All questions are vetted for single-correct answer validity.
                </div>
              </div>

              <button
                onClick={() => handleGenerateAiDrill()}
                disabled={generatingDrill}
                className="w-full py-3.5 font-bold text-xs rounded-full transition flex items-center justify-center gap-2 shadow-xs bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
              >
                {generatingDrill ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini AI is generating targeted practice drill...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate & Start 5-Question AI Diagnostic Drill</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* STANDARD MODEL SETS BROWSER */
            <div className="space-y-5">
              {/* Category & Exam Filter Bar */}
              <div className="bg-white rounded-2xl p-4 space-y-3 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <Filter className="w-4 h-4 text-ink" />
                    <span>Filter Practice Sets:</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Category Filter */}
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-sky-300"
                    >
                      <option value="all">All Categories ({categories.length || '19+'})</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name} ({c.nameNp})</option>
                      ))}
                    </select>

                    {/* Exam Profile Filter */}
                    <select
                      value={selectedExamFilter}
                      onChange={(e) => setSelectedExamFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-sky-300"
                    >
                      <option value="all">All Exam Profiles</option>
                      {examProfiles.map(e => (
                        <option key={e.id} value={e.name}>{e.name}</option>
                      ))}
                    </select>

                    {(selectedCategoryFilter !== 'all' || selectedExamFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSelectedCategoryFilter('all');
                          setSelectedExamFilter('all');
                        }}
                        className="text-ink hover:text-ink font-bold text-xs underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Exam Settings Toggles */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-semibold text-slate-700">Quiz Engine Settings:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-slate-900">
                      <input
                        type="checkbox"
                        checked={randomizeQuestions}
                        onChange={(e) => setRandomizeQuestions(e.target.checked)}
                        className="rounded text-ink focus:ring-sky-300 w-3.5 h-3.5"
                      />
                      <span>Randomize Questions</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-slate-900">
                      <input
                        type="checkbox"
                        checked={randomizeOptions}
                        onChange={(e) => setRandomizeOptions(e.target.checked)}
                        className="rounded text-ink focus:ring-sky-300 w-3.5 h-3.5"
                      />
                      <span>Randomize Options</span>
                    </label>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    Official 20% Negative Marking • Real Lok Sewa Standard
                  </span>
                </div>
              </div>

              {/* Quiz Sets Grid */}
              <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))]">
                {filteredSets.map((qs) => (
                  <article key={qs.id} className="bg-white rounded-[24px] overflow-hidden shadow-soft flex flex-col transition hover:-translate-y-0.5">
                    <div className="pt-4 px-[18px] pb-[30px] flex items-center justify-between gap-2" style={tintBand(qs.category || qs.id)}>
                      <span className="text-xs font-semibold text-ink bg-white/75 px-2.5 py-[5px] rounded-full truncate">{qs.category}</span>
                      <span className="text-xs font-semibold px-2.5 py-[5px] rounded-full bg-white/75 text-ink shrink-0">
                        {num(qs.timeLimitMinutes, lang)} {tr('min', 'मिनेट')}
                      </span>
                    </div>
                    <div className="px-[18px] pb-[18px] -mt-3.5 flex flex-col gap-2.5 flex-1">
                      <h3 className="font-display text-[18px] font-semibold leading-[1.25] text-ink">{lang === 'np' && qs.titleNp ? qs.titleNp : qs.title}</h3>
                      <p className="text-[13px] text-ink-soft leading-relaxed line-clamp-2">{lang === 'np' && qs.descriptionNp ? qs.descriptionNp : qs.description}</p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-sky-50 rounded-[14px] p-2.5">
                          <div className="text-[11px] text-[#667085]">{tr('Questions', 'प्रश्न')}</div>
                          <div className="font-semibold text-[15px] mt-0.5 text-ink">{num(qs.totalQuestions, lang)}</div>
                        </div>
                        <div className="bg-sky-50 rounded-[14px] p-2.5">
                          <div className="text-[11px] text-[#667085]">{tr('Level', 'तह')}</div>
                          <div className="font-semibold text-[15px] mt-0.5 text-ink truncate">{qs.level}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartQuiz(qs)}
                        className="mt-auto h-11 rounded-full bg-ink text-white text-sm font-medium shadow-pill hover:bg-black transition"
                      >
                        {tr('Start mock', 'परीक्षा सुरु गर्नुहोस्')} →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* RUNNING STATE: TIMED EXAM (design A) */}
      {quizState === 'running' && selectedSet && questions.length > 0 && (() => {
        const q = questions[currentQuestionIndex];
        const selectedOpt = userAnswers[q.id];
        const isFlagged = !!flaggedQuestions[q.id];
        const mm = String(Math.floor(Math.max(0, timeLeft) / 60)).padStart(2, '0');
        const ss = String(Math.max(0, timeLeft) % 60).padStart(2, '0');
        const showEn = questionLangMode !== 'np' || !q.questionTextNp;
        const showNp = questionLangMode !== 'en' && !!q.questionTextNp && q.questionTextNp !== q.questionText;
        const negPct = Math.round((selectedSet.negativeMarkRate ?? customNegativeRate ?? 0.2) * 100);
        const optRow = (on: boolean) =>
          `w-full flex items-center gap-3.5 min-h-14 px-4 py-3 rounded-[18px] text-left text-[15px] text-ink border-[1.5px] transition ${
            on ? 'border-ink bg-sky-50' : 'border-[#eef2f6] bg-white hover:border-[#d0d5dd]'
          }`;
        const keyDot = (on: boolean) =>
          `w-[30px] h-[30px] flex-none rounded-full flex items-center justify-center text-[13px] font-semibold ${on ? 'bg-ink text-white' : 'bg-sky-50 text-ink'}`;

        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap justify-between items-center gap-3.5">
              <div className="min-w-0">
                <div className="text-[12.5px] text-ink-soft">
                  {tr('Exam mode', 'परीक्षा मोड')} · {selectedSet.category}
                </div>
                <h1 className="mt-0.5 font-display text-2xl sm:text-[32px] font-semibold tracking-[-0.02em] leading-[1.1] text-ink">
                  {lang === 'np' && selectedSet.titleNp ? selectedSet.titleNp : selectedSet.title}
                </h1>
              </div>
              <div className="flex items-center gap-2.5 bg-white rounded-full py-1.5 pr-1.5 pl-4 shadow-[0_1px_2px_rgb(11_18_32/0.05)]">
                <span className="text-xs text-[#667085]">{tr('Time remaining', 'बाँकी समय')}</span>
                <span
                  className="font-display tabular-nums text-xl font-semibold"
                  style={{ color: timeLeft < 120 ? '#be123c' : '#0b1220' }}
                  aria-live="off"
                >
                  {num(`${mm}:${ss}`, lang)}
                </span>
                <button onClick={handleSubmitQuiz} className="h-10 px-4 rounded-full bg-ink text-white text-[13.5px] hover:bg-black transition">
                  {tr('Submit exam', 'परीक्षा बुझाउनुहोस्')}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-5 items-start">
              <div ref={questionCardRef} className="flex-[1_1_520px] min-w-0 bg-white rounded-[28px] p-5 sm:p-[26px] shadow-soft flex flex-col gap-[18px] scroll-mt-24">
                <div className="flex justify-between items-center gap-2 text-[13px] text-ink-soft">
                  <span>{tr(`Question ${currentQuestionIndex + 1} of ${questions.length}`, `प्रश्न ${num(currentQuestionIndex + 1, lang)} / ${num(questions.length, lang)}`)}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="bg-sky-50 px-2.5 py-[3px] rounded-full truncate">{q.subject || q.topic || q.category}</span>
                    {q.questionTextNp && (
                      <button
                        onClick={() => setQuestionLangMode(questionLangMode === 'both' ? (lang === 'np' ? 'np' : 'en') : 'both')}
                        className="shrink-0 h-7 px-2.5 rounded-full border border-[#e4e7ec] text-xs hover:bg-sky-50 transition"
                        title={tr('Show both languages', 'दुवै भाषा देखाउनुहोस्')}
                      >
                        {questionLangMode === 'both' ? 'EN / नेपाली' : questionLangMode === 'np' ? 'नेपाली' : 'EN'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {showEn && (
                    <h2 className="font-display text-[22px] font-semibold leading-[1.3] tracking-[-0.01em] text-ink [text-wrap:pretty]">{q.questionText}</h2>
                  )}
                  {showNp && <p className={`${showEn ? 'text-[17px] text-ink-soft' : 'font-display text-[22px] font-semibold text-ink'} leading-[1.35]`}>{q.questionTextNp}</p>}
                  {q.questionType === 'multiple_select' && (
                    <p className="text-[12.5px] text-[#667085]">{tr('Select all that apply.', 'लागू हुने सबै छान्नुहोस्।')}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2.5" role={q.questionType === 'multiple_select' ? 'group' : 'radiogroup'}>
                  {q.questionType === 'true_false'
                    ? [true, false].map((val, k) => {
                        const on = selectedOpt === val;
                        return (
                          <button key={String(val)} role="radio" aria-checked={on} onClick={() => handleSelectTrueFalse(q.id, val)} className={optRow(on)}>
                            <span className={keyDot(on)}>{k === 0 ? 'A' : 'B'}</span>
                            {val ? tr('True', 'सत्य') : tr('False', 'गलत')}
                          </button>
                        );
                      })
                    : q.options.map((opt, k) => {
                        const multi = q.questionType === 'multiple_select';
                        const on = multi ? ((selectedOpt as number[]) || []).includes(k) : selectedOpt === k;
                        const optNp = q.optionsNp?.[k];
                        return (
                          <button
                            key={k}
                            role={multi ? 'checkbox' : 'radio'}
                            aria-checked={on}
                            onClick={() => (multi ? handleToggleMultiSelect(q.id, k) : handleSelectOption(q.id, k))}
                            className={optRow(on)}
                          >
                            <span className={keyDot(on)}>{String.fromCharCode(65 + k)}</span>
                            <span>
                              {questionLangMode === 'np' && optNp ? optNp : opt}
                              {questionLangMode === 'both' && optNp && optNp !== opt && <span className="block text-[13px] text-ink-soft mt-0.5">{optNp}</span>}
                            </span>
                          </button>
                        );
                      })}
                </div>

                <div className="flex justify-between gap-2.5 pt-1">
                  <button
                    onClick={() => navigateQuestion(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="h-[46px] px-[18px] rounded-full border border-[#d0d5dd] bg-white text-sm text-ink disabled:opacity-40 hover:bg-sky-50 transition"
                  >
                    ← {tr('Previous', 'अघिल्लो')}
                  </button>
                  <button
                    onClick={() => toggleFlagQuestion(q.id)}
                    aria-pressed={isFlagged}
                    className="h-[46px] px-[18px] rounded-full text-sm text-[#92400e] transition"
                    style={{ background: isFlagged ? '#fde68a' : '#fef3c7' }}
                  >
                    ⚑ {tr('Flag', 'चिन्ह')}
                  </button>
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={() => navigateQuestion(currentQuestionIndex + 1)}
                      className="h-[46px] px-5 rounded-full bg-ink text-white text-sm shadow-pill hover:bg-black transition"
                    >
                      {tr('Next', 'अर्को')} →
                    </button>
                  ) : (
                    <button onClick={handleSubmitQuiz} className="h-[46px] px-5 rounded-full bg-ink text-white text-sm shadow-pill hover:bg-black transition">
                      {tr('Submit', 'बुझाउनुहोस्')}
                    </button>
                  )}
                </div>
              </div>

              <aside className="flex-[1_1_260px] bg-white rounded-[24px] p-5 shadow-soft flex flex-col gap-3.5">
                <h3 className="font-semibold text-[14.5px] text-ink">{tr('Question palette', 'प्रश्न सूची')}</h3>
                <div className="grid grid-cols-4 gap-2">
                  {questions.map((qq, k) => {
                    const a = userAnswers[qq.id] !== undefined && !(Array.isArray(userAnswers[qq.id]) && (userAnswers[qq.id] as number[]).length === 0);
                    const f = !!flaggedQuestions[qq.id];
                    const c = k === currentQuestionIndex;
                    return (
                      <button
                        key={qq.id}
                        onClick={() => navigateQuestion(k)}
                        aria-current={c ? 'step' : undefined}
                        aria-label={tr(`Question ${k + 1}`, `प्रश्न ${num(k + 1, lang)}`)}
                        className="h-11 rounded-[14px] text-sm font-semibold border-[1.5px] transition"
                        style={{
                          borderColor: c ? '#3b8fd6' : f ? '#f59e0b' : a ? '#0b1220' : '#e4e7ec',
                          background: a ? '#0b1220' : f ? '#fef3c7' : '#fff',
                          color: a ? '#fff' : '#0b1220'
                        }}
                      >
                        {num(k + 1, lang)}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-ink-soft">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-ink" />{tr('Answered', 'उत्तर दिइएको')}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-[#fef3c7] border border-[#f59e0b]" />{tr('Flagged', 'चिन्हित')}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] border border-[#d0d5dd]" />{tr('Not answered', 'उत्तर नदिइएको')}</span>
                </div>
                <p className="text-[12.5px] text-[#667085] leading-normal">
                  {tr(`Negative marking: −${negPct}% per wrong answer, as in the real PSC paper.`, `गलत उत्तरमा ${num(negPct, lang)}% अंक कट्टा हुन्छ।`)}
                </p>
                <button
                  onClick={() => {
                    setQuizState('idle');
                    setSelectedSet(null);
                  }}
                  className="self-start text-[13px] text-ink-soft underline underline-offset-2 hover:text-ink"
                >
                  {tr('Leave exam', 'परीक्षा छोड्नुहोस्')}
                </button>
              </aside>
            </div>
          </div>
        );
      })()}

      {/* COMPLETED STATE: RESULT (design A) */}
      {quizState === 'completed' && attemptResult && (() => {
        const total = attemptResult.totalQuestions || questions.length;
        const correct = attemptResult.correctCount;
        const wrong = attemptResult.incorrectCount;
        const skipped = attemptResult.skippedCount ?? total - correct - wrong;
        const subjectList: { subject: string; accuracy: number }[] = Array.isArray(attemptResult.subjectBreakdown)
          ? (attemptResult.subjectBreakdown as any[])
          : attemptResult.subjectBreakdown
            ? Object.entries(attemptResult.subjectBreakdown).map(([subject, d]: [string, any]) => ({ subject, accuracy: d.accuracy || 0 }))
            : [];
        const isRight = (qq: QuizQuestion) => {
          const userOpt = attemptResult.answers[qq.id];
          if (qq.questionType === 'true_false') {
            const expected = qq.isTrue !== undefined ? qq.isTrue : qq.correctOption === 0 || String(qq.correct_answer || '').toLowerCase() === 'true';
            return { ok: userOpt === expected, skipped: userOpt === undefined || userOpt === null, correctText: expected ? tr('True', 'सत्य') : tr('False', 'गलत'), yourText: userOpt === undefined ? '' : userOpt ? tr('True', 'सत्य') : tr('False', 'गलत') };
          }
          if (qq.questionType === 'multiple_select') {
            const exp = qq.correctAnswers || [qq.correctOption];
            const mine = Array.isArray(userOpt) ? (userOpt as number[]) : [];
            return {
              ok: exp.length === mine.length && exp.every((i) => mine.includes(i)),
              skipped: mine.length === 0,
              correctText: exp.map((i) => qq.options[i]).join(', '),
              yourText: mine.map((i) => qq.options[i]).join(', ')
            };
          }
          return {
            ok: userOpt === qq.correctOption,
            skipped: userOpt === undefined || userOpt === null,
            correctText: qq.options[qq.correctOption],
            yourText: typeof userOpt === 'number' ? qq.options[userOpt] : ''
          };
        };

        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-5 items-stretch">
              <div className="flex-[1_1_300px] bg-ink text-white rounded-[28px] p-7 flex flex-col gap-2.5">
                <div className="text-[13px] opacity-70">{tr('Your score', 'तपाईंको अंक')}</div>
                <div className="font-display text-[64px] font-semibold leading-none">
                  {num(attemptResult.score.toFixed(1), lang)}/{num(total, lang)}
                </div>
                <div className="text-sm opacity-80">
                  {tr(`${correct} correct · ${wrong} wrong · ${skipped} skipped`, `${num(correct, lang)} सही · ${num(wrong, lang)} गलत · ${num(skipped, lang)} छोडिएको`)}
                </div>
                <div className="text-[13px] opacity-70">
                  {attemptResult.passed ? tr('Passed', 'उत्तीर्ण') : tr('Not passed yet', 'अनुत्तीर्ण')} · {num(attemptResult.percentage, lang)}% · {num(formatTime(attemptResult.timeTakenSeconds), lang)}
                </div>
                <div className="mt-auto pt-3 flex flex-wrap gap-2">
                  <button onClick={() => selectedSet && handleStartQuiz(selectedSet)} className="h-11 px-[18px] rounded-full bg-white text-ink text-sm hover:bg-sky-50 transition">
                    {tr('Retake mock', 'पुनः प्रयास')}
                  </button>
                  <button
                    onClick={() => {
                      setQuizState('idle');
                      setSelectedSet(null);
                    }}
                    className="h-11 px-[18px] rounded-full border border-white/25 text-white text-sm hover:bg-white/10 transition"
                  >
                    {tr('All mocks', 'सबै परीक्षा')}
                  </button>
                </div>
              </div>

              <div className="flex-[2_1_380px] bg-white rounded-[28px] p-6 shadow-soft flex flex-col gap-3">
                <h3 className="font-semibold text-ink">{tr('Accuracy by subject', 'विषयगत शुद्धता')}</h3>
                {subjectList.length === 0 && <p className="text-sm text-[#667085]">{tr('No subject breakdown for this mock.', 'विषयगत विवरण उपलब्ध छैन।')}</p>}
                {subjectList.map((s) => {
                  const p = Math.round(s.accuracy);
                  return (
                    <div key={s.subject} className="grid grid-cols-[minmax(0,120px)_1fr_44px] items-center gap-3 text-[13.5px]">
                      <span className="truncate text-ink">{s.subject}</span>
                      <div className="h-2.5 rounded-full bg-sky-100 overflow-hidden">
                        <div className="h-full transition-[width] duration-300" style={{ width: `${p}%`, background: p >= 80 ? '#059669' : p >= 50 ? '#5ea9e2' : '#f43f5e' }} />
                      </div>
                      <span className="text-right font-semibold text-ink">{num(p, lang)}%</span>
                    </div>
                  );
                })}
                {attemptResult.recommendations?.weakAreas && attemptResult.recommendations.weakAreas.length > 0 && (
                  <div className="mt-2 pt-3 border-t border-[#eef2f6] flex flex-wrap items-center gap-2">
                    <span className="text-[13px] text-ink-soft">{tr('Work on:', 'सुधार गर्नुहोस्:')}</span>
                    {attemptResult.recommendations.weakAreas.map((w) => (
                      <span key={w} className="text-xs px-2.5 py-1 rounded-full bg-[#ffe4e6] text-[#be123c]">{w}</span>
                    ))}
                    <button
                      onClick={() => {
                        setSubTab('ai_drill');
                        setQuizState('idle');
                        setAiDrillTopic(attemptResult.recommendations!.weakAreas[0]);
                      }}
                      className="ml-auto h-9 px-3.5 rounded-full bg-ink text-white text-[13px] hover:bg-black transition"
                    >
                      {tr('Drill weak topics', 'कमजोर विषय अभ्यास')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[28px] px-6 py-2 shadow-soft">
              {questions.map((qq, k) => {
                const r = isRight(qq);
                const aiExplain = aiExplanations[qq.id];
                const loadingExplain = loadingAiExplain[qq.id];
                return (
                  <div key={qq.id} className={`flex gap-3.5 py-4 ${k < questions.length - 1 ? 'border-b border-[#eef2f6]' : ''}`}>
                    <span
                      className="w-[26px] h-[26px] flex-none rounded-full flex items-center justify-center text-[13px] text-white"
                      style={{ background: r.ok ? '#059669' : r.skipped ? '#98a2b3' : '#f43f5e' }}
                      aria-label={r.ok ? tr('Correct', 'सही') : r.skipped ? tr('Skipped', 'छोडिएको') : tr('Wrong', 'गलत')}
                    >
                      {r.ok ? '✓' : r.skipped ? '–' : '✕'}
                    </span>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="font-semibold text-[14.5px] text-ink">
                        {lang === 'np' && qq.questionTextNp ? qq.questionTextNp : qq.questionText}
                      </div>
                      <div className="text-[13px] text-ink-soft">
                        {tr(`Correct: ${r.correctText}`, `सही उत्तर: ${r.correctText}`)}
                        {r.skipped ? tr(' · Skipped', ' · छोडिएको') : !r.ok ? tr(` · You chose: ${r.yourText}`, ` · तपाईंको: ${r.yourText}`) : ''}
                      </div>
                      {(qq.explanation || aiExplain) && (
                        <div className="text-[13px] text-ink-soft bg-sky-50 rounded-xl px-2.5 py-2 leading-relaxed">
                          {aiExplain ? (lang === 'np' ? aiExplain.explanationNp : aiExplain.explanationEn) : qq.explanation}
                          {aiExplain?.mnemonicTip && <span className="block mt-1 text-ink">💡 {aiExplain.mnemonicTip}</span>}
                        </div>
                      )}
                      {!aiExplain && !r.ok && (
                        <button
                          onClick={() => handleGenerateAiExplanation(qq)}
                          disabled={loadingExplain}
                          className="self-start mt-0.5 text-[12.5px] text-ink underline underline-offset-2 disabled:opacity-60 inline-flex items-center gap-1"
                        >
                          {loadingExplain && <Loader2 className="w-3 h-3 animate-spin" />}
                          {loadingExplain ? tr('Explaining…', 'व्याख्या गर्दै…') : tr('Explain with AI', 'एआईबाट व्याख्या')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
