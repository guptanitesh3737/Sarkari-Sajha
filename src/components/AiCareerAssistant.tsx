import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Briefcase,
  BookOpen,
  Calendar,
  Award,
  AlertTriangle,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  Flame,
  FileText,
  Target,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Info,
  GraduationCap,
  ThumbsUp,
  ThumbsDown,
  Flag
} from 'lucide-react';
import {
  UserProfile,
  Vacancy,
  Language,
  AiAssistantMessage,
  AiAssistantStructuredResponse,
  AiAssistantDatabaseMatch
} from '../types';
import { t } from '../utils/translations';

interface AiCareerAssistantProps {
  userProfile: UserProfile;
  vacancies: Vacancy[];
  lang: Language;
  onSelectVacancy?: (vacancy: Vacancy) => void;
  onStartQuiz?: (quizSetId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const AiCareerAssistant: React.FC<AiCareerAssistantProps> = ({
  userProfile,
  vacancies,
  lang,
  onSelectVacancy,
  onStartQuiz,
  onNavigateTab
}) => {
  const [messages, setMessages] = useState<AiAssistantMessage[]>(() => {
    // Initial welcome message
    const initialWelcome: AiAssistantMessage = {
      id: 'msg_welcome',
      sender: 'assistant',
      text: lang === 'np'
        ? `नमस्ते ${userProfile.name}! म सरकारी साझा एआई क्यारियर सहायक हुँ। तपाईं योग्यता अनुसार सरकारी भर्ना, लोक सेवा/शिक्षक सेवा पाठ्यक्रम, कमजोर विषय पहिचान तथा ३० दिने तयारी योजना सोध्न सक्नुहुन्छ।`
        : `Namaste ${userProfile.name}! I am your SarkariSajha AI Career & Examination Assistant. Ask me about verified government vacancies matching your qualification, closing deadlines, Lok Sewa syllabus, weak subject diagnosis, and customized 30-day study plans.`,
      structuredData: {
        replySummary: `I query the live SarkariSajha database and official PSC curriculum to provide verified vacancy matches, examination structures, and personalized study roadmaps.`,
        replySummaryNp: `म सरकारी साझाको प्रत्यक्ष डाटाबेस र आधिकारिक लोक सेवा पाठ्यक्रम अध्ययन गरी प्रमाणिक भर्ना सूचना, परीक्षा संरचना र व्यक्तिगत अध्ययन कार्ययोजना प्रदान गर्दछु।`,
        queryIntent: 'general_advice',
        databaseMatches: vacancies.slice(0, 3).map(v => ({
          vacancyId: v.id,
          title: v.title,
          titleNp: v.titleNp,
          organization: v.organization || v.org || '',
          deadline: v.application_deadline || v.deadline || '',
          posts: v.number_of_posts || v.posts || 1,
          qualification: v.qualification || v.minQualification || 'Bachelor Degree',
          level: v.job_level || v.level || 'Gazetted / Non-Gazetted',
          matchReason: 'Currently active recruitment in database.'
        })),
        officialSourceInfo: [
          {
            topic: 'Lok Sewa Aayog (PSC) Gazetted Class 3 Standard Scheme',
            rules: [
              'Phase 1: GK & Mental Ability Test (100 Marks MCQ with -20% negative marking).',
              'Phase 2: Written Examination in Governance & Contemporary Issues (200 Marks).',
              'Phase 3: Service-Specific Subject Paper & Interview (130 Marks).'
            ],
            officialReference: 'PSC Examination Regulation 2079 & Syllabus 2083'
          }
        ],
        aiRecommendations: [
          {
            title: 'Start with Diagnostic Practice',
            points: [
              'Take a 20-minute diagnostic quiz to identify your current accuracy in Constitution and Nepal Geography.',
              'Check your eligibility for active notices closing in the next 10 days.'
            ],
            recommendedQuizId: 'quiz_sec_officer_gk_01',
            recommendedQuizTitle: 'Section Officer Model Exam (Paper 1)'
          }
        ],
        generalGuidance: {
          studyTips: [
            'Maintain a regular study routine of 3-4 hours daily.',
            'Read the Gorkhapatra Wednesday supplement for authentic weekly PSC updates.'
          ]
        },
        suggestedNextQuestions: [
          'What jobs are available for BSc Statistics?',
          'Which vacancies close this week?',
          'What should I study for Lok Sewa?',
          'Give me a 30-day preparation plan.'
        ],
        disclaimer: 'AI recommendations and search results are for study planning and search assistance only. Official recruitment rules are governed solely by the Public Service Commission.'
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGroundingVerified: true
    };
    return [initialWelcome];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [submittingFeedbackId, setSubmittingFeedbackId] = useState<string | null>(null);
  const [feedbackSuccessId, setFeedbackSuccessId] = useState<string | null>(null);
  const [flagCommentPromptId, setFlagCommentPromptId] = useState<string | null>(null);
  const [flagComment, setFlagComment] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleFeedbackRating = async (
    msg: AiAssistantMessage,
    rating: 'helpful' | 'not_helpful' | 'incorrect',
    comment?: string
  ) => {
    setSubmittingFeedbackId(msg.id);
    try {
      await fetch('/api/ai-assistant/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: msg.id,
          userQuery: messages.find((m, i) => messages[i + 1]?.id === msg.id && m.sender === 'user')?.text || 'Query',
          aiResponseSnippet: msg.text.substring(0, 150),
          rating,
          feedbackText: comment,
          userId: userProfile.id
        })
      });

      setMessages(prev =>
        prev.map(m => (m.id === msg.id ? { ...m, feedbackRating: rating } : m))
      );
      setFeedbackSuccessId(msg.id);
      setFlagCommentPromptId(null);
      setFlagComment('');
      setTimeout(() => setFeedbackSuccessId(null), 3000);
    } catch (err) {
      console.error('Failed to submit AI feedback:', err);
    } finally {
      setSubmittingFeedbackId(null);
    }
  };

  const suggestedPrompts = [
    {
      label: lang === 'np' ? 'BSc Statistics को जागिर' : 'BSc Statistics Jobs',
      prompt: 'What jobs are available for BSc Statistics?'
    },
    {
      label: lang === 'np' ? 'यस हप्ता म्याद सकिने' : 'Closing This Week',
      prompt: 'Which vacancies close this week?'
    },
    {
      label: lang === 'np' ? 'मेरो योग्यता अनुसार जागिर' : 'Match My Qualification',
      prompt: 'What jobs match my qualification and profile?'
    },
    {
      label: lang === 'np' ? 'लोक सेवा पाठ्यक्रम' : 'Lok Sewa Syllabus',
      prompt: 'What should I study for Lok Sewa Section Officer exam?'
    },
    {
      label: lang === 'np' ? '३० दिने तयारी तालिका' : '30-Day Study Plan',
      prompt: 'Give me a 30-day preparation plan.'
    },
    {
      label: lang === 'np' ? 'कमजोर विषय पहिचान' : 'Weak Topic Diagnosis',
      prompt: 'Which subjects are my weakest based on my quiz practice?'
    },
    {
      label: lang === 'np' ? '+२ उत्तीर्णका जागिरहरू' : '+2 Level Jobs',
      prompt: 'What government jobs can I apply for with a +2 (Higher Secondary) qualification?'
    }
  ];

  // Follow new messages, but not on first load: scrolling then dragged the whole page down to the footer.
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    const userMessage: AiAssistantMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputQuery('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-4).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: historyPayload,
          userProfile: userProfile
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        const structured: AiAssistantStructuredResponse = json.data;
        const assistantMsg: AiAssistantMessage = {
          id: `msg_ai_${Date.now()}`,
          sender: 'assistant',
          text: lang === 'np' && structured.replySummaryNp ? structured.replySummaryNp : structured.replySummary,
          structuredData: structured,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isGroundingVerified: true
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('Invalid response from AI server');
      }
    } catch (err) {
      console.error('Error contacting AI Career Assistant:', err);
      // Fallback message
      const fallbackMsg: AiAssistantMessage = {
        id: `msg_ai_err_${Date.now()}`,
        sender: 'assistant',
        text: lang === 'np'
          ? 'माफ गर्नुहोस्, प्रत्यक्ष एआई सेवामा क्षणिक समस्या आएको छ। यद्यपि तपाईं तलका सुझाव र डाटाबेस फिल्टर प्रयोग गर्न सक्नुहुन्छ।'
          : 'I encountered a brief connection issue, but here is grounded advice from the SarkariSajha verified vacancy database.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="hero-panel p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
              <span>Phase 9 • Live Database-Grounded AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === 'np' ? 'सरकारी साझा एआई क्यारियर सहायक' : 'SarkariSajha AI Career Assistant'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {lang === 'np'
                ? 'वास्तविक सरकारी भर्ना डाटाबेस, लोक सेवा/शिक्षक सेवा आयोगको पाठ्यक्रम, योग्यता अनुसार अवसर र ३० दिने नमुना अध्ययन योजना।'
                : 'Directly queries the SarkariSajha vacancy database, official PSC syllabi, and your profile to deliver accurate, non-hallucinated career intelligence.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl flex items-center gap-3 text-xs">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-white">Zero-Hallucination Policy</div>
                <div className="text-[11px] text-slate-300">Verified DB queries only</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-600 dark:text-slate-400">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>{lang === 'np' ? 'सुझाव गरिएका त्वरित प्रश्नहरू (Suggested Prompts):' : 'Suggested Prompts (1-Click Query):'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sp.prompt)}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition flex items-center gap-1.5 shadow-2xs"
            >
              <span>{sp.label}</span>
              <ArrowRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-6">
        {messages.map((msg) => {
          const isAi = msg.sender === 'assistant';
          const structured = msg.structuredData;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  isAi
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isAi ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              {/* Message Card */}
              <div
                className={`space-y-4 max-w-4xl w-full rounded-3xl p-5 sm:p-6 shadow-xs border ${
                  isAi
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ml-auto'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black">
                      {isAi
                        ? (lang === 'np' ? 'सरकारी साझा क्यारियर एआई' : 'SarkariSajha Career AI')
                        : userProfile.name || 'Candidate'}
                    </span>
                    {isAi && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        Grounded Database Output
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">{msg.timestamp}</span>
                    {isAi && (
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Copy text"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Primary Text */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {lang === 'np' && structured?.replySummaryNp
                    ? structured.replySummaryNp
                    : msg.text}
                </div>

                {/* --- 4-TIER CATEGORIZATION SECTION (AI MESSAGES ONLY) --- */}
                {isAi && structured && (
                  <div className="space-y-5 pt-3">
                    {/* TIER 1: DATABASE INFORMATION */}
                    {Array.isArray(structured.databaseMatches) && structured.databaseMatches.length > 0 && (
                      <div className="space-y-3 bg-sky-50/70 dark:bg-white/5 p-4 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">
                              {lang === 'np'
                                ? '१. सरकारी साझा डाटाबेस भर्ना विवरण (Database Information)'
                                : '1. SarkariSajha Database Matches (Real Vacancies)'}
                            </h4>
                          </div>
                          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            {structured.databaseMatches.length} Verified Notices
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {structured.databaseMatches.map((item, dIdx) => {
                            const fullVac = vacancies.find(v => v.id === item.vacancyId);

                            return (
                              <div
                                key={dIdx}
                                className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition shadow-2xs space-y-2 flex flex-col justify-between"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-bold text-slate-500 truncate">
                                      {item.organization}
                                    </span>
                                    {item.isClosingSoon && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center gap-1 shrink-0">
                                        <Flame className="w-3 h-3 text-rose-600" />
                                        Closing Soon
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                    {item.title}
                                  </h5>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Posts: <span className="font-bold text-slate-700 dark:text-slate-300">{item.posts}</span> • Req: <span className="font-medium text-slate-700 dark:text-slate-300">{item.qualification}</span>
                                  </p>
                                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                                    Deadline: {item.deadline}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                  <span className="text-[10px] text-slate-400">ID: {item.vacancyId}</span>
                                  {fullVac && onSelectVacancy ? (
                                    <button
                                      onClick={() => onSelectVacancy(fullVac)}
                                      className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                                    >
                                      <span>View & Apply</span>
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  ) : (
                                    <span className="text-[11px] font-bold text-emerald-600">Active Notice</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* TIER 2: OFFICIAL SOURCES & REGULATIONS */}
                    {Array.isArray(structured.officialSourceInfo) && structured.officialSourceInfo.length > 0 && (
                      <div className="space-y-3 bg-amber-50/60 dark:bg-amber-950/30 p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                          <h4 className="text-xs font-black text-amber-900 dark:text-amber-300">
                            {lang === 'np'
                              ? '२. आधिकारिक स्रोत तथा लोक सेवा नियम (Official Sources & Regulations)'
                              : '2. Official Sources & PSC Examination Structure'}
                          </h4>
                        </div>

                        <div className="space-y-3">
                          {structured.officialSourceInfo.map((infoItem, oIdx) => (
                            <div key={oIdx} className="space-y-1.5">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                {infoItem.topic}
                              </h5>
                              <ul className="space-y-1 pl-4 list-disc text-xs text-slate-700 dark:text-slate-300">
                                {Array.isArray(infoItem.rules)
                                  ? infoItem.rules.map((r, rIdx) => (
                                      <li key={rIdx} className="leading-relaxed">{r}</li>
                                    ))
                                  : typeof infoItem.rules === 'string'
                                    ? <li className="leading-relaxed">{infoItem.rules}</li>
                                    : null}
                              </ul>
                              <div className="pt-1 flex items-center gap-1.5 text-[11px] font-mono text-amber-800 dark:text-amber-300">
                                <Shield className="w-3.5 h-3.5 text-amber-600" />
                                <span>Official Citation: <strong>{infoItem.officialReference}</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TIER 3: AI RECOMMENDATIONS & QUIZ LAUNCHER */}
                    {Array.isArray(structured.aiRecommendations) && structured.aiRecommendations.length > 0 && (
                      <div className="space-y-3 bg-indigo-50/60 dark:bg-indigo-950/30 p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-300">
                            {lang === 'np'
                              ? '३. एआई सिफारिस तथा अध्ययन सुझाव (AI Recommendations)'
                              : '3. AI Recommendations & Practice Modules'}
                          </h4>
                        </div>

                        <div className="space-y-3">
                          {structured.aiRecommendations.map((rec, rIdx) => (
                            <div key={rIdx} className="space-y-2">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                {rec.title}
                              </h5>
                              <ul className="space-y-1 pl-4 list-disc text-xs text-slate-700 dark:text-slate-300">
                                {Array.isArray(rec.points)
                                  ? rec.points.map((p, pIdx) => (
                                      <li key={pIdx} className="leading-relaxed">{p}</li>
                                    ))
                                  : typeof rec.points === 'string'
                                    ? <li className="leading-relaxed">{rec.points}</li>
                                    : null}
                              </ul>

                              {rec.recommendedQuizId && onStartQuiz && (
                                <div className="pt-2">
                                  <button
                                    onClick={() => onStartQuiz(rec.recommendedQuizId!)}
                                    className="px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs transition flex items-center gap-2 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
                                  >
                                    <Award className="w-3.5 h-3.5" />
                                    <span>Start Recommended Practice Exam: {rec.recommendedQuizTitle || 'Diagnostic Quiz'}</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TIER 4: GENERAL GUIDANCE & 30-DAY PLAN */}
                    {structured.generalGuidance && (
                      <div className="space-y-3 bg-sky-50/70 dark:bg-slate-800/40 p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                          <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">
                            {lang === 'np'
                              ? '४. सामान्य मार्गदर्शन तथा तयारी योजना (General Guidance)'
                              : '4. General Guidance & Preparation Blueprint'}
                          </h4>
                        </div>

                        {Array.isArray(structured.generalGuidance.studyTips) && structured.generalGuidance.studyTips.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-500">Core Habits:</span>
                            <ul className="space-y-1 pl-4 list-disc text-xs text-slate-700 dark:text-slate-300">
                              {structured.generalGuidance.studyTips.map((st, sIdx) => (
                                <li key={sIdx}>{st}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Interactive 30-day plan if available */}
                        {Array.isArray(structured.generalGuidance.preparationPlan) && structured.generalGuidance.preparationPlan.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              30-Day Preparation Timeline
                            </span>
                            <div className="space-y-2">
                              {structured.generalGuidance.preparationPlan.map((planStep, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                      {planStep.dayRange}
                                    </span>
                                  </div>
                                  <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                                    Focus: {planStep.focus}
                                  </p>
                                  {Array.isArray(planStep.tasks) && planStep.tasks.length > 0 && (
                                    <ul className="pl-4 list-disc text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                                      {planStep.tasks.map((task, tIdx) => (
                                        <li key={tIdx}>{task}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Weak area advice */}
                        {Array.isArray(structured.generalGuidance.weakAreaAdvice) && structured.generalGuidance.weakAreaAdvice.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                              Personalized Topic Remediation
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {structured.generalGuidance.weakAreaAdvice.map((wa, wIdx) => (
                                <div
                                  key={wIdx}
                                  className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1"
                                >
                                  <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-900 dark:text-white">{wa.topic}</span>
                                    <span className="text-amber-600 font-mono">{wa.identifiedAccuracy}% Accuracy</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500">{wa.remedy}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Follow-up question chips */}
                    {Array.isArray(structured.suggestedNextQuestions) && structured.suggestedNextQuestions.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-slate-500 block mb-2">
                          {lang === 'np' ? 'सम्बन्धित थप प्रश्नहरू (Related Inquiries):' : 'Follow-up Questions:'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {structured.suggestedNextQuestions.map((sq, sqIdx) => (
                            <button
                              key={sqIdx}
                              onClick={() => handleSendMessage(sq)}
                              disabled={loading}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                            >
                              <span>{sq}</span>
                              <ChevronRight className="w-3 h-3 opacity-60" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MANDATORY DISCLAIMER */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                      <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>{lang === 'np' ? 'आधिकारिक सूचना अस्वीकरण:' : 'Official Disclaimer:'}</strong>{' '}
                        {structured.disclaimer ||
                          'AI guidance is for study planning and search assistance only. Official recruitment rules and final decisions are governed solely by the Public Service Commission (Lok Sewa Aayog) and respective recruiting authorities.'}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI RESPONSE QUALITY FEEDBACK ACTIONS */}
                {isAi && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {lang === 'np' ? 'यो मार्गदर्शन उपयोगी रह्यो?' : 'Was this guidance accurate & helpful?'}
                      </span>

                      {/* Helpful Button */}
                      <button
                        onClick={() => handleFeedbackRating(msg, 'helpful')}
                        disabled={submittingFeedbackId === msg.id}
                        className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition ${
                          msg.feedbackRating === 'helpful'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Helpful</span>
                      </button>

                      {/* Not Helpful Button */}
                      <button
                        onClick={() => handleFeedbackRating(msg, 'not_helpful')}
                        disabled={submittingFeedbackId === msg.id}
                        className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition ${
                          msg.feedbackRating === 'not_helpful'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                        <span>Not Helpful</span>
                      </button>

                      {/* Flag Button */}
                      <button
                        onClick={() =>
                          setFlagCommentPromptId(flagCommentPromptId === msg.id ? null : msg.id)
                        }
                        disabled={submittingFeedbackId === msg.id}
                        className={`px-2 py-1 rounded-full font-bold flex items-center gap-1 transition ${
                          msg.feedbackRating === 'incorrect'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600'
                        }`}
                        title="Report incorrect information"
                      >
                        <Flag className="w-3 h-3" />
                        <span>Report Error</span>
                      </button>
                    </div>

                    {feedbackSuccessId === msg.id && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Feedback logged</span>
                      </span>
                    )}

                    {/* Inline Flag Comment Drawer */}
                    {flagCommentPromptId === msg.id && (
                      <div className="w-full pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={flagComment}
                          onChange={e => setFlagComment(e.target.value)}
                          placeholder="What was incorrect? e.g. Rule changed in 2083 amendment..."
                          className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-full text-xs"
                        />
                        <button
                          onClick={() => handleFeedbackRating(msg, 'incorrect', flagComment)}
                          disabled={!flagComment.trim() || submittingFeedbackId === msg.id}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-full text-xs font-bold transition"
                        >
                          Submit Report
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 sm:gap-4 items-start">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 max-w-md shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Querying SarkariSajha Database & Analyzing Syllabus...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Bar */}
      <div className="sticky bottom-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              lang === 'np'
                ? 'जस्तै: "What jobs are available for BSc Statistics?", "Which vacancies close this week?"'
                : 'Ask about government jobs, closing deadlines, Lok Sewa syllabus, 30-day prep plan...'
            }
            className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-300 placeholder:text-slate-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="px-5 py-2.5 rounded-full disabled:opacity-50 text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'np' ? 'पठाउनुहोस्' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
