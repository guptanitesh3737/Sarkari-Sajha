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

        if (data.attempt.percentage >= (selectedSet.passThreshold || customPassThreshold || 50)) {
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

  return (
    <div className="space-y-6">
      {/* Quiz Engine Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-600" /> Lok Sewa Exam Prep & Model Sets
            </span>
            <h2 className="text-2xl font-black font-sans text-slate-900">
              {lang === 'np' ? 'लोक सेवा नमुना परीक्षा तथा एआई मोक टेस्ट' : 'Lok Sewa AI Exam Preparation Platform'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Real PSC-format practice tests with 20% negative marking penalty, bilingual questions, topic breakdowns, and instant AI explanations.
            </p>
          </div>

          {quizState !== 'idle' ? (
            <button
              onClick={() => {
                setQuizState('idle');
                setSelectedSet(null);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center gap-2 self-start sm:self-center"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
              <span>Back to Quiz Sets</span>
            </button>
          ) : (
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-center gap-1">
              <button
                onClick={() => setSubTab('quizzes')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  subTab === 'quizzes'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>{lang === 'np' ? 'अभ्यास सेटहरू' : 'Model Sets'}</span>
              </button>

              <button
                onClick={() => setSubTab('ai_drill')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  subTab === 'ai_drill'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-700 hover:text-purple-900'
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>AI Drill Lab</span>
              </button>

              <button
                onClick={() => setSubTab('leaderboard')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  subTab === 'leaderboard'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === 'np' ? 'शीर्ष नतिजा' : 'Rankings'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

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
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 space-y-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                  >
                    <option value="medium">Medium (Lok Sewa Standard)</option>
                    <option value="easy">Easy (Foundational Review)</option>
                    <option value="hard">Hard (Multi-statement / Tricky)</option>
                  </select>
                </div>
              </div>

              <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-3.5 text-xs text-purple-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Official Rule Applied:</strong> The generated drill enforces Lok Sewa 20% negative penalty (-0.20 marks per incorrect choice). All questions are vetted for single-correct answer validity.
                </div>
              </div>

              <button
                onClick={() => handleGenerateAiDrill()}
                disabled={generatingDrill}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
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
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <Filter className="w-4 h-4 text-amber-600" />
                    <span>Filter Practice Sets:</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Category Filter */}
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                        className="text-amber-700 hover:text-amber-900 font-bold text-xs underline"
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
                        className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                      />
                      <span>Randomize Questions</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-slate-900">
                      <input
                        type="checkbox"
                        checked={randomizeOptions}
                        onChange={(e) => setRandomizeOptions(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredSets.map((qs) => (
                  <div
                    key={qs.id}
                    className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-6 text-slate-900 transition shadow-xs hover:shadow-md flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold">
                          {qs.category}
                        </span>
                        <span className="text-slate-500 text-xs font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> {qs.timeLimitMinutes} Mins
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition font-sans">
                        {lang === 'np' ? qs.titleNp : qs.title}
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        {lang === 'np' ? qs.descriptionNp : qs.description}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-xs text-slate-600 font-semibold border-t border-slate-100">
                        <span>Level: {qs.level}</span>
                        <span className="text-amber-700">{qs.totalQuestions} Questions</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartQuiz(qs)}
                      className="w-full mt-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                    >
                      <span>{t('startQuiz', lang)}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* RUNNING STATE: ACTIVE EXAM INTERFACE */}
      {quizState === 'running' && selectedSet && questions.length > 0 && (
        <div className="space-y-5">
          {/* Active Session Progress & Score Preview Summary Bar */}
          {(() => {
            const answeredCount = Object.keys(userAnswers).length;
            const totalQ = questions.length;
            const remainingCount = totalQ - answeredCount;
            const percent = Math.round((answeredCount / totalQ) * 100);

            return (
              <div id="active-quiz-score-summary" className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-300/40">
                      <BarChart2 className="w-5 h-5 text-amber-600" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 font-sans uppercase tracking-wide">
                          {lang === 'np' ? 'वास्तविक समय नतिजा र प्रश्न प्रगति' : 'Real-Time Score & Questions Summary'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200 animate-pulse">
                          LIVE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {lang === 'np'
                          ? `कुल ${totalQ} प्रश्नहरू मध्ये ${remainingCount} वटा प्रश्न हल गर्न बाँकी छ • २०% नेगेटिभ मार्किङ`
                          : `${remainingCount} of ${totalQ} questions remaining • 20% Negative Marking Penalty`}
                      </p>
                    </div>
                  </div>

                  {/* Real-time score summary badges */}
                  <div className="flex items-center gap-2 sm:gap-2.5 text-xs font-mono font-bold flex-wrap">
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{lang === 'np' ? 'हल गरिएको:' : 'Answered:'} {answeredCount}/{totalQ}</span>
                    </span>

                    <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{lang === 'np' ? 'बाँकी प्रश्न:' : 'Remaining:'} {remainingCount}</span>
                    </span>

                    <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span>{percent}% {lang === 'np' ? 'सम्पन्न' : 'Complete'}</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 font-semibold">
                    <span>
                      {lang === 'np' ? `प्रगति: ${answeredCount}/${totalQ} प्रश्नहरू` : `Progress: ${answeredCount}/${totalQ} Questions`}
                    </span>
                    <span className="text-amber-800 font-bold">
                      {lang === 'np' ? `${remainingCount} प्रश्नहरू बाँकी (${100 - percent}%)` : `${remainingCount} Questions Remaining (${100 - percent}%)`}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/80 p-0.5 relative">
                    <div
                      className="bg-gradient-to-r from-blue-600 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out shadow-xs"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Question Panel */}
            <div className="lg:col-span-2 space-y-5">
              {/* Exam Header Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-slate-900 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                    Q {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {questions[currentQuestionIndex].topic || questions[currentQuestionIndex].category}
                  </span>
                </div>

                {/* Language Switch & Countdown Timer Badge */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                    <button
                      onClick={() => setQuestionLangMode('both')}
                      className={`px-2 py-0.5 rounded font-medium transition ${questionLangMode === 'both' ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600'}`}
                    >
                      Bilingual
                    </button>
                    <button
                      onClick={() => setQuestionLangMode('np')}
                      className={`px-2 py-0.5 rounded font-medium transition ${questionLangMode === 'np' ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600'}`}
                    >
                      नेपाली
                    </button>
                    <button
                      onClick={() => setQuestionLangMode('en')}
                      className={`px-2 py-0.5 rounded font-medium transition ${questionLangMode === 'en' ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600'}`}
                    >
                      EN
                    </button>
                  </div>

                  <div
                    className={`px-3 py-1.5 rounded-xl font-mono font-extrabold text-sm flex items-center gap-2 border ${
                      timeLeft < 120
                        ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                        : 'bg-slate-50 text-amber-800 border-slate-200'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                </div>
              </div>

              {/* Current Question Card */}
              {(() => {
                const q = questions[currentQuestionIndex];
                const selectedOpt = userAnswers[q.id];
                const isFlagged = flaggedQuestions[q.id];

                return (
                  <div ref={questionCardRef} className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 space-y-6 shadow-xs scroll-mt-24">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        {/* Display based on language mode */}
                        {(questionLangMode === 'both' || questionLangMode === 'en') && (
                          <h3 className="text-base font-bold text-slate-900 font-sans leading-snug">
                            {q.questionText}
                          </h3>
                        )}
                        {(questionLangMode === 'both' || questionLangMode === 'np') && q.questionTextNp && (
                          <h4 className="text-base font-medium text-slate-800 font-serif leading-snug">
                            {q.questionTextNp}
                          </h4>
                        )}
                      </div>

                      <button
                        onClick={() => toggleFlagQuestion(q.id)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                          isFlagged
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                        title="Mark question to review before final submission"
                      >
                        <Bookmark className={`w-4 h-4 ${isFlagged ? 'fill-amber-600 text-amber-600' : ''}`} />
                        <span>{isFlagged ? 'Flagged' : 'Review'}</span>
                      </button>
                    </div>

                    {/* Question Type Badge & Instruction */}
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {q.questionType === 'multiple_select'
                          ? 'Multiple Select (Select all that apply)'
                          : q.questionType === 'true_false'
                          ? 'True / False'
                          : 'Multiple Choice'}
                      </span>
                    </div>

                    {/* Options List by Question Type */}
                    {q.questionType === 'true_false' ? (
                      <div className="grid grid-cols-2 gap-4">
                        {[true, false].map((val) => {
                          const isSelected = selectedOpt === val;
                          return (
                            <button
                              key={String(val)}
                              onClick={() => handleSelectTrueFalse(q.id, val)}
                              className={`p-6 rounded-2xl text-center text-sm font-bold transition border flex flex-col items-center justify-center gap-2 ${
                                isSelected
                                  ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500 text-amber-950 shadow-sm'
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                              }`}
                            >
                              <span className="text-xl">{val ? '✓' : '✕'}</span>
                              <span>{val ? 'True (सत्य)' : 'False (गलत)'}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : q.questionType === 'multiple_select' ? (
                      <div className="space-y-3">
                        <p className="text-[11px] text-amber-800 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200">
                          ℹ️ Select all correct choices that apply, then click Next or navigate with palette.
                        </p>
                        {q.options.map((opt, optIdx) => {
                          const selectedList = (userAnswers[q.id] as number[]) || [];
                          const isSelected = selectedList.includes(optIdx);
                          const optNp = q.optionsNp?.[optIdx];

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleToggleMultiSelect(q.id, optIdx)}
                              className={`w-full p-4 rounded-xl text-left text-xs transition border flex items-center justify-between ${
                                isSelected
                                  ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500 font-bold text-amber-950'
                                  : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold border ${
                                  isSelected ? 'bg-amber-500 border-amber-600 text-slate-950' : 'bg-white border-slate-300'
                                }`}>
                                  {isSelected ? '✓' : ''}
                                </div>
                                <div>
                                  <span>{opt}</span>
                                  {optNp && optNp !== opt && (
                                    <span className="block text-[11px] text-slate-500 font-serif font-normal mt-0.5">
                                      {optNp}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedOpt === optIdx;
                          const optNp = q.optionsNp?.[optIdx];

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`w-full p-4 rounded-xl text-left text-xs transition border flex items-center justify-between ${
                                isSelected
                                  ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500 font-bold text-amber-950'
                                  : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <div>
                                  <span>{opt}</span>
                                  {optNp && optNp !== opt && (
                                    <span className="block text-[11px] text-slate-500 font-serif font-normal mt-0.5">
                                      {optNp}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        onClick={() => navigateQuestion(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </button>

                      <span className="text-xs text-slate-400 font-mono">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </span>

                      <button
                        onClick={() => navigateQuestion(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                        disabled={currentQuestionIndex === questions.length - 1}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right Sidebar: Question Palette Grid */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 space-y-4 shadow-xs">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question Palette</h4>

                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered = userAnswers[q.id] !== undefined;
                    const isCurrent = idx === currentQuestionIndex;
                    const isFlagged = flaggedQuestions[q.id];

                    return (
                      <button
                        key={q.id}
                        onClick={() => navigateQuestion(idx)}
                        className={`h-9 rounded-lg font-mono font-bold text-xs flex items-center justify-center relative transition ${
                          isCurrent
                            ? 'ring-2 ring-slate-900 bg-blue-600 text-white'
                            : isFlagged
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : isAnswered
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                        {isFlagged && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-1 -right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
                    <span>Answered ({Object.keys(userAnswers).length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
                    <span>Flagged for Review ({Object.values(flaggedQuestions).filter(Boolean).length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300" />
                    <span>Unanswered ({questions.length - Object.keys(userAnswers).length})</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmitQuiz}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
                >
                  Finish & Submit Paper
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED STATE: SCORECARD & AI EXPLANATION REVIEW */}
      {quizState === 'completed' && attemptResult && (
        <div className="space-y-6">
          {/* Scorecard Hero Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 text-center space-y-5 shadow-xs">
            <div className="inline-flex p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
              <Trophy className="w-10 h-10" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  attemptResult.passed
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}>
                  {attemptResult.passed ? 'PASSED (उत्तीर्ण)' : 'FAILED (अनुत्तीर्ण)'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Pass Threshold: {attemptResult.passThreshold || 50}%
                </span>
              </div>
              <h3 className="text-2xl font-black font-sans text-slate-900">
                {attemptResult.passed ? 'Mock Test Completed 🎉' : 'Test Attempt Completed'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Lok Sewa Official Scoring Standard: 1 Mark for Correct Answer, {Math.round((attemptResult.negativeMarkRate || 0.20) * 100)}% Negative Penalty for Wrong Answers.
              </p>
            </div>

            {/* Score Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-sm max-w-4xl mx-auto">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Net Score</span>
                <span className="text-lg font-bold font-mono text-emerald-700">
                  {attemptResult.score.toFixed(2)} / {attemptResult.totalQuestions}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Final Mark</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Correct</span>
                <span className="text-lg font-bold font-mono text-emerald-600">
                  {attemptResult.correctCount}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">+{attemptResult.correctCount}.0</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Incorrect</span>
                <span className="text-lg font-bold font-mono text-rose-600">
                  {attemptResult.incorrectCount}
                </span>
                <span className="text-[10px] text-rose-600 block mt-0.5">-{attemptResult.negativeMarksDeducted?.toFixed(2) || '0.00'}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Skipped</span>
                <span className="text-lg font-bold font-mono text-slate-600">
                  {attemptResult.skippedCount ?? (attemptResult.totalQuestions - attemptResult.correctCount - attemptResult.incorrectCount)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">0 penalty</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Accuracy</span>
                <span className="text-lg font-bold font-mono text-amber-700">
                  {attemptResult.percentage}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {attemptResult.passed ? 'Passed' : 'Needs Practice'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Time Taken</span>
                <span className="text-lg font-bold font-mono text-blue-700">
                  {formatTime(attemptResult.timeTakenSeconds)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Duration</span>
              </div>
            </div>

            {/* Subject & Topic Performance Breakdowns */}
            {(() => {
              const subjectList = Array.isArray(attemptResult.subjectBreakdown)
                ? attemptResult.subjectBreakdown
                : attemptResult.subjectBreakdown
                ? Object.entries(attemptResult.subjectBreakdown).map(([subject, data]: [string, any]) => ({
                    subject,
                    totalQuestions: data.total || data.totalQuestions || 0,
                    correct: data.correct || 0,
                    incorrect: data.incorrect || 0,
                    score: data.score || 0,
                    accuracy: data.accuracy || 0
                  }))
                : [];

              if (subjectList.length === 0) return null;

              return (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-4 max-w-4xl mx-auto">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Subject Performance Breakdown
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    {subjectList.map((sb: any, sIdx: number) => (
                      <div key={sIdx} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="truncate pr-2">{sb.subject}</span>
                          <span className={`font-mono ${sb.accuracy >= 60 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {sb.accuracy}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Q: {sb.totalQuestions} ({sb.correct} Right, {sb.incorrect} Wrong)</span>
                          <span className="font-mono font-semibold">Score: {sb.score.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${sb.accuracy >= 60 ? 'bg-emerald-500' : 'bg-rose-400'}`}
                            style={{ width: `${Math.max(5, sb.accuracy)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Topic Performance Breakdown */}
            {(() => {
              const topicList = Array.isArray(attemptResult.topicBreakdown)
                ? attemptResult.topicBreakdown
                : attemptResult.topicBreakdown
                ? Object.entries(attemptResult.topicBreakdown).map(([topic, data]: [string, any]) => ({
                    topic,
                    totalQuestions: data.total || data.totalQuestions || 0,
                    correct: data.correct || 0,
                    score: data.score || 0,
                    accuracy: data.accuracy || 0
                  }))
                : [];

              if (topicList.length === 0) return null;

              return (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-4 max-w-4xl mx-auto">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Topic Mastery Breakdown
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    {topicList.map((tb: any, tIdx: number) => (
                      <div key={tIdx} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="truncate pr-2">{tb.topic}</span>
                          <span className={`font-mono ${tb.accuracy >= 60 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {tb.accuracy}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{tb.correct}/{tb.totalQuestions} Correct</span>
                          <span className="font-mono">Score: {tb.score.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* AI Study Recommendations Card */}
            {attemptResult.recommendations && (
              <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-5 text-left text-xs text-purple-950 space-y-3 max-w-3xl mx-auto">
                <div className="flex items-center gap-2 font-bold text-purple-900">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>AI Diagnostic Recommendations & Study Plan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white/80 p-3 rounded-xl border border-purple-100 space-y-1">
                    <strong className="text-slate-700 block">Identified Weak Areas:</strong>
                    {attemptResult.recommendations.weakAreas && attemptResult.recommendations.weakAreas.length > 0 ? (
                      attemptResult.recommendations.weakAreas.map((w, idx) => (
                        <span key={idx} className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold text-[10px] mr-1.5 mb-1">
                          {w}
                        </span>
                      ))
                    ) : (
                      <span className="text-emerald-700 font-semibold">Strong overall performance across topics!</span>
                    )}
                  </div>

                  <div className="bg-white/80 p-3 rounded-xl border border-purple-100 space-y-1">
                    <strong className="text-slate-700 block">Focused Action Item:</strong>
                    <p className="text-slate-600 leading-relaxed">
                      {attemptResult.recommendations.nextSteps || 'Review the detailed statutory citations and mnemonic clues below.'}
                    </p>
                  </div>
                </div>

                {attemptResult.recommendations.weakAreas && attemptResult.recommendations.weakAreas.length > 0 && (
                  <button
                    onClick={() => {
                      setSubTab('ai_drill');
                      setQuizState('idle');
                      setAiDrillTopic(attemptResult.recommendations!.weakAreas[0]);
                    }}
                    className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Launch AI Diagnostic Drill for Weak Topics</span>
                  </button>
                )}
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setQuizState('idle');
                  setSelectedSet(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-slate-600" />
                <span>{lang === 'np' ? 'अर्को अभ्यास परीक्षा' : 'Take Another Quiz'}</span>
              </button>

              <button
                onClick={() => {
                  setQuizState('idle');
                  setSelectedSet(null);
                  setSubTab('leaderboard');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs"
              >
                <Trophy className="w-4 h-4" />
                <span>{lang === 'np' ? 'शीर्ष स्थान नतिजा हेर्नुहोस्' : 'View Merit Leaderboard'}</span>
              </button>
            </div>
          </div>

          {/* Question Breakdown with AI Explanations & Citations */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" /> Question-by-Question Review & Source Citations
            </h4>

            {questions.map((q, idx) => {
              const userOpt = attemptResult.answers[q.id];
              let isCorrect = false;
              let isUnanswered = userOpt === undefined || userOpt === null;

              if (q.questionType === 'true_false') {
                const expected = q.isTrue !== undefined ? q.isTrue : (q.correctOption === 0 || String(q.correct_answer || '').toLowerCase() === 'true');
                isCorrect = userOpt === expected;
              } else if (q.questionType === 'multiple_select') {
                const expectedList = q.correctAnswers || [q.correctOption];
                const userList = Array.isArray(userOpt) ? userOpt : [];
                isCorrect = expectedList.length === userList.length && expectedList.every(i => userList.includes(i));
                isUnanswered = userList.length === 0;
              } else {
                isCorrect = userOpt === q.correctOption;
              }

              const aiExplain = aiExplanations[q.id];
              const isLoadingExplain = loadingAiExplain[q.id];

              return (
                <div
                  key={q.id}
                  className={`bg-white border rounded-2xl p-5 text-slate-900 space-y-3 transition shadow-xs ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isUnanswered
                      ? 'border-slate-200 bg-slate-50/30'
                      : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-700 font-mono text-xs px-2 py-0.5 rounded font-bold border border-slate-200">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {q.subject || q.category} • {q.topic}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 uppercase">
                        {q.questionType || 'multiple_choice'}
                      </span>
                    </div>

                    {isCorrect ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correct (+1.0)
                      </span>
                    ) : isUnanswered ? (
                      <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Unattempted (0.0)
                      </span>
                    ) : (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Incorrect (-{(attemptResult.negativeMarkRate || 0.20).toFixed(2)})
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-sm font-bold text-slate-900 font-sans">
                      {q.questionText}
                    </h5>
                    {q.questionTextNp && q.questionTextNp !== q.questionText && (
                      <p className="text-xs text-slate-600 font-serif">
                        {q.questionTextNp}
                      </p>
                    )}
                  </div>

                  {/* Options Status for True/False vs Multiple Select vs Multiple Choice */}
                  {q.questionType === 'true_false' ? (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[true, false].map((val) => {
                        const isExpected = q.isTrue !== undefined ? q.isTrue === val : (val ? q.correctOption === 0 : q.correctOption === 1);
                        const isUser = userOpt === val;

                        let style = 'bg-slate-50 border-slate-200 text-slate-700';
                        if (isExpected) style = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold';
                        else if (isUser && !isExpected) style = 'bg-rose-50 border-rose-300 text-rose-800 font-bold';

                        return (
                          <div key={String(val)} className={`p-3 rounded-xl border flex items-center justify-between ${style}`}>
                            <span>{val ? 'True (सत्य)' : 'False (गलत)'}</span>
                            {isExpected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            {isUser && !isExpected && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                          </div>
                        );
                      })}
                    </div>
                  ) : q.questionType === 'multiple_select' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const userList = Array.isArray(userOpt) ? userOpt : [];
                        const isUserChoice = userList.includes(oIdx);
                        const isRightAns = (q.correctAnswers || [q.correctOption]).includes(oIdx);

                        let style = 'bg-slate-50 border-slate-200 text-slate-700';
                        if (isRightAns) style = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold';
                        else if (isUserChoice && !isRightAns) style = 'bg-rose-50 border-rose-300 text-rose-800 font-bold';

                        return (
                          <div key={oIdx} className={`p-2.5 rounded-xl border flex items-center justify-between ${style}`}>
                            <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                            {isRightAns && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            {isUserChoice && !isRightAns && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isUserChoice = userOpt === oIdx;
                        const isRightAns = oIdx === q.correctOption;

                        let style = 'bg-slate-50 border-slate-200 text-slate-700';
                        if (isRightAns) style = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold';
                        else if (isUserChoice && !isCorrect) style = 'bg-rose-50 border-rose-300 text-rose-800 font-bold';

                        return (
                          <div key={oIdx} className={`p-2.5 rounded-xl border flex items-center justify-between ${style}`}>
                            <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                            {isRightAns && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            {isUserChoice && !isRightAns && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Static Explanation & Syllabus Citation */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                    {q.explanation && (
                      <p><strong className="text-amber-800">Explanation:</strong> {q.explanation}</p>
                    )}
                    {q.mnemonicTip && (
                      <p className="text-purple-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span><strong>Mnemonic Clue:</strong> {q.mnemonicTip}</span>
                      </p>
                    )}
                    {q.source && (
                      <p className="text-[11px] text-slate-500">
                        <strong>Source Reference:</strong> {q.source}
                      </p>
                    )}
                    {q.syllabusReference && q.syllabusReference !== q.source && (
                      <p className="text-[11px] text-slate-500">
                        <strong>Citation / Law Reference:</strong> {q.syllabusReference}
                      </p>
                    )}
                  </div>

                  {/* AI Deep Explanation Button */}
                  {!aiExplain ? (
                    <button
                      onClick={() => handleGenerateAiExplanation(q)}
                      disabled={isLoadingExplain}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-xs"
                    >
                      {isLoadingExplain ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Asking Gemini AI Instructor...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{t('aiExplainBtn', lang)}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-950 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <Sparkles className="w-4 h-4 text-amber-600" /> Gemini AI Deep Breakdown
                      </div>
                      <p className="leading-relaxed">{aiExplain.explanationEn}</p>
                      <p className="leading-relaxed text-amber-900 font-sans">{aiExplain.explanationNp}</p>
                      {aiExplain.mnemonicTip && (
                        <div className="bg-amber-100 p-2 rounded-lg font-mono text-[11px] text-amber-900">
                          💡 Memory Trick: {aiExplain.mnemonicTip}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
