import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Mic,
  MicOff,
  Copy,
  Check,
  Send,
  Lock,
  RefreshCw,
  HelpCircle,
  Flame,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { SubjectiveQuestion, SubjectiveAnswerEvaluation, Language, UserProfile, UserSubscription } from '../types';
import { INITIAL_SUBJECTIVE_QUESTIONS } from '../data/seedData';
import { useSpeechToText } from '../hooks/useSpeechToText';

interface AiSubjectiveEvaluatorProps {
  lang: Language;
  userProfile: UserProfile;
  subscription?: UserSubscription;
  onOpenUpgrade?: () => void;
  preselectedExamProfile?: string;
}

export function AiSubjectiveEvaluator({
  lang,
  userProfile,
  subscription,
  onOpenUpgrade,
  preselectedExamProfile
}: AiSubjectiveEvaluatorProps) {
  const [questions, setQuestions] = useState<SubjectiveQuestion[]>(INITIAL_SUBJECTIVE_QUESTIONS);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    INITIAL_SUBJECTIVE_QUESTIONS[0]?.id || 'subj_001'
  );
  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<SubjectiveAnswerEvaluation | null>(null);
  const [copiedModelAnswer, setCopiedModelAnswer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Speech-to-text dictation
  const { isListening, toggleListening, transcript } = useSpeechToText({
    lang: lang === 'np' ? 'ne-NP' : 'en-US',
    onTranscript: (t) => {
      setCandidateAnswer(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + t);
    }
  });

  // Load Subjective Questions from backend
  useEffect(() => {
    fetch('/api/subjective-questions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data);
          if (preselectedExamProfile) {
            const matched = data.find(q => q.examProfile.toLowerCase().includes(preselectedExamProfile.toLowerCase()));
            if (matched) setSelectedQuestionId(matched.id);
          } else {
            setSelectedQuestionId(data[0].id);
          }
        }
      })
      .catch(err => console.error('Failed to load subjective questions:', err));
  }, [preselectedExamProfile]);

  // Timer counter
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const activeQuestion = questions.find(q => q.id === selectedQuestionId) || questions[0] || INITIAL_SUBJECTIVE_QUESTIONS[0];
  const wordCount = candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).length : 0;
  const isPro = subscription?.tier === 'pro' || subscription?.tier === 'yearly_pro';

  const handleStartWriting = () => {
    setIsTimerRunning(true);
  };

  const handleEvaluate = async () => {
    if (!activeQuestion) return;
    if (!candidateAnswer.trim() || wordCount < 15) {
      alert(lang === 'np' ? 'कृपया कम्तिमा १५ शब्दको उत्तर लेख्नुहोस्।' : 'Please write at least 15 words before submitting for evaluation.');
      return;
    }

    setIsEvaluating(true);
    setIsTimerRunning(false);

    try {
      const res = await fetch('/api/subjective-evaluations/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          candidateAnswer,
          userName: userProfile.name || 'Candidate',
          userId: userProfile.id || 'candidate_user'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setEvaluationResult(data);
      } else {
        alert(data.error || 'Evaluation failed. Please try again.');
      }
    } catch (err) {
      console.error('Subjective eval error:', err);
      alert('Network error while evaluating answer.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCopyModelAnswer = () => {
    if (evaluationResult?.modelAnswer) {
      navigator.clipboard.writeText(evaluationResult.modelAnswer);
      setCopiedModelAnswer(true);
      setTimeout(() => setCopiedModelAnswer(false), 2000);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-purple-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>{lang === 'np' ? 'लोक सेवा द्वितीय चरण: AI लिखित उत्तर परीक्षक' : 'Lok Sewa Phase 2: AI Subjective Paper Evaluator'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {lang === 'np' ? 'विषयगत लिखित परीक्षा मूल्यांकन प्रणाली' : 'Subjective Answer Rubric & Model Evaluator'}
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
              {lang === 'np'
                ? 'शाखा अधिकृत र नासुका द्वितीय पत्रका उत्तरहरू तत्काल पेश गर्नुहोस् र आयोगको आधिकारिक मापदण्ड (कानुनी दफा, प्रशासनिक संरचना, सकारात्मक पक्ष तथा आदर्श उत्तर) अनुसार विस्तृत प्राप्ताङ्क प्राप्त गर्नुहोस्।'
                : 'Submit your typed or spoken answers for Section Officer / NaSu subjective papers to receive instant rubric scoring, legal citation auditing, weaknesses analysis, and high-scoring model answers.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] text-purple-300 block uppercase font-mono">Evaluation Standard</span>
              <span className="text-xs font-bold text-white">Lok Sewa Marking Rubric</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question Selection & Answer Workspace (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Question Selector Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Select Written Question (लिखित प्रश्न छान्नुहोस्)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {activeQuestion.marks} Full Marks ({activeQuestion.timeLimitMinutes} Mins)
              </span>
            </div>

            {/* Question Dropdown */}
            <select
              value={selectedQuestionId}
              onChange={(e) => {
                setSelectedQuestionId(e.target.value);
                setEvaluationResult(null);
                setCandidateAnswer('');
                setTimerSeconds(0);
                setIsTimerRunning(false);
              }}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {questions.map(q => (
                <option key={q.id} value={q.id}>
                  [{q.examProfile}] - {q.subject}: {q.questionText.substring(0, 70)}...
                </option>
              ))}
            </select>

            {/* Active Question Box */}
            <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                  Target Exam: {activeQuestion.examProfile} • {activeQuestion.subject}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 leading-snug">
                  {lang === 'np' ? activeQuestion.questionTextNp : activeQuestion.questionText}
                </h3>
              </div>

              {/* Statutory References to Cover */}
              <div className="space-y-1.5 pt-1 border-t border-purple-100 dark:border-purple-900/30">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-purple-600" />
                  Expected Legal & Constitutional Citations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeQuestion.statutoryReferences.map((ref, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-mono border border-purple-200 dark:border-purple-800"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Written Answer Composition Canvas */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {lang === 'np' ? 'तपाईंको लिखित उत्तर (Type or Speak)' : 'Your Written Response'}
                </span>
                <span className="text-xs text-slate-400">
                  ({wordCount} / {activeQuestion.wordLimit} words)
                </span>
              </div>

              {/* Timer & Dictation Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{formatTimer(timerSeconds)}</span>
                </div>

                <button
                  type="button"
                  onClick={toggleListening}
                  title="Speak in Nepali or English"
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-purple-600" />}
                  <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
                </button>
              </div>
            </div>

            {/* Main Textarea */}
            <div className="relative">
              <textarea
                value={candidateAnswer}
                onChange={(e) => {
                  setCandidateAnswer(e.target.value);
                  if (!isTimerRunning && e.target.value.length > 0) {
                    setIsTimerRunning(true);
                  }
                }}
                onFocus={handleStartWriting}
                placeholder={
                  lang === 'np'
                    ? 'यहाँ आफ्नो उत्तर टाइप गर्नुहोस् वा माथिको Voice Dictate बटन थिचेर नेपालीमा बोल्नुहोस्... (उदाहरण: विषय प्रवेश, सैद्धान्तिक तथा कानुनी आधार, समस्याहरू, र निष्कर्ष)'
                    : 'Compose your answer here or click Voice Dictate to speak in Nepali/English... Include introduction, constitutional/statutory articles, analysis, and recommendations.'
                }
                rows={12}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-relaxed border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans"
              />
            </div>

            {/* Submission Row */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCandidateAnswer('');
                  setEvaluationResult(null);
                  setTimerSeconds(0);
                  setIsTimerRunning(false);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Clear Answer
              </button>

              <button
                type="button"
                onClick={handleEvaluate}
                disabled={isEvaluating || candidateAnswer.trim().length < 15}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs shadow-lg transition ${
                  isEvaluating || candidateAnswer.trim().length < 15
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/25'
                }`}
              >
                {isEvaluating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating against Lok Sewa Rubric...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Evaluate with Lok Sewa AI</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Instant Evaluation Feedback & Model Answer (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {evaluationResult ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 animate-scale-up">
              {/* Score & Grade Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 rounded-2xl border border-purple-200/50 dark:border-purple-900/50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 block">
                    Awarded Score
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                      {evaluationResult.totalScore}
                    </span>
                    <span className="text-sm text-slate-500 font-semibold">
                      / {evaluationResult.maxMarks} Marks ({evaluationResult.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-xs">
                    {evaluationResult.grade}
                  </span>
                </div>
              </div>

              {/* Rubric Criteria Breakdown */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  Marking Rubric Breakdown
                </h4>

                <div className="space-y-2 text-xs">
                  {/* Relevance */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>1. Relevance & Subject Coverage</span>
                      <span className="text-purple-600">{evaluationResult.rubric.relevanceScore} / 2.5</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{evaluationResult.rubric.relevanceFeedback}</p>
                  </div>

                  {/* Constitutional & Legal Citations */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>2. Statutory & Constitutional Citations</span>
                      <span className="text-purple-600">{evaluationResult.rubric.legalConstitutionalScore} / 2.5</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{evaluationResult.rubric.legalConstitutionalFeedback}</p>
                  </div>

                  {/* Structure & Presentation */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>3. Structure & Logical Flow</span>
                      <span className="text-purple-600">{evaluationResult.rubric.structurePresentationScore} / 2.5</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{evaluationResult.rubric.structureFeedback}</p>
                  </div>

                  {/* Nepal Context & Examples */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>4. Nepal Practical Context & Solutions</span>
                      <span className="text-purple-600">{evaluationResult.rubric.nepalContextExamplesScore} / 2.5</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{evaluationResult.rubric.nepalContextFeedback}</p>
                  </div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {/* Strengths */}
                <div className="space-y-1.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Key Strengths (सकारात्मक पक्षहरू)
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                    {(lang === 'np' && evaluationResult.strengthsNp ? evaluationResult.strengthsNp : evaluationResult.strengths).map((st, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="space-y-1.5 pt-1">
                  <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Areas for Improvement (सुधारका क्षेत्रहरू)
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                    {(lang === 'np' && evaluationResult.improvementsNp ? evaluationResult.improvementsNp : evaluationResult.improvements).map((imp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Model Answer Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Benchmark Model Answer (आदर्श उत्तर)
                  </span>
                  <button
                    onClick={handleCopyModelAnswer}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  >
                    {copiedModelAnswer ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedModelAnswer ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-700 dark:text-slate-300 text-xs leading-relaxed max-h-56 overflow-y-auto border border-slate-100 dark:border-slate-800 font-sans whitespace-pre-wrap">
                  {evaluationResult.modelAnswer}
                </div>
              </div>
            </div>
          ) : (
            /* Standby Guide Card */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {lang === 'np' ? 'आयोगको मापदण्ड अनुसार तत्काल नतिजा' : 'Official Lok Sewa Subjective Evaluation'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Write your answer in the canvas on the left. The AI Evaluator assesses your legal grounding, statutory citations, and solution clarity against actual PSC scoring benchmarks.
                </p>
              </div>

              <div className="space-y-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Audits Constitutional & Legal references</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Scale className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Generates complete benchmark model answers</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Word count & time management tracking</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
